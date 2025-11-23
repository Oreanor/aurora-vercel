'use client';

import { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Position,
  useReactFlow,
  NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network, UserStar, X } from 'lucide-react';
import { FamilyTreeData, Person, Relationship } from '@/types/family';
import { findMainPersonId, getPersonFullName, canAddParent, relationshipExists, findAllAncestorIds } from '@/lib/utils';
import FamilyNode from './family-node';
import SpouseRingNode from './spouse-ring-node';
import PersonDetailsPanel from './person-details-panel';
import AddPersonPanel from './add-person-panel';
import Button from '@/components/ui/button';

interface Props {
  data: FamilyTreeData;
  className?: string;
  currentUserEmail?: string; // Email of the current user for displaying the tree relative to them
}

/**
 * Transforms family tree data into React Flow format
 * @param data - family tree data
 * @param currentUserEmail - current user's email (optional). If provided, the tree will be displayed relative to this user
 * @param selectedNodeId - ID of the selected node (optional)
 * @param rootPersonId - ID of the root person (optional). If provided, this person will be the root, overriding email-based selection
 * @param showDescendants - if true, show descendants (root at top), if false, show ancestors (root at bottom)
 */
function transformToFlowData(data: FamilyTreeData, currentUserEmail?: string, selectedNodeId?: string, rootPersonId?: string, showDescendants: boolean = false) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Determine the main person (root node of the tree)
  // If rootPersonId is provided, use it directly; otherwise use email-based lookup
  let mainPersonId = rootPersonId || findMainPersonId(
    data.persons,
    data.relationships,
    currentUserEmail
  );
  
  // Validate mainPersonId - if empty or invalid, use first person as fallback
  if (!mainPersonId || !data.persons.find(p => p.id === mainPersonId)) {
    if (data.persons.length > 0) {
      mainPersonId = data.persons[0].id;
    } else {
      // No persons in tree, return empty nodes/edges
      return { nodes: [], edges: [] };
    }
  }
  
  // Build tree based on mode: ancestors (upward) or descendants (downward)
  const levelsFromMain = new Map<string, number>();
  
  // Main person at level 0
  levelsFromMain.set(mainPersonId, 0);
  
  if (showDescendants) {
    // DESCENDANTS MODE: Build tree downward from root
    // Main person = level 0, their children = level 1, grandchildren = level 2, etc.
    let currentLevel = 0;
    let toProcess = [mainPersonId];
    const processed = new Set<string>([mainPersonId]);
    
    while (toProcess.length > 0) {
      const nextLevel: string[] = [];
      
      // Process all people at the current level
      toProcess.forEach((personId) => {
        // Find all children of this person (downward)
        const children = data.relationships
          .filter((rel) => rel.parentId === personId)
          .map((rel) => rel.childId)
          .filter((childId) => !processed.has(childId));
        
        children.forEach((childId) => {
          // Don't change main person level (should stay at 0)
          if (childId === mainPersonId) return;
          
          // Set child level (positive for descendants mode)
          const childLevel = currentLevel + 1;
          levelsFromMain.set(childId, childLevel);
          
          if (!processed.has(childId)) {
            nextLevel.push(childId);
            processed.add(childId);
          }
        });
      });
      
      toProcess = nextLevel;
      currentLevel++;
    }
  } else {
    // ANCESTORS MODE: Build tree upward from root (current behavior)
    // Main person = level 0, their parents = level 1, grandparents = level 2, etc.
    let currentLevel = 0;
    let toProcess = [mainPersonId];
    const processed = new Set<string>([mainPersonId]);
    
    while (toProcess.length > 0) {
      const nextLevel: string[] = [];
      
      // Process all people at the current level
      toProcess.forEach((personId) => {
        // Find all parents of this person (upward)
        const parents = data.relationships
          .filter((rel) => rel.childId === personId)
          .map((rel) => rel.parentId)
          .filter((pid) => !processed.has(pid));
        
        parents.forEach((parentId) => {
          // Don't change main person level (should stay at 0)
          if (parentId === mainPersonId) return;
          
          // Set parent level
          const parentLevel = currentLevel + 1;
          levelsFromMain.set(parentId, parentLevel);
          
          if (!processed.has(parentId)) {
            nextLevel.push(parentId);
            processed.add(parentId);
          }
        });
      });
      
      toProcess = nextLevel;
      currentLevel++;
    }
  }
  
  // Process remaining people (if there are isolated nodes)
  data.persons.forEach((person) => {
    if (!levelsFromMain.has(person.id)) {
      // If person has no connection to main person, set high level (will be filtered out)
      levelsFromMain.set(person.id, 999);
    }
  });
  
  // Simple alignment: parents of the same child should be at the same level
  // Since we only show ancestors, all parents will have positive levels
  const childrenByParents = new Map<string, Set<string>>();
  data.relationships.forEach((rel) => {
    const childId = rel.childId;
    if (!childrenByParents.has(childId)) {
      childrenByParents.set(childId, new Set());
    }
    childrenByParents.get(childId)!.add(rel.parentId);
  });
  
  // Align parents of the same child to the maximum level among them
  // Only process children that are actually in the tree (connected to root through ancestors)
  childrenByParents.forEach((parentIds, childId) => {
    if (parentIds.size <= 1) return; // One parent - no need to align
    
    // Only process if child is in the tree and has a valid level (not 999)
    const childLevel = levelsFromMain.get(childId);
    if (childLevel === undefined || childLevel === 999) return;
    
    const parentLevels = Array.from(parentIds)
      .map((pid) => {
        const level = levelsFromMain.get(pid);
        return level !== undefined && level !== 999 ? level : null;
      })
      .filter((d): d is number => d !== null);
    
    // Only align if all parents are in the tree and have valid levels
    if (parentLevels.length === parentIds.size && parentLevels.length > 0) {
      const maxParentLevel = Math.max(...parentLevels);
      
      // Align all parents to the maximum level (but don't change main person)
      parentIds.forEach((pid) => {
        if (pid !== mainPersonId) {
          const currentLevel = levelsFromMain.get(pid);
          // Only update if parent is already in the tree (has valid level)
          if (currentLevel !== undefined && currentLevel !== 999 && currentLevel < maxParentLevel) {
            levelsFromMain.set(pid, maxParentLevel);
          }
        }
      });
    }
  });
  
  // Normalize levels: main person is always at level 0
  // Only ancestors are shown (positive levels: 1, 2, 3, ...)
  // Don't shift levels, keep main person at level 0
  const normalizedLevels = new Map<string, number>();
  levelsFromMain.forEach((level, personId) => {
    if (level === 999) {
      normalizedLevels.set(personId, 999);
    } else {
      // Keep levels as is: main person = 0, ancestors = 1, 2, 3, ...
      normalizedLevels.set(personId, level);
    }
  });

  // Group persons by level
  const personsByLevel = new Map<number, Person[]>();
  data.persons.forEach((person) => {
    const level = normalizedLevels.get(person.id);
    if (level !== undefined && level !== 999) {
    if (!personsByLevel.has(level)) {
      personsByLevel.set(level, []);
    }
    personsByLevel.get(level)!.push(person);
    }
  });

  // Create nodes with positioning relative to descendants
  // Level 0 (main person) at bottom, higher level above
  const nodeWidth = 200; // Node width
  const minSpouseGap = 0; // Minimum distance between edges of spouse nodes (reduced by 10px for closer positioning)
  const minSpouseDistance = nodeWidth + minSpouseGap; // Distance between centers of spouses (node width + gap)
  const basePairSpacing = 400; // Base distance between different parent pairs at the same level
  const minNodeDistance = 250; // Minimum distance between nodes from different branches at the same level
  const levelSpacing = 250; // Distance between levels vertically
  const startY = 500; // Initial position from bottom
  const centerX = 0; // Center horizontally
  
  // Find minimum and maximum normalized levels (excluding isolated nodes)
  const validNormalizedLevels = Array.from(normalizedLevels.values()).filter((l) => l !== 999);
  const minNormalizedLevel = validNormalizedLevels.length > 0 ? Math.min(...validNormalizedLevels) : 0;
  const maxNormalizedLevel = validNormalizedLevels.length > 0 ? Math.max(...validNormalizedLevels) : 0;
  
  // Calculate offset for Y position: main person (level 0) should be at bottom
  // Descendants (level < 0) should be above main person (less Y), ancestors (level > 0) even higher
  // Use: y = startY + (0 - level) * levelSpacing for descendants
  // and y = startY - level * levelSpacing for ancestors
  // Or simpler: y = startY - level * levelSpacing (descendants with negative level will be lower)
  
  // Calculate reduction factor for distance between pairs for each level
  // Higher level (more generations) means smaller distance between different parent pairs
  const getPairSpacing = (level: number): number => {
    if (maxNormalizedLevel === 0) return basePairSpacing;
    // Reduce distance between pairs proportionally to level
    // Level 1: 100%, level 2: 70%, level 3: 50%, etc.
    const reductionFactor = 1 - (level - 1) * 0.3 / maxNormalizedLevel;
    return Math.max(basePairSpacing * reductionFactor, minSpouseDistance * 3);
  };
  
  // Calculate positions for all levels from bottom to top (from main person to ancestors)
  const nodePositions = new Map<string, { x: number; y: number }>();
  
  // Function to check and adjust position to avoid overlaps
  const adjustPositionToAvoidOverlap = (
    desiredX: number,
    y: number,
    level: number,
    excludePersonId?: string,
    spouseId?: string
  ): number => {
    // Get all already placed nodes at this level
    const existingPositions: number[] = [];
    personsByLevel.get(level)?.forEach((person) => {
      if (person.id !== excludePersonId && person.id !== spouseId) {
        const pos = nodePositions.get(person.id);
        if (pos && pos.y === y) {
          existingPositions.push(pos.x);
        }
      }
    });
    
    // Sort positions
    existingPositions.sort((a, b) => a - b);
    
    // Check if desired position overlaps
    let adjustedX = desiredX;
    const hasOverlap = existingPositions.some((x) => Math.abs(x - adjustedX) < minNodeDistance);
    
    if (hasOverlap) {
      // Find nearest free position
      let bestX = adjustedX;
      let minDistance = Infinity;
      
      // Check positions left and right
      for (let offset = minNodeDistance; offset < minNodeDistance * 10; offset += minNodeDistance) {
        // Try left
        const leftX = adjustedX - offset;
        const leftOverlap = existingPositions.some((x) => Math.abs(x - leftX) < minNodeDistance);
        if (!leftOverlap) {
          const distance = Math.abs(leftX - adjustedX);
          if (distance < minDistance) {
            minDistance = distance;
            bestX = leftX;
          }
        }
        
        // Try right
        const rightX = adjustedX + offset;
        const rightOverlap = existingPositions.some((x) => Math.abs(x - rightX) < minNodeDistance);
        if (!rightOverlap) {
          const distance = Math.abs(rightX - adjustedX);
          if (distance < minDistance) {
            minDistance = distance;
            bestX = rightX;
          }
        }
      }
      
      adjustedX = bestX;
    }
    
    return adjustedX;
  };
  
  // Process all levels from minimum to maximum
  // Calculate Y positions based on mode:
  // - Ancestors mode (showDescendants = false): root at bottom, ancestors above
  // - Descendants mode (showDescendants = true): root at top, descendants below
  for (let level = minNormalizedLevel; level <= maxNormalizedLevel; level++) {
    const persons = personsByLevel.get(level) || [];
    
    let y: number;
    if (showDescendants) {
      // DESCENDANTS MODE: root at top, descendants below
      // Root (level 0) at top: y = startY - maxLevel * spacing
      // Descendants (level > 0): y = startY - (maxNormalizedLevel - level) * spacing (below root)
      y = startY - (maxNormalizedLevel - level) * levelSpacing;
    } else {
      // ANCESTORS MODE: root at bottom, ancestors above
      // Root (level 0): y = startY (at bottom)
      // Ancestors (level > 0): y = startY - level * spacing (above root)
      y = startY - level * levelSpacing;
    }
    
    if (level === 0) {
      // Main person in center
      persons.forEach((person) => {
        nodePositions.set(person.id, { x: centerX, y });
      });
    } else if (level > 0) {
      if (showDescendants) {
        // DESCENDANTS MODE: Position descendants relative to their parents (who are above)
        // Group children by their common parents (siblings)
        const siblingGroups = new Map<string, Person[]>();
        
        persons.forEach((person) => {
          // Find all parents of this person at the previous level (level - 1)
          const parents = data.relationships
            .filter((rel) => rel.childId === person.id)
            .map((rel) => rel.parentId)
            .filter((parentId) => {
              const parentLevel = normalizedLevels.get(parentId);
              return parentLevel !== undefined && parentLevel === level - 1;
            });
          
          if (parents.length > 0) {
            // Create group key based on sorted parent IDs
            const parentsKey = parents.sort().join(',');
            
            if (!siblingGroups.has(parentsKey)) {
              siblingGroups.set(parentsKey, []);
            }
            siblingGroups.get(parentsKey)!.push(person);
          }
        });
        
        // Position each sibling group
        siblingGroups.forEach((siblings) => {
          if (siblings.length === 0) return;
          
          // Get parent positions to center siblings below them
          const firstPerson = siblings[0];
          const parents = data.relationships
            .filter((rel) => rel.childId === firstPerson.id)
            .map((rel) => rel.parentId)
            .filter((parentId) => {
              const parentLevel = normalizedLevels.get(parentId);
              return parentLevel !== undefined && parentLevel === level - 1;
            });
          
          const parentPositions = parents
            .map((pid) => nodePositions.get(pid))
            .filter((pos): pos is { x: number; y: number } => pos !== undefined);
          
          if (parentPositions.length > 0) {
            // Center siblings below their parents
            const minParentX = Math.min(...parentPositions.map(p => p.x));
            const maxParentX = Math.max(...parentPositions.map(p => p.x));
            const parentCenterX = (minParentX + maxParentX) / 2;
            
            // Distribute siblings horizontally
            const totalWidth = (siblings.length - 1) * minSpouseDistance;
            const startX = parentCenterX - totalWidth / 2;
            
            siblings.forEach((person, index) => {
              const desiredX = startX + index * minSpouseDistance;
              const adjustedX = adjustPositionToAvoidOverlap(desiredX, y, level, person.id);
              nodePositions.set(person.id, { x: adjustedX, y });
            });
          } else {
            // Fallback: center siblings if no parent positions found
            const totalWidth = (siblings.length - 1) * minSpouseDistance;
            const startX = centerX - totalWidth / 2;
            
            siblings.forEach((person, index) => {
              const desiredX = startX + index * minSpouseDistance;
              const adjustedX = adjustPositionToAvoidOverlap(desiredX, y, level, person.id);
              nodePositions.set(person.id, { x: adjustedX, y });
            });
          }
        });
        
        // Process descendants without parents at the previous level
        persons.forEach((person) => {
          if (!nodePositions.has(person.id)) {
            const adjustedX = adjustPositionToAvoidOverlap(centerX, y, level, person.id);
            nodePositions.set(person.id, { x: adjustedX, y });
          }
        });
      } else {
        // ANCESTORS MODE: Position ancestors relative to their children
        // First, group parents by their common children (spouses)
        const parentGroups = new Map<string, Person[]>();
        
        persons.forEach((person) => {
          // Find all children of this person at the next level down (level - 1)
          const children = data.relationships
            .filter((rel) => rel.parentId === person.id)
            .map((rel) => rel.childId)
            .filter((childId) => {
              const childLevel = normalizedLevels.get(childId);
              return childLevel !== undefined && childLevel === level - 1;
            });
        
        if (children.length > 0) {
          // Create group key based on sorted child IDs
          const childrenKey = children.sort().join(',');
          
          if (!parentGroups.has(childrenKey)) {
            parentGroups.set(childrenKey, []);
          }
          parentGroups.get(childrenKey)!.push(person);
        }
      });
      
      // Get distance between pairs for this level
      const pairSpacing = getPairSpacing(level);
      
      // Sort groups by their children's positions (left to right)
      const sortedGroups = Array.from(parentGroups.entries()).sort(([key1], [key2]) => {
        const children1 = key1.split(',').map((id) => nodePositions.get(id)?.x ?? 0);
        const children2 = key2.split(',').map((id) => nodePositions.get(id)?.x ?? 0);
        const avg1 = children1.reduce((sum, x) => sum + x, 0) / children1.length;
        const avg2 = children2.reduce((sum, x) => sum + x, 0) / children2.length;
        return avg1 - avg2;
      });
      
      // Process each spouse group considering distance between pairs
      sortedGroups.forEach(([childrenKey, parentGroup], groupIndex) => {
        const childrenIds = childrenKey.split(',');
        
        // Calculate average position of all children in this group
        const childPositions = childrenIds
          .map((childId) => nodePositions.get(childId))
          .filter((pos): pos is { x: number; y: number } => pos !== undefined);
        
        if (childPositions.length > 0) {
          const avgChildX = childPositions.reduce((sum, pos) => sum + pos.x, 0) / childPositions.length;
          
          // Calculate desired position of pair center considering distance between pairs
          // First pair in center, others shift left/right
          let pairCenterX = avgChildX;
          if (sortedGroups.length > 1) {
            // Calculate overall center of all children of all groups
            const allChildPositions = sortedGroups.flatMap(([key]) => {
              return key.split(',').map((id) => nodePositions.get(id)?.x ?? 0);
            });
            const overallCenter = allChildPositions.reduce((sum, x) => sum + x, 0) / allChildPositions.length;
            
            // Shift pairs relative to overall center
            const offsetFromCenter = (groupIndex - (sortedGroups.length - 1) / 2) * pairSpacing;
            pairCenterX = overallCenter + offsetFromCenter;
          }
          
          // Sort parents: males left, females right
          const sortedParents = [...parentGroup].sort((a, b) => {
            if (a.gender === 'male' && b.gender !== 'male') return -1;
            if (a.gender !== 'male' && b.gender === 'male') return 1;
            return a.id.localeCompare(b.id);
          });
          
          if (sortedParents.length === 1) {
            // One parent - symmetrically above child
            const person = sortedParents[0];
            const adjustedX = adjustPositionToAvoidOverlap(pairCenterX, y, level, person.id);
            nodePositions.set(person.id, { x: adjustedX, y });
          } else if (sortedParents.length === 2) {
            // Two parents (spouses) - symmetrically above pair center with minimum distance between them
            const [parent1, parent2] = sortedParents;
            
            // Calculate positions symmetrically relative to pair center
            // Distance between spouses is always minimum (10px)
            const halfDistance = minSpouseDistance / 2;
            const desiredX1 = pairCenterX - halfDistance;
            
            // Place first parent
            const adjustedX1 = adjustPositionToAvoidOverlap(desiredX1, y, level, parent1.id, parent2.id);
            nodePositions.set(parent1.id, { x: adjustedX1, y });
            
            // Place second parent symmetrically relative to pair center
            // Calculate actual offset of first parent from center
            const actualOffset1 = pairCenterX - adjustedX1;
            // Second parent should be at the same distance to the right
            const desiredX2Symmetric = pairCenterX + actualOffset1;
            // But not closer than minimum distance between spouses
            const minX2 = adjustedX1 + minSpouseDistance;
            const finalX2 = Math.max(desiredX2Symmetric, minX2);
            
            const adjustedX2 = adjustPositionToAvoidOverlap(finalX2, y, level, parent2.id, parent1.id);
            nodePositions.set(parent2.id, { x: adjustedX2, y });
            
            // Add two yellow rings between spouses
            // Avatars are at node center by X (adjustedX1 and adjustedX2)
            // Avatar is at -30px from top of node, node height is 180px
            // Node center at y, node top at y - 90, avatar at y - 90 + 30 = y - 60
            // Rings should be between avatars and overlap each other
            // Shift them right (toward right spouse) and down (closer to children)
            const centerBetweenAvatars = (adjustedX1 + adjustedX2) / 2;
            const ringOffset = 10; // Offset for ring overlap (rings are 28px, offset 10px = they overlap)
            const rightOffset = 85; // Offset to the right from center
            const ring1X = centerBetweenAvatars - ringOffset + rightOffset;
            const ring2X = centerBetweenAvatars + ringOffset + rightOffset;
            // Position rings below avatars (y - 40 from node center, instead of y - 60)
            const ringY = y + 35;
            
            // Save ring positions for subsequent node creation
            if (!nodePositions.has(`ring-${parent1.id}-${parent2.id}-1`)) {
              nodePositions.set(`ring-${parent1.id}-${parent2.id}-1`, { x: ring1X, y: ringY });
              nodePositions.set(`ring-${parent1.id}-${parent2.id}-2`, { x: ring2X, y: ringY });
            }
          } else {
            // More than two parents - distribute symmetrically with minimum distance between adjacent ones
            sortedParents.forEach((person, index) => {
              const totalWidth = minSpouseDistance * (sortedParents.length - 1);
              const spacing = sortedParents.length > 1 ? totalWidth / (sortedParents.length - 1) : 0;
              const desiredX = pairCenterX - totalWidth / 2 + index * spacing;
              
              const adjustedX = adjustPositionToAvoidOverlap(
                desiredX, 
                y, 
                level, 
                person.id,
                undefined
              );
              nodePositions.set(person.id, { x: adjustedX, y });
            });
          }
        }
      });
      
        // Process parents without children at the next level
        persons.forEach((person) => {
          if (!nodePositions.has(person.id)) {
            const adjustedX = adjustPositionToAvoidOverlap(centerX, y, level, person.id);
            nodePositions.set(person.id, { x: adjustedX, y });
          }
        });
      }
    }
  }
  
  // Create nodes with calculated positions
  // Only create nodes for people who are connected to the root (have a valid level, not 999)
  data.persons.forEach((person) => {
    const level = normalizedLevels.get(person.id);
    // Skip people who are not connected to the root (level 999 or undefined)
    if (level === undefined || level === 999) return;
    
    const position = nodePositions.get(person.id);
    // Skip if position was not calculated (person is not in the tree)
    if (!position) return;
    
    const isMainPerson = person.id === mainPersonId;
    // In descendants mode, root should be a regular node (no special height or trunk)
    // In ancestors mode, root has larger height (450px) to show trunk
    const nodeHeight = isMainPerson && !showDescendants ? 450 : 180;

    nodes.push({
      id: person.id,
      type: 'familyNode',
      position,
      data: {
        person,
        isMainPerson,
        relationships: data.relationships,
        mainPersonId,
        persons: data.persons,
        isSelected: selectedNodeId === person.id,
        showDescendants,
      },
      width: 200,
      height: nodeHeight,
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    });
  });

  // Create edges with thickness depending on level
  // Function to calculate edge thickness based on parent level
  const getStrokeWidth = (parentLevel: number): number => {
    // In descendants mode, all edges are thin (no trunk)
    if (showDescendants) {
      return 4;
    }
    // In ancestors mode: Level 0 (main person) -> 40px, each next level is twice thinner
    const width = 40 / Math.pow(2, parentLevel);
    // Minimum 4px
    return Math.max(Math.round(width), 4);
  };

  // Create edges only for relationships where both parent and child are in the tree
  data.relationships.forEach((rel) => {
    const parentLevel = normalizedLevels.get(rel.parentId);
    const childLevel = normalizedLevels.get(rel.childId);
    
    // Only create edge if both parent and child are connected to root (have valid levels, not 999)
    if (parentLevel === undefined || parentLevel === 999 || 
        childLevel === undefined || childLevel === 999) {
      return;
    }
    
    const strokeWidth = getStrokeWidth(parentLevel);
    
    edges.push({
      id: rel.id,
      source: rel.parentId,
      target: rel.childId,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#793333', strokeWidth },
    });
  });
  
  // Create nodes for yellow rings between spouses
  nodePositions.forEach((position, nodeId) => {
    if (nodeId.startsWith('ring-')) {
      nodes.push({
        id: nodeId,
        type: 'spouseRingNode',
        position,
        data: { size: 28 },
        width: 28,
        height: 28,
        selectable: false,
        draggable: false,
        connectable: false,
      });
    }
  });

  return { nodes, edges };
}

const nodeTypes = {
  familyNode: FamilyNode,
  spouseRingNode: SpouseRingNode,
};

function FlowContent({ nodes, onFitted }: { nodes: Node[]; onFitted: () => void }) {
  const { fitView } = useReactFlow();
  const onFittedRef = useRef(onFitted);
  
  // Update ref when callback changes
  useEffect(() => {
    onFittedRef.current = onFitted;
  }, [onFitted]);

  // Automatically fit view after loading
  useEffect(() => {
    if (nodes.length > 0) {
      const timeoutId = setTimeout(() => {
        fitView({ padding: 0.2, maxZoom: 1.5 });
        // Notify parent component that fitView is applied
        onFittedRef.current();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [fitView, nodes]);

  return null;
}

export default function FamilyTree({ data: initialData, className = '', currentUserEmail }: Props) {
  const [data, setData] = useState<FamilyTreeData>(initialData);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [personToEdit, setPersonToEdit] = useState<Person | null>(null);
  const [isFitted, setIsFitted] = useState(false);
  const [tree, setTree] = useState(false);
  const [isRootUserDialogOpen, setIsRootUserDialogOpen] = useState(false);
  const [selectedRootPersonId, setSelectedRootPersonId] = useState<string | null>(null);
  const [tempSelectedRootPersonId, setTempSelectedRootPersonId] = useState<string | null>(null);
  const prevPersonsCountRef = useRef(0);
  
  // Sync with initialData when it changes
  useEffect(() => {
    const personsCount = initialData.persons.length;
    const prevPersonsCount = prevPersonsCountRef.current;
    
    // Always update data, but reset isFitted only when structure changes
    setData(initialData);
    
    // Reset fitView state only when number of persons changes
    // (this means real change in tree structure)
    if (personsCount !== prevPersonsCount) {
      prevPersonsCountRef.current = personsCount;
      setIsFitted(false);
    }
  }, [initialData]);

  // Callback to notify when fitView is applied
  const handleFitted = useCallback(() => {
    setIsFitted(true);
  }, []);

  // Determine which email to use for tree root: selected root person or current user email
  const rootUserEmail = useMemo(() => {
    if (selectedRootPersonId) {
      const selectedPerson = data.persons.find(p => p.id === selectedRootPersonId);
      return selectedPerson?.email || undefined;
    }
    return currentUserEmail;
  }, [selectedRootPersonId, data.persons, currentUserEmail]);

  // Memoize mainPersonId to avoid recalculating it multiple times
  const mainPersonId = useMemo(() => {
    return findMainPersonId(data.persons, data.relationships, rootUserEmail);
  }, [data.persons, data.relationships, rootUserEmail]);

  const { nodes, edges } = useMemo(
    () => transformToFlowData(data, rootUserEmail, selectedNodeId || undefined, selectedRootPersonId || undefined, tree),
    [data, rootUserEmail, selectedNodeId, selectedRootPersonId, tree]
  );

  // Track tree structure changes (number of nodes) to apply fitView only on real changes
  const nodesCountRef = useRef(nodes.length);
  useEffect(() => {
    if (nodes.length !== nodesCountRef.current) {
      nodesCountRef.current = nodes.length;
      setIsFitted(false);
    }
  }, [nodes.length]);

  // Reset fitView when root user changes
  useEffect(() => {
    setIsFitted(false);
  }, [selectedRootPersonId]);

  const selectedPerson = useMemo(() => {
    if (!selectedNodeId) return null;
    return data.persons.find((p) => p.id === selectedNodeId) || null;
  }, [selectedNodeId, data.persons]);

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    // If edit panel is open, close it without saving when clicking on another person
    if (isEditPanelOpen) {
      // Close edit panel without saving
      setIsEditPanelOpen(false);
      setPersonToEdit(null);
    }
    
    // If clicked on already selected node - deselect
    if (selectedNodeId === node.id) {
      setSelectedNodeId(null);
    } else {
      setSelectedNodeId(node.id);
    }
  }, [selectedNodeId, isEditPanelOpen]);

  const onPaneClick = useCallback(() => {
    // Reset selection when clicking on empty space
    setSelectedNodeId(null);
    // Close edit panel if open
    if (isEditPanelOpen) {
      setIsEditPanelOpen(false);
      setPersonToEdit(null);
    }
  }, [isEditPanelOpen]);

  const handleAddPerson = useCallback((
    personData: Omit<Person, 'id'>,
    relationship?: { type: 'parent' | 'child'; relatedPersonId: string }
  ) => {
    // Generate unique ID for new person
    const newPersonId = `person-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newPerson: Person = {
      ...personData,
      id: newPersonId,
    };

    // Check and add relationship if specified
    let newRelationship: Relationship | null = null;
    
    if (relationship) {
      const { type, relatedPersonId } = relationship;
      
      if (type === 'child') {
        // New person is a child of the selected person
        // relatedPersonId is the parent of the new person
        // Validation already done in panel, just create relationship here
        const relatedPerson = data.persons.find((p) => p.id === relatedPersonId);
        if (!relatedPerson) {
          // If person not found (shouldn't happen after validation), just don't add
          return;
        }
        
        newRelationship = {
          id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          parentId: relatedPersonId,
          childId: newPersonId,
        };
        
        // Find spouse of the parent (another parent who shares children with this parent)
        // This ensures that when building tree from the new child, both parental lines are visible
        const parentChildren = data.relationships
          .filter((rel) => rel.parentId === relatedPersonId)
          .map((rel) => rel.childId);
        
        // Find other parents who share at least one child with this parent
        // These are potential spouses (parents of the same children)
        const spouseCandidates = new Set<string>();
        parentChildren.forEach((childId) => {
          const childParents = data.relationships
            .filter((rel) => rel.childId === childId)
            .map((rel) => rel.parentId)
            .filter((pid) => pid !== relatedPersonId);
          childParents.forEach((pid) => spouseCandidates.add(pid));
        });
        
        // If there's a spouse candidate, create relationship with them too
        if (spouseCandidates.size > 0) {
          // Find the spouse (should be opposite gender and share children)
          const spouseId = Array.from(spouseCandidates).find((candidateId) => {
            const candidate = data.persons.find((p) => p.id === candidateId);
            if (!candidate) return false;
            // Check if they have opposite gender (spouses typically have opposite genders)
            const isOppositeGender = candidate.gender && relatedPerson.gender && 
                                     candidate.gender !== relatedPerson.gender;
            // Check if they share children (already verified by being in spouseCandidates)
            return isOppositeGender;
          });
          
          if (spouseId) {
            // Add relationship with spouse as well
            const spouseRelationship: Relationship = {
              id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-spouse`,
              parentId: spouseId,
              childId: newPersonId,
            };
            
            // Update data with both relationships
            setData((prevData) => {
              const updatedPersons = [...prevData.persons, newPerson];
              const updatedRelationships = [
                ...prevData.relationships,
                newRelationship!,
                spouseRelationship,
              ];
              
              return {
                persons: updatedPersons,
                relationships: updatedRelationships,
              };
            });
            
            // Close add panel
            setIsAddPanelOpen(false);
            return; // Early return since we've already updated data
          }
        }
      } else if (type === 'parent') {
        // New person is a parent of the selected person
        // relatedPersonId is the child of the new person
        // Validation already done in panel, but check again for safety
        if (!canAddParent(relatedPersonId, data.relationships)) {
          // If can't add parent (shouldn't happen after validation), just don't add
          return;
        }
        
        // Check if such relationship already exists
        if (relationshipExists(newPersonId, relatedPersonId, data.relationships)) {
          // If relationship already exists (shouldn't happen), just don't add
          return;
        }
        
        newRelationship = {
          id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          parentId: newPersonId,
          childId: relatedPersonId,
        };
      }
    }

    // Update data (only if we haven't already updated it above for spouse case)
    // If we found a spouse and created relationships, we already updated data and returned early
    setData((prevData) => {
      const updatedPersons = [...prevData.persons, newPerson];
      const updatedRelationships = newRelationship
        ? [...prevData.relationships, newRelationship]
        : prevData.relationships;
      
      return {
        persons: updatedPersons,
        relationships: updatedRelationships,
      };
    });

    // Close add panel
    setIsAddPanelOpen(false);
  }, [data.persons, data.relationships]);

  const handleDeletePerson = useCallback((personId: string) => {
    // Find all ancestors
    const ancestorIds = findAllAncestorIds(personId, data.relationships);
    const allIdsToDelete = [personId, ...ancestorIds];
    const uniqueIdsToDelete = Array.from(new Set(allIdsToDelete));

    // Update data: remove persons and their relationships
    setData((prevData) => {
      // Remove persons
      const updatedPersons = prevData.persons.filter(
        (p) => !uniqueIdsToDelete.includes(p.id)
      );

      // Remove relationships where either parent or child is in the deletion list
      const updatedRelationships = prevData.relationships.filter(
        (rel) => 
          !uniqueIdsToDelete.includes(rel.parentId) && 
          !uniqueIdsToDelete.includes(rel.childId)
      );

      return {
        persons: updatedPersons,
        relationships: updatedRelationships,
      };
    });

    // Close panel if deleted person was selected
    if (selectedNodeId === personId || uniqueIdsToDelete.includes(selectedNodeId || '')) {
      setSelectedNodeId(null);
    }
  }, [data.relationships, selectedNodeId]);

  const handleEditPerson = useCallback((person: Person) => {
    setPersonToEdit(person);
    setIsEditPanelOpen(true);
    // Keep selectedNodeId to maintain selection
  }, []);

  const handleUpdatePerson = useCallback((personId: string, personData: Omit<Person, 'id'>) => {
    setData((prevData) => {
      const updatedPersons = prevData.persons.map((p) =>
        p.id === personId ? { ...personData, id: personId } : p
      );

      return {
        persons: updatedPersons,
        relationships: prevData.relationships,
      };
    });

    setIsEditPanelOpen(false);
    setPersonToEdit(null);
  }, []);

  const handleRebuildTree = useCallback(() => {
    if (tempSelectedRootPersonId) {
      // Apply the selected root person and rebuild tree
      setSelectedRootPersonId(tempSelectedRootPersonId);
      setIsFitted(false);
    }
    setIsRootUserDialogOpen(false);
  }, [tempSelectedRootPersonId]);

  const handleCancelRootUser = useCallback(() => {
    setTempSelectedRootPersonId(null);
    setIsRootUserDialogOpen(false);
  }, []);

  const fullName = selectedPerson ? getPersonFullName(selectedPerson) : '';

  return (
    <div className={`w-full h-full ${className} relative`}>
      {/* Add Person Button */}
      <button
        onClick={() => {
          setIsAddPanelOpen(true);
          setSelectedNodeId(null);
        }}
        className="absolute top-4 left-4 z-50 w-12 h-12 bg-green-400 text-white rounded-full shadow-lg hover:bg-green-500 transition-colors flex items-center justify-center text-4xl font-bold leading-none cursor-pointer"
        aria-label="Add new person"
        title="Add person"
      >
        <span className="relative -top-1">+</span>
      </button>

      {/* Tree Toggle Button */}
      <button
        onClick={() => setTree(!tree)}
        className="absolute top-20 left-4 z-50 w-12 h-12 bg-green-400 text-white rounded-full shadow-lg hover:bg-green-500 transition-colors flex items-center justify-center cursor-pointer"
        aria-label="Toggle tree"
        title="Toggle ancestors/descendants mode"
      >
        <Network className="h-6 w-6" style={{ transform: tree ? 'scaleY(1)' : 'scaleY(-1)' }} />
      </button>

      {/* Root User Button */}
      <button
        onClick={() => {
          // Initialize temp selected root person with current root person if exists
          setTempSelectedRootPersonId(selectedRootPersonId || mainPersonId || null);
          setIsRootUserDialogOpen(true);
        }}
        className="absolute top-36 left-4 z-50 w-12 h-12 bg-green-400 text-white rounded-full shadow-lg hover:bg-green-500 transition-colors flex items-center justify-center cursor-pointer"
        aria-label="Set root user"
        title="Set as root"
      >
        <UserStar className="h-6 w-6" />
      </button>

      <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView={false}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          style={{
            opacity: isFitted ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out',
          }}
      >
          <FlowContent nodes={nodes} onFitted={handleFitted}/>
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
      </div>

      {/* Side Panel - Person Details */}
      {selectedPerson && !isAddPanelOpen && !isEditPanelOpen && (
        <PersonDetailsPanel 
          person={selectedPerson} 
          fullName={fullName}
          onClose={() => setSelectedNodeId(null)}
          isMainPerson={mainPersonId === selectedPerson.id}
          onDelete={handleDeletePerson}
          onEdit={handleEditPerson}
          persons={data.persons}
          relationships={data.relationships}
        />
      )}

      {/* Side Panel - Add Person */}
      {isAddPanelOpen && !isEditPanelOpen && (
        <AddPersonPanel
          onClose={() => setIsAddPanelOpen(false)}
          onSave={handleAddPerson}
          persons={data.persons}
          relationships={data.relationships}
          mainPersonId={mainPersonId}
        />
      )}

      {/* Side Panel - Edit Person */}
      {isEditPanelOpen && personToEdit && (
        <AddPersonPanel
          onClose={() => {
            setIsEditPanelOpen(false);
            setPersonToEdit(null);
          }}
          onSave={handleAddPerson}
          onUpdate={handleUpdatePerson}
          persons={data.persons}
          relationships={data.relationships}
          mainPersonId={mainPersonId}
          personToEdit={personToEdit}
        />
      )}

      {/* Root User Dialog */}
      {isRootUserDialogOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Set Root User</h2>
              <button
                onClick={handleCancelRootUser}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-gray-700 mb-4">
              Select a user to rebuild the tree relative to them:
            </p>

            <div className="max-h-64 overflow-y-auto mb-6 border border-gray-200 rounded-lg">
              {data.persons.map((person) => {
                const fullName = getPersonFullName(person);
                const isSelected = tempSelectedRootPersonId === person.id;
                return (
                  <button
                    key={person.id}
                    onClick={() => setTempSelectedRootPersonId(person.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                      isSelected ? 'bg-green-50 text-green-600' : 'text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{fullName}</div>
                    {person.email && (
                      <div className="text-sm text-gray-500">{person.email}</div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancelRootUser}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleRebuildTree}
                className="flex-1"
                disabled={!tempSelectedRootPersonId}
              >
                Rebuild Tree
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

