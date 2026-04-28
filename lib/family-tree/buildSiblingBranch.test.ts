import { describe, it, expect } from 'vitest';
import { buildSiblingBranch } from './buildSiblingBranch';
import type { FamilyTreeData } from '@/types/family';

describe('buildSiblingBranch', () => {
  it('returns empty nodes/edges when expanded person not in data', () => {
    const data: FamilyTreeData = {
      persons: [{ id: 'p1', firstName: 'A', lastName: 'X' }],
      relationships: [],
    };
    const result = buildSiblingBranch('nonexistent', data, 0, 0, 'p1');
    expect(result.branchNodes).toHaveLength(0);
    expect(result.branchEdges).toHaveLength(0);
  });

  it('returns one node for expanded person with no children', () => {
    const data: FamilyTreeData = {
      persons: [{ id: 'sib', firstName: 'Sibling', lastName: 'X' }],
      relationships: [],
    };
    const result = buildSiblingBranch('sib', data, 100, 200, 'main');
    expect(result.branchNodes).toHaveLength(1);
    expect(result.branchNodes[0].id).toBe('sib');
    expect(result.branchEdges).toHaveLength(0);
  });

  it('includes spouse and child nodes when expanded has spouse and child', () => {
    const data: FamilyTreeData = {
      persons: [
        { id: 'sib', firstName: 'Sib', lastName: 'X' },
        { id: 'spouse', firstName: 'Spouse', lastName: 'Y' },
        { id: 'child', firstName: 'Child', lastName: 'X' },
      ],
      relationships: [
        { id: 'r1', parentId: 'sib', childId: 'child' },
        { id: 'r2', parentId: 'spouse', childId: 'child' },
      ],
    };
    const result = buildSiblingBranch('sib', data, 100, 200, 'main');
    expect(result.branchNodes.length).toBeGreaterThanOrEqual(2);
    expect(result.branchNodeIds.has('sib')).toBe(true);
    expect(result.branchEdges.length).toBeGreaterThanOrEqual(1);
  });

  it('shows two spouses and children per marriage when expanded has two marriages', () => {
    const data: FamilyTreeData = {
      persons: [
        { id: 'sib', firstName: 'Sib', lastName: 'X' },
        { id: 'sp1', firstName: 'Spouse1', lastName: 'A' },
        { id: 'sp2', firstName: 'Spouse2', lastName: 'B' },
        { id: 'c1', firstName: 'Child1', lastName: 'X' },
        { id: 'c2', firstName: 'Child2', lastName: 'X' },
      ],
      relationships: [
        { id: 'r1', parentId: 'sib', childId: 'c1' },
        { id: 'r2', parentId: 'sp1', childId: 'c1' },
        { id: 'r3', parentId: 'sib', childId: 'c2' },
        { id: 'r4', parentId: 'sp2', childId: 'c2' },
      ],
    };
    const result = buildSiblingBranch('sib', data, 100, 200, 'main');
    expect(result.branchNodeIds.has('sib')).toBe(true);
    expect(result.branchNodeIds.has('sp1')).toBe(true);
    expect(result.branchNodeIds.has('sp2')).toBe(true);
    expect(result.branchNodeIds.has('c1')).toBe(true);
    expect(result.branchNodeIds.has('c2')).toBe(true);
    const ringCount = result.branchNodes.filter((n) => n.id.startsWith('branch-ring-')).length;
    expect(ringCount).toBe(4); // 2 rings per marriage
    expect(result.branchEdges.length).toBe(4); // sib->c1, sp1->c1, sib->c2, sp2->c2
  });
});
