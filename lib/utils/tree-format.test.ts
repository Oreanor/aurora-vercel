import { describe, it, expect } from 'vitest';
import { formatTreeNameShort } from './tree-format';
import type { FamilyTree, Person } from '@/types/family';

const tree = (overrides: Partial<FamilyTree>): FamilyTree => ({
  id: 't1',
  name: 'My Tree',
  data: { persons: [], relationships: [] },
  access: { owner: [], editor: [], viewer: [] },
  ...overrides,
});

describe('formatTreeNameShort', () => {
  it('returns tree.name or tree.id when no persons', () => {
    expect(formatTreeNameShort(tree({ data: { persons: [], relationships: [] } }))).toBe('My Tree');
    expect(formatTreeNameShort(tree({ name: undefined, data: { persons: [], relationships: [] } }))).toBe('t1');
  });

  it('returns "J.Smith family" from first person', () => {
    const t = tree({
      data: {
        persons: [{ id: 'p1', firstName: 'John', lastName: 'Smith' } as unknown as Person],
        relationships: [],
      },
    });
    expect(formatTreeNameShort(t)).toBe('J.Smith family');
  });

  it('uses tree.name when first person has no name', () => {
    const t = tree({
      data: {
        persons: [{ id: 'p1', firstName: '', lastName: '' } as unknown as Person],
        relationships: [],
      },
    });
    expect(formatTreeNameShort(t)).toBe('My Tree');
  });
});
