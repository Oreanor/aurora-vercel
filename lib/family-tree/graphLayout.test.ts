import { describe, it, expect } from 'vitest';
import { buildGraphLayout } from './graphLayout';
import type { FamilyTreeData } from '@/types/family';

describe('buildGraphLayout', () => {
  it('returns empty nodes and edges for empty data', () => {
    const data: FamilyTreeData = { persons: [], relationships: [] };
    const result = buildGraphLayout(data);
    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
  });

  it('returns one node and no edges for single person', () => {
    const data: FamilyTreeData = {
      persons: [{ id: 'p1', firstName: 'Alice', lastName: 'Smith' }],
      relationships: [],
    };
    const result = buildGraphLayout(data);
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].id).toBe('p1');
    expect(result.nodes[0].type).toBe('graphNode');
    expect(result.edges).toHaveLength(0);
  });

  it('returns two nodes and one edge for parent and child', () => {
    const data: FamilyTreeData = {
      persons: [
        { id: 'parent', firstName: 'Parent', lastName: 'X' },
        { id: 'child', firstName: 'Child', lastName: 'X' },
      ],
      relationships: [{ id: 'r1', parentId: 'parent', childId: 'child' }],
    };
    const result = buildGraphLayout(data);
    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].source).toBe('parent');
    expect(result.edges[0].target).toBe('child');
  });

  it('adds ring nodes for spouse pair (two parents of same child)', () => {
    const data: FamilyTreeData = {
      persons: [
        { id: 'p1', firstName: 'Dad', lastName: 'X' },
        { id: 'p2', firstName: 'Mom', lastName: 'X' },
        { id: 'c1', firstName: 'Kid', lastName: 'X' },
      ],
      relationships: [
        { id: 'r1', parentId: 'p1', childId: 'c1' },
        { id: 'r2', parentId: 'p2', childId: 'c1' },
      ],
    };
    const result = buildGraphLayout(data);
    expect(result.nodes.length).toBeGreaterThanOrEqual(3);
    const ringNodes = result.nodes.filter((n) => n.id.startsWith('ring-'));
    expect(ringNodes.length).toBe(2);
  });

  it('adds ring nodes for explicit spouseLink (childless couple)', () => {
    const data: FamilyTreeData = {
      persons: [
        { id: 'a', firstName: 'Alice', lastName: 'X' },
        { id: 'b', firstName: 'Bob', lastName: 'X' },
      ],
      relationships: [],
      spouseLinks: [{ id: 's1', personId1: 'a', personId2: 'b' }],
    };
    const result = buildGraphLayout(data);
    expect(result.nodes.length).toBeGreaterThanOrEqual(2);
    const ringNodes = result.nodes.filter((n) => n.id.startsWith('ring-'));
    expect(ringNodes.length).toBe(2);
  });
});
