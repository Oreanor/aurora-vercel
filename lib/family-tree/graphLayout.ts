import dagre from 'dagre';
import { Node, Edge, Position } from '@xyflow/react';
import { FamilyTreeData } from '@/types/family';
import { treeEdge, ringSize, graphNodeWidth, graphNodeHeight } from '@/lib/theme';

const SPOUSE_GAP = 8;
const RING_OFFSET = 10;
/** Ring center at avatar center height (between avatars). */
const RING_Y_OFFSET = -14;

/** Spouse pairs from shared children (normalized id1 < id2). */
function getSpousePairsFromRelationships(relationships: { parentId: string; childId: string }[]): Array<[string, string]> {
  const byChild = new Map<string, string[]>();
  for (const r of relationships) {
    if (!byChild.has(r.childId)) byChild.set(r.childId, []);
    byChild.get(r.childId)!.push(r.parentId);
  }
  const pairs = new Set<string>();
  byChild.forEach((parentIds) => {
    const unique = [...new Set(parentIds)];
    if (unique.length === 2) {
      const [a, b] = unique.sort();
      pairs.add(`${a}\t${b}`);
    }
  });
  return Array.from(pairs).map((s) => s.split('\t') as [string, string]);
}

/** All spouse pairs: from shared children + explicit spouseLinks (normalized, deduped). */
function getAllSpousePairs(data: FamilyTreeData): Array<[string, string]> {
  const fromRels = getSpousePairsFromRelationships(data.relationships);
  const fromLinks = (data.spouseLinks ?? []).map((link) => {
    const [a, b] = [link.personId1, link.personId2].sort();
    return `${a}\t${b}` as const;
  });
  const seen = new Set<string>([...fromRels.map(([a, b]) => `${a}\t${b}`), ...fromLinks]);
  return Array.from(seen).map((s) => s.split('\t') as [string, string]);
}

/**
 * Builds React Flow nodes and edges from family data and runs dagre layout
 * so that all persons and all parent-child relationships are shown in one
 * orthogonal, tree-like schema (top-to-bottom: parents above children).
 * Spouses are placed close together with two rings between them (like the tree).
 */
export function buildGraphLayout(data: FamilyTreeData): { nodes: Node[]; edges: Edge[] } {
  const { persons, relationships } = data;
  if (persons.length === 0) {
    return { nodes: [], edges: [] };
  }

  const personIds = new Set(persons.map((p) => p.id));

  const g = new dagre.graphlib.Graph({ compound: false });
  g.setGraph({
    rankdir: 'TB',
    align: 'UL',
    nodesep: 40,
    ranksep: 60,
    marginx: 20,
    marginy: 20,
  });
  g.setDefaultEdgeLabel(() => ({}));

  persons.forEach((p) => {
    g.setNode(p.id, { width: graphNodeWidth, height: graphNodeHeight });
  });

  relationships.forEach((rel) => {
    if (personIds.has(rel.parentId) && personIds.has(rel.childId)) {
      g.setEdge(rel.parentId, rel.childId);
    }
  });

  dagre.layout(g);

  const spousePairs = getAllSpousePairs(data);
  const positionByPerson = new Map<string, { x: number; y: number }>();

  persons.forEach((person) => {
    const node = g.node(person.id);
    const cx = node?.x ?? 0;
    const cy = node?.y ?? 0;
    positionByPerson.set(person.id, {
      x: cx - graphNodeWidth / 2,
      y: cy - graphNodeHeight / 2,
    });
  });

  const ringPositions: Array<{ id: string; x: number; y: number }> = [];
  const sameRankTolerance = 5;

  spousePairs.forEach(([id1, id2]) => {
    const pos1 = positionByPerson.get(id1);
    const pos2 = positionByPerson.get(id2);
    if (!pos1 || !pos2) return;
    const centerY1 = pos1.y + graphNodeHeight / 2;
    const centerY2 = pos2.y + graphNodeHeight / 2;
    const sameRank = Math.abs(centerY1 - centerY2) <= sameRankTolerance;
    const dagreY = (centerY1 + centerY2) / 2;
    const posY = sameRank ? pos1.y : dagreY - graphNodeHeight / 2;

    const centerX1 = pos1.x + graphNodeWidth / 2;
    const centerX2 = pos2.x + graphNodeWidth / 2;
    const midCx = (centerX1 + centerX2) / 2;

    const leftId = centerX1 <= centerX2 ? id1 : id2;
    const rightId = centerX1 <= centerX2 ? id2 : id1;

    const leftX = midCx - graphNodeWidth - SPOUSE_GAP / 2;
    const rightX = midCx + SPOUSE_GAP / 2;

    positionByPerson.set(leftId, { x: leftX, y: posY });
    positionByPerson.set(rightId, { x: rightX, y: posY });

    const ringY = dagreY + RING_Y_OFFSET - ringSize / 2;
    ringPositions.push(
      { id: `ring-${leftId}-${rightId}-1`, x: midCx - ringSize / 2 - RING_OFFSET, y: ringY },
      { id: `ring-${leftId}-${rightId}-2`, x: midCx - ringSize / 2 + RING_OFFSET, y: ringY }
    );
  });

  const nodes: Node[] = persons.map((person) => {
    const pos = positionByPerson.get(person.id)!;
    return {
      id: person.id,
      type: 'graphNode',
      position: pos,
      data: { person },
      width: graphNodeWidth,
      height: graphNodeHeight,
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    };
  });

  ringPositions.forEach(({ id, x, y }) => {
    nodes.push({
      id,
      type: 'spouseRingNode',
      position: { x, y },
      data: { size: ringSize },
      width: ringSize,
      height: ringSize,
      selectable: false,
      draggable: false,
      connectable: false,
    });
  });

  const edges: Edge[] = relationships
    .filter((rel) => personIds.has(rel.parentId) && personIds.has(rel.childId))
    .map((rel) => ({
      id: rel.id,
      source: rel.parentId,
      target: rel.childId,
      type: 'step',
      style: {
        stroke: treeEdge,
        strokeWidth: 2,
        ...(rel.type === 'adopted' && { strokeDasharray: '8 4' }),
      },
    }));

  return { nodes, edges };
}
