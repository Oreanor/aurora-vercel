import { Node, Edge, Position } from '@xyflow/react';
import { FamilyTreeData } from '@/types/family';
import { treeEdge, ringSize } from '@/lib/theme';
import { BRANCH_LEVEL_SPACING, BRANCH_MIN_SPOUSE_DISTANCE, BRANCH_MARRIAGE_BLOCK_WIDTH, TREE_NODE_WIDTH, TREE_NODE_HEIGHT } from './constants';

/** Children that have both expandedId and spouseId as parents (this marriage). */
function getChildrenOfMarriage(
  expandedId: string,
  spouseId: string,
  relationships: { parentId: string; childId: string }[]
): string[] {
  const childrenOfExpanded = relationships
    .filter((r) => r.parentId === expandedId)
    .map((r) => r.childId);
  return childrenOfExpanded.filter((childId) =>
    relationships.some((r) => r.parentId === spouseId && r.childId === childId)
  );
}

/**
 * Builds nodes and edges for an expanded sibling's descendants branch (person + spouse + rings + children).
 * Anchor is to the right of the main person node.
 */
export function buildSiblingBranch(
  expandedId: string,
  data: FamilyTreeData,
  anchorX: number,
  anchorY: number,
  mainPersonIdForRoles: string,
  selectedNodeId?: string,
  branchShowDescendants: boolean = true
): { branchNodes: Node[]; branchEdges: Edge[]; branchNodeIds: Set<string>; branchEdgeIds: Set<string> } {
  const branchNodes: Node[] = [];
  const branchEdges: Edge[] = [];
  const branchNodeIds = new Set<string>();
  const branchEdgeIds = new Set<string>();

  const expandedPerson = data.persons.find((p) => p.id === expandedId);
  if (!expandedPerson) return { branchNodes, branchEdges, branchNodeIds, branchEdgeIds };

  const childRels = data.relationships.filter((r) => r.parentId === expandedId);
  const childIds = [...new Set(childRels.map((r) => r.childId))];
  const spouseIdsFromChildren = [...new Set(childRels.map((r) => r.childId).flatMap((childId) => {
    return data.relationships
      .filter((r) => r.childId === childId && r.parentId !== expandedId)
      .map((r) => r.parentId);
  }))].filter(Boolean);
  const spouseIdsFromLinks = (data.spouseLinks ?? [])
    .filter((link) => link.personId1 === expandedId || link.personId2 === expandedId)
    .map((link) => (link.personId1 === expandedId ? link.personId2 : link.personId1));
  const spouseIds = [...new Set([...spouseIdsFromChildren, ...spouseIdsFromLinks])];

  const halfDist = BRANCH_MIN_SPOUSE_DISTANCE / 2;
  const rootX1 = anchorX - halfDist;
  const rootRowY = branchShowDescendants ? anchorY : anchorY + BRANCH_LEVEL_SPACING;
  const childrenRowY = branchShowDescendants ? anchorY + BRANCH_LEVEL_SPACING : anchorY;
  const rootSourcePos = branchShowDescendants ? Position.Bottom : Position.Top;
  const rootTargetPos = branchShowDescendants ? Position.Top : Position.Bottom;
  const childSourcePos = branchShowDescendants ? Position.Bottom : Position.Top;
  const childTargetPos = branchShowDescendants ? Position.Top : Position.Bottom;
  const ringY = rootRowY + (branchShowDescendants ? 35 : -35);
  const ringOffset = 12;

  branchNodeIds.add(expandedId);
  branchNodes.push({
    id: expandedId,
    type: 'familyNode',
    position: { x: rootX1, y: rootRowY },
    data: {
      person: expandedPerson,
      isMainPerson: false,
      siblings: [],
      relationships: data.relationships,
      mainPersonId: mainPersonIdForRoles,
      persons: data.persons,
      isSelected: selectedNodeId === expandedId,
      showDescendants: true,
      isExpandedSiblingRoot: true,
    },
    width: TREE_NODE_WIDTH,
    height: TREE_NODE_HEIGHT,
    sourcePosition: rootSourcePos,
    targetPosition: rootTargetPos,
  });

  // Variant A: one person node, then for each spouse a block (rings + spouse) in a row
  spouseIds.forEach((spouseId, i) => {
    const spousePerson = data.persons.find((p) => p.id === spouseId);
    if (!spousePerson) return;

    const spouseX = anchorX + halfDist + i * BRANCH_MARRIAGE_BLOCK_WIDTH;
    branchNodeIds.add(spouseId);
    branchNodes.push({
      id: spouseId,
      type: 'familyNode',
      position: { x: spouseX, y: rootRowY },
      data: {
        person: spousePerson,
        isMainPerson: false,
        siblings: [],
        relationships: data.relationships,
        mainPersonId: mainPersonIdForRoles,
        persons: data.persons,
        isSelected: selectedNodeId === spouseId,
        showDescendants: true,
      },
      width: TREE_NODE_WIDTH,
      height: TREE_NODE_HEIGHT,
      sourcePosition: rootSourcePos,
      targetPosition: rootTargetPos,
    });

    const centerNode1 = rootX1 + TREE_NODE_WIDTH / 2;
    const centerNode2 = spouseX + TREE_NODE_WIDTH / 2;
    const centerBetweenAvatars = (centerNode1 + centerNode2) / 2;
    const ringLeft = (centerBetweenAvatars - ringOffset) - ringSize / 2;
    const ringRight = (centerBetweenAvatars + ringOffset) - ringSize / 2;
    const ringId1 = `branch-ring-${expandedId}-${spouseId}-1`;
    const ringId2 = `branch-ring-${expandedId}-${spouseId}-2`;
    branchNodeIds.add(ringId1);
    branchNodeIds.add(ringId2);
    branchNodes.push(
      { id: ringId1, type: 'spouseRingNode', position: { x: ringLeft, y: ringY }, data: { size: ringSize }, width: ringSize, height: ringSize, selectable: false, draggable: false, connectable: false },
      { id: ringId2, type: 'spouseRingNode', position: { x: ringRight, y: ringY }, data: { size: ringSize }, width: ringSize, height: ringSize, selectable: false, draggable: false, connectable: false }
    );

    // Children of this marriage: below this block
    const marriageChildIds = getChildrenOfMarriage(expandedId, spouseId, data.relationships);
    const blockCenterX = spouseX + TREE_NODE_WIDTH / 2;
    const totalChildrenWidth = (marriageChildIds.length - 1) * TREE_NODE_WIDTH;
    const startChildX = blockCenterX - totalChildrenWidth / 2;

    marriageChildIds.forEach((childId, j) => {
      const person = data.persons.find((p) => p.id === childId);
      if (!person) return;
      const x = startChildX + j * TREE_NODE_WIDTH;
      branchNodeIds.add(person.id);
      branchNodes.push({
        id: person.id,
        type: 'familyNode',
        position: { x, y: childrenRowY },
        data: {
          person,
          isMainPerson: false,
          siblings: [],
          relationships: data.relationships,
          mainPersonId: mainPersonIdForRoles,
          persons: data.persons,
          isSelected: selectedNodeId === person.id,
          showDescendants: true,
        },
        width: TREE_NODE_WIDTH,
        height: TREE_NODE_HEIGHT,
        sourcePosition: childSourcePos,
        targetPosition: childTargetPos,
      });

      const relToChild = data.relationships.find((r) => r.parentId === expandedId && r.childId === person.id);
      if (relToChild) {
        const edgeId = `branch-${relToChild.id}`;
        if (!branchEdgeIds.has(edgeId)) {
          branchEdgeIds.add(edgeId);
          branchEdges.push({ id: edgeId, source: expandedId, target: person.id, type: 'smoothstep', animated: false, style: { stroke: treeEdge, strokeWidth: 4 } });
        }
      }
      const relSpouse = data.relationships.find((r) => r.parentId === spouseId && r.childId === person.id);
      if (relSpouse) {
        const edgeId = `branch-${relSpouse.id}`;
        if (!branchEdgeIds.has(edgeId)) {
          branchEdgeIds.add(edgeId);
          branchEdges.push({ id: edgeId, source: spouseId, target: person.id, type: 'smoothstep', animated: false, style: { stroke: treeEdge, strokeWidth: 4 } });
        }
      }
    });
  });

  // Children with no second parent (only expandedId): place in a block after all marriages or at anchor
  const childrenWithOneParent = childIds.filter((childId) => {
    const parents = data.relationships.filter((r) => r.childId === childId).map((r) => r.parentId);
    return parents.length === 1 && parents[0] === expandedId;
  });
  if (childrenWithOneParent.length > 0) {
    const blockCenterX = spouseIds.length > 0
      ? anchorX + halfDist + (spouseIds.length + 0.5) * BRANCH_MARRIAGE_BLOCK_WIDTH
      : anchorX;
    const totalChildrenWidth = (childrenWithOneParent.length - 1) * TREE_NODE_WIDTH;
    const startChildX = blockCenterX - totalChildrenWidth / 2;

    childrenWithOneParent.forEach((childId, j) => {
      const person = data.persons.find((p) => p.id === childId);
      if (!person) return;
      const x = startChildX + j * TREE_NODE_WIDTH;
      if (branchNodeIds.has(person.id)) return; // already added under a marriage
      branchNodeIds.add(person.id);
      branchNodes.push({
        id: person.id,
        type: 'familyNode',
        position: { x, y: childrenRowY },
        data: {
          person,
          isMainPerson: false,
          siblings: [],
          relationships: data.relationships,
          mainPersonId: mainPersonIdForRoles,
          persons: data.persons,
          isSelected: selectedNodeId === person.id,
          showDescendants: true,
        },
        width: TREE_NODE_WIDTH,
        height: TREE_NODE_HEIGHT,
        sourcePosition: childSourcePos,
        targetPosition: childTargetPos,
      });
      const relToChild = data.relationships.find((r) => r.parentId === expandedId && r.childId === person.id);
      if (relToChild) {
        const edgeId = `branch-${relToChild.id}`;
        if (!branchEdgeIds.has(edgeId)) {
          branchEdgeIds.add(edgeId);
          branchEdges.push({ id: edgeId, source: expandedId, target: person.id, type: 'smoothstep', animated: false, style: { stroke: treeEdge, strokeWidth: 4 } });
        }
      }
    });
  }

  return { branchNodes, branchEdges, branchNodeIds, branchEdgeIds };
}
