import { Node, Edge, Position } from '@xyflow/react';
import { FamilyTreeData, Person } from '@/types/family';
import { getSiblings } from '@/lib/family/relationships';
import { treeEdge, ringSize } from '@/lib/theme';
import { buildSiblingBranch } from './buildSiblingBranch';
import { BRANCH_ANCHOR_OFFSET_X, BRANCH_LEVEL_SPACING, TREE_NODE_WIDTH, TREE_NODE_HEIGHT, TREE_BEAD_WIDTH } from './constants';
import {
  alignParentLevels,
  buildLevelsFromMain,
  groupPersonsByLevel,
  normalizeTreeLevels,
  resolveMainPersonId,
} from './levels';

/**
 * Transforms family tree data into React Flow format
 * @param data - family tree data
 * @param currentUserEmail - current user's email (optional). If provided, the tree will be displayed relative to this user
 * @param selectedNodeId - ID of the selected node (optional)
 * @param rootPersonId - ID of the root person (optional). If provided, this person will be the root, overriding email-based selection
 * @param showDescendants - if true, show descendants (root at top), if false, show ancestors (root at bottom)
 * @param onSiblingClick - called when a sibling bead is clicked (expand branch)
 * @param expandedSiblingId - when set, show this person's descendants branch to the right; rest of tree at 30% opacity
 * @param branchShowDescendants - when true, branch shows root on top; when false, root at bottom (flipped)
 */
export function transformToFlowData(
  data: FamilyTreeData,
  currentUserEmail?: string,
  selectedNodeId?: string,
  rootPersonId?: string,
  showDescendants: boolean = false,
  onSiblingClick?: (personId: string) => void,
  expandedSiblingId?: string | null,
  branchShowDescendants: boolean = true
): { nodes: Node[]; edges: Edge[]; branchNodes: Node[]; branchEdges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const mainPersonId = resolveMainPersonId(data, currentUserEmail, rootPersonId);
  if (!mainPersonId) {
    return { nodes: [], edges: [], branchNodes: [], branchEdges: [] };
  }

  const levelsFromMain = buildLevelsFromMain(data, mainPersonId, showDescendants);
  alignParentLevels(data, levelsFromMain, mainPersonId);

  const normalizedLevels = normalizeTreeLevels(levelsFromMain);
  const personsByLevel = groupPersonsByLevel(data.persons, normalizedLevels);

  // Create nodes with positioning relative to descendants
  const minSpouseGap = 0;
  const minSpouseDistance = TREE_NODE_WIDTH + minSpouseGap;
  const basePairSpacing = 400;
  const minNodeDistance = BRANCH_LEVEL_SPACING;
  const levelSpacing = BRANCH_LEVEL_SPACING;
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

      // Add spouse-only groups (childless couples) from spouseLinks
      (data.spouseLinks ?? []).forEach((link) => {
        const p1 = persons.find((p) => p.id === link.personId1);
        const p2 = persons.find((p) => p.id === link.personId2);
        if (!p1 || !p2) return;
        const alreadyGrouped = Array.from(parentGroups.values()).some(
          (group) => group.includes(p1) && group.includes(p2)
        );
        if (!alreadyGrouped) {
          const key = `spouse:${[link.personId1, link.personId2].sort().join(',')}`;
          parentGroups.set(key, [p1, p2]);
        }
      });

      // Get distance between pairs for this level
      const pairSpacing = getPairSpacing(level);

      // Sort groups by their children's positions (left to right); spouse-only groups last
      const sortedGroups = Array.from(parentGroups.entries()).sort(([key1], [key2]) => {
        if (key1.startsWith('spouse:') && key2.startsWith('spouse:')) return key1.localeCompare(key2);
        if (key1.startsWith('spouse:')) return 1;
        if (key2.startsWith('spouse:')) return -1;
        const children1 = key1.split(',').map((id) => nodePositions.get(id)?.x ?? 0);
        const children2 = key2.split(',').map((id) => nodePositions.get(id)?.x ?? 0);
        const avg1 = children1.length ? children1.reduce((sum, x) => sum + x, 0) / children1.length : 0;
        const avg2 = children2.length ? children2.reduce((sum, x) => sum + x, 0) / children2.length : 0;
        return avg1 - avg2;
      });

      // Process each spouse group considering distance between pairs
      sortedGroups.forEach(([childrenKey, parentGroup], groupIndex) => {
        const isSpouseOnly = childrenKey.startsWith('spouse:');
        const childrenIds = isSpouseOnly ? [] : childrenKey.split(',');

        // Calculate average position of all children in this group (or center for spouse-only)
        const childPositions = childrenIds
          .map((childId) => nodePositions.get(childId))
          .filter((pos): pos is { x: number; y: number } => pos !== undefined);

        if (childPositions.length > 0 || (isSpouseOnly && parentGroup.length >= 2)) {
          const avgChildX = childPositions.length > 0
            ? childPositions.reduce((sum, pos) => sum + pos.x, 0) / childPositions.length
            : centerX;

          // Calculate desired position of pair center considering distance between pairs
          // First pair in center, others shift left/right
          let pairCenterX = avgChildX;
          if (sortedGroups.length > 1 && !isSpouseOnly) {
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
            // One parent - symmetrically above child; do not overwrite if already placed (e.g. same person in another marriage group)
            const person = sortedParents[0];
            if (nodePositions.has(person.id)) return;
            const adjustedX = adjustPositionToAvoidOverlap(pairCenterX, y, level, person.id);
            nodePositions.set(person.id, { x: adjustedX, y });
          } else if (sortedParents.length === 2) {
            // Two parents (spouses): place side by side with rings; if one already placed (multi-marriage), add the other next to them
            const [parent1, parent2] = sortedParents;
            const existingPos1 = nodePositions.get(parent1.id);
            const existingPos2 = nodePositions.get(parent2.id);

            let adjustedX1: number;
            let adjustedX2: number;

            if (existingPos1 && !existingPos2) {
              adjustedX1 = existingPos1.x;
              const rightmostX = Math.max(
                ...persons.map((p) => nodePositions.get(p.id)?.x ?? -Infinity)
              );
              const desiredX2 = Math.max(adjustedX1 + minSpouseDistance, rightmostX + minSpouseDistance);
              adjustedX2 = adjustPositionToAvoidOverlap(desiredX2, y, level, parent2.id, parent1.id);
              nodePositions.set(parent2.id, { x: adjustedX2, y });
            } else if (existingPos2 && !existingPos1) {
              adjustedX2 = existingPos2.x;
              const desiredX1 = adjustedX2 - minSpouseDistance;
              adjustedX1 = adjustPositionToAvoidOverlap(desiredX1, y, level, parent1.id, parent2.id);
              nodePositions.set(parent1.id, { x: adjustedX1, y });
            } else if (!existingPos1 && !existingPos2) {
              const halfDistance = minSpouseDistance / 2;
              const desiredX1 = pairCenterX - halfDistance;
              adjustedX1 = adjustPositionToAvoidOverlap(desiredX1, y, level, parent1.id, parent2.id);
              nodePositions.set(parent1.id, { x: adjustedX1, y });
              const actualOffset1 = pairCenterX - adjustedX1;
              const desiredX2Symmetric = pairCenterX + actualOffset1;
              const minX2 = adjustedX1 + minSpouseDistance;
              const finalX2 = Math.max(desiredX2Symmetric, minX2);
              adjustedX2 = adjustPositionToAvoidOverlap(finalX2, y, level, parent2.id, parent1.id);
              nodePositions.set(parent2.id, { x: adjustedX2, y });
            } else {
              adjustedX1 = existingPos1!.x;
              adjustedX2 = existingPos2!.x;
            }

            const centerBetweenAvatars = (adjustedX1 + adjustedX2) / 2;
            const ringOffset = 10;
            const rightOffset = 85;
            const ring1X = centerBetweenAvatars - ringOffset + rightOffset;
            const ring2X = centerBetweenAvatars + ringOffset + rightOffset;
            const ringY = y + 35;

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
    if (level === undefined || level === 999) return;

    const position = nodePositions.get(person.id);
    if (!position) return;

    const isMainPerson = person.id === mainPersonId;
    const nodeHeight = isMainPerson && !showDescendants ? 450 : TREE_NODE_HEIGHT;
    const siblings = showDescendants ? [] : getSiblings(person.id, data.persons, data.relationships);
    const nodeWidth = siblings.length > 0 ? TREE_NODE_WIDTH + siblings.length * TREE_BEAD_WIDTH : TREE_NODE_WIDTH;

    nodes.push({
      id: person.id,
      type: 'familyNode',
      position,
      data: {
        person,
        isMainPerson,
        siblings,
        onSiblingClick: siblings.length > 0 ? onSiblingClick : undefined,
        relationships: data.relationships,
        mainPersonId,
        persons: data.persons,
        isSelected: selectedNodeId === person.id,
        showDescendants,
      },
      width: nodeWidth,
      height: nodeHeight,
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    });
  });

  // Create edges with thickness depending on level
  const getStrokeWidth = (parentLevel: number): number => {
    if (showDescendants) return 4;
    const width = 40 / Math.pow(2, parentLevel);
    return Math.max(Math.round(width), 4);
  };

  // Create edges only for relationships where both parent and child are in the tree
  data.relationships.forEach((rel) => {
    const parentLevel = normalizedLevels.get(rel.parentId);
    const childLevel = normalizedLevels.get(rel.childId);

    if (parentLevel === undefined || parentLevel === 999 ||
        childLevel === undefined || childLevel === 999) {
      return;
    }

    const strokeWidth = getStrokeWidth(parentLevel);
    const isAdopted = rel.type === 'adopted';

    edges.push({
      id: rel.id,
      source: rel.parentId,
      target: rel.childId,
      type: 'smoothstep',
      animated: false,
      style: {
        stroke: treeEdge,
        strokeWidth,
        ...(isAdopted && { strokeDasharray: '8 4' }),
      },
    });
  });

  // Create nodes for yellow rings between spouses
  nodePositions.forEach((position, nodeId) => {
    if (nodeId.startsWith('ring-')) {
      nodes.push({
        id: nodeId,
        type: 'spouseRingNode',
        position,
        data: { size: ringSize },
        width: ringSize,
        height: ringSize,
        selectable: false,
        draggable: false,
        connectable: false,
      });
    }
  });

  let branchNodes: Node[] = [];
  let branchEdges: Edge[] = [];

  if (expandedSiblingId) {
    let anchorX: number;
    let anchorY: number;
    const anchorPersonId = data.persons.find((p) => {
      const level = normalizedLevels.get(p.id);
      if (level === undefined || level === 999) return false;
      const sibs = getSiblings(p.id, data.persons, data.relationships);
      return sibs.some((s) => s.id === expandedSiblingId);
    })?.id;
    if (anchorPersonId) {
      const pos = nodePositions.get(anchorPersonId);
      const anchorSiblings = getSiblings(anchorPersonId, data.persons, data.relationships);
      const anchorNodeWidth = anchorSiblings.length > 0 ? TREE_NODE_WIDTH + anchorSiblings.length * TREE_BEAD_WIDTH : TREE_NODE_WIDTH;
      const gap = 8;
      anchorX = (pos?.x ?? 0) + anchorNodeWidth + gap;
      anchorY = pos?.y ?? 0;
    } else {
      const mainPos = nodePositions.get(mainPersonId);
      anchorX = (mainPos?.x ?? 0) + BRANCH_ANCHOR_OFFSET_X;
      anchorY = mainPos?.y ?? 0;
    }
    const mainPos = nodePositions.get(mainPersonId);
    if (mainPos) {
      const built = buildSiblingBranch(
        expandedSiblingId,
        data,
        anchorX,
        anchorY,
        mainPersonId,
        selectedNodeId,
        branchShowDescendants
      );
      branchNodes = built.branchNodes;
      branchEdges = built.branchEdges;
      nodes.forEach((n) => {
        const style = (n.style = n.style || {});
        style.pointerEvents = 'none';
      });
      edges.forEach((e) => {
        const style = (e.style = e.style || {});
        style.pointerEvents = 'none';
      });
    }
  }

  return { nodes, edges, branchNodes, branchEdges };
}
