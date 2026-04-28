import { describe, it, expect } from 'vitest';
import {
  cn,
  getPersonFullName,
  getPersonInitial,
  getPersonRole,
  formatPersonYears,
  getSiblings,
  findMainPersonId,
  canAddParent,
  relationshipExists,
  formatDateForInput,
  formatDateForComparison,
  findAllAncestorIds,
  findAllAncestors,
  validateParentRelationship,
  validateChildRelationship,
  hasUnsavedPersonChanges,
  sortFamilyMembersByRole,
  generateSystemPrompt,
} from './utils';
import type { Person, Relationship } from '@/types/family';

const person = (overrides: Partial<Person> & { id: string }) =>
  ({ firstName: '', lastName: '', ...overrides } as Person);

type PersonFormData = {
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate?: string;
  deathDate?: string;
  gender?: Person['gender'];
  photo?: string;
  biography?: string;
  hobbies?: string;
};

const formDataFactory = (
  overrides: Partial<PersonFormData> = {}
): PersonFormData => ({
  firstName: '',
  lastName: '',
  middleName: '',
  birthDate: undefined,
  deathDate: undefined,
  gender: undefined,
  photo: '',
  biography: '',
  hobbies: '',
  ...overrides,
});

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });
});

describe('getPersonFullName', () => {
  it('joins firstName, middleName, lastName', () => {
    expect(getPersonFullName(person({ id: '1', firstName: 'John', middleName: 'W', lastName: 'Smith' }))).toBe(
      'John W Smith'
    );
  });
  it('omits missing parts', () => {
    expect(getPersonFullName(person({ id: '1', firstName: 'Anna', lastName: 'X' }))).toBe('Anna X');
    expect(getPersonFullName(person({ id: '1', firstName: 'Bob' }))).toBe('Bob');
  });
  it('returns empty when all empty', () => {
    expect(getPersonFullName(person({ id: '1', firstName: '', lastName: '' }))).toBe('');
  });
});

describe('getPersonInitial', () => {
  it('returns first letter uppercased', () => {
    expect(getPersonInitial(person({ id: '1', firstName: 'john' }))).toBe('J');
  });
  it('returns ? when no firstName', () => {
    expect(getPersonInitial(person({ id: '1' }))).toBe('?');
  });
});

describe('getPersonRole', () => {
  it('returns You for main person', () => {
    expect(getPersonRole('p1', 'p1', [], [person({ id: 'p1' })])).toBe('You');
  });
  it('returns Father for male parent of main', () => {
    const rels: Relationship[] = [{ id: 'r1', parentId: 'dad', childId: 'me' }];
    const persons = [person({ id: 'me' }), person({ id: 'dad', firstName: 'Dad', gender: 'male' })];
    expect(getPersonRole('dad', 'me', rels, persons)).toBe('Father');
  });
  it('returns Mother for female parent', () => {
    const rels: Relationship[] = [{ id: 'r1', parentId: 'mom', childId: 'me' }];
    const persons = [person({ id: 'me' }), person({ id: 'mom', firstName: 'Mom', gender: 'female' })];
    expect(getPersonRole('mom', 'me', rels, persons)).toBe('Mother');
  });
  it('returns Grandfather for level 2 male', () => {
    const rels: Relationship[] = [{ id: 'r1', parentId: 'grandpa', childId: 'dad' }, { id: 'r2', parentId: 'dad', childId: 'me' }];
    const persons = [
      person({ id: 'me' }),
      person({ id: 'dad' }),
      person({ id: 'grandpa', gender: 'male' }),
    ];
    expect(getPersonRole('grandpa', 'me', rels, persons)).toBe('Grandfather');
  });
  it('returns empty when no relationship', () => {
    expect(getPersonRole('stranger', 'me', [], [person({ id: 'me' })])).toBe('');
  });
});

describe('formatPersonYears', () => {
  it('returns birth-death when both', () => {
    const p = person({ id: '1', birthDate: '1920-01-01', deathDate: '1990-12-31' });
    expect(formatPersonYears(p)).toBe('1920-1990');
  });
  it('returns only birth when no death', () => {
    const p = person({ id: '1', birthDate: '1985-05-15' });
    expect(formatPersonYears(p)).toBe('1985');
  });
  it('returns empty when no birth', () => {
    expect(formatPersonYears(person({ id: '1' }))).toBe('');
  });
});

describe('getSiblings', () => {
  it('returns siblings (same parent)', () => {
    const persons = [person({ id: 'a', firstName: 'A' }), person({ id: 'b', firstName: 'B' }), person({ id: 'c', firstName: 'C' })];
    const rels: Relationship[] = [
      { id: 'r1', parentId: 'p', childId: 'a' },
      { id: 'r2', parentId: 'p', childId: 'b' },
      { id: 'r3', parentId: 'p', childId: 'c' },
    ];
    expect(getSiblings('a', persons, rels).map((x) => x.id).sort()).toEqual(['b', 'c']);
  });
  it('returns empty when no parents', () => {
    expect(getSiblings('a', [person({ id: 'a' })], [])).toEqual([]);
  });
});

describe('findMainPersonId', () => {
  it('returns person with matching email', () => {
    const persons = [person({ id: '1', email: 'a@x.com' }), person({ id: '2', email: 'b@x.com' })];
    expect(findMainPersonId(persons, [], 'b@x.com')).toBe('2');
  });
  it('returns deepest from root when no email', () => {
    const persons = [person({ id: 'root' }), person({ id: 'child' })];
    const rels: Relationship[] = [{ id: 'r1', parentId: 'root', childId: 'child' }];
    expect(findMainPersonId(persons, rels)).toBe('child');
  });
  it('returns empty for empty persons', () => {
    expect(findMainPersonId([], [])).toBe('');
  });
});

describe('canAddParent', () => {
  it('returns true when 0 or 1 parent', () => {
    expect(canAddParent('c', [])).toBe(true);
    expect(canAddParent('c', [{ id: 'r1', parentId: 'p1', childId: 'c' }])).toBe(true);
  });
  it('returns false when 2 parents', () => {
    const rels: Relationship[] = [
      { id: 'r1', parentId: 'p1', childId: 'c' },
      { id: 'r2', parentId: 'p2', childId: 'c' },
    ];
    expect(canAddParent('c', rels)).toBe(false);
  });
});

describe('relationshipExists', () => {
  it('returns true when relation exists', () => {
    const rels: Relationship[] = [{ id: 'r1', parentId: 'a', childId: 'b' }];
    expect(relationshipExists('a', 'b', rels)).toBe(true);
  });
  it('returns false when not', () => {
    expect(relationshipExists('a', 'b', [])).toBe(false);
  });
});

describe('formatDateForInput', () => {
  it('returns YYYY-MM-DD for Date', () => {
    const d = new Date(2020, 0, 15);
    expect(formatDateForInput(d)).toMatch(/2020-01-15/);
  });
  it('returns empty for undefined', () => {
    expect(formatDateForInput(undefined)).toBe('');
  });
});

describe('formatDateForComparison', () => {
  it('delegates to formatDateForInput', () => {
    expect(formatDateForComparison(undefined)).toBe('');
  });
});

describe('findAllAncestorIds', () => {
  it('returns parent and grandparent ids', () => {
    const rels: Relationship[] = [
      { id: 'r1', parentId: 'grandpa', childId: 'dad' },
      { id: 'r2', parentId: 'dad', childId: 'me' },
    ];
    expect(findAllAncestorIds('me', rels).sort()).toEqual(['dad', 'grandpa']);
  });
  it('returns empty for no parents', () => {
    expect(findAllAncestorIds('me', [])).toEqual([]);
  });
});

describe('findAllAncestors', () => {
  it('returns ancestor Person objects', () => {
    const persons = [person({ id: 'me' }), person({ id: 'dad', firstName: 'Dad' })];
    const rels: Relationship[] = [{ id: 'r1', parentId: 'dad', childId: 'me' }];
    const anc = findAllAncestors('me', persons, rels);
    expect(anc).toHaveLength(1);
    expect(anc[0].id).toBe('dad');
  });
});

describe('validateParentRelationship', () => {
  it('returns invalid when child already has 2 parents', () => {
    const rels: Relationship[] = [
      { id: 'r1', parentId: 'p1', childId: 'c' },
      { id: 'r2', parentId: 'p2', childId: 'c' },
    ];
    const res = validateParentRelationship('c', rels);
    expect(res.isValid).toBe(false);
  });
  it('returns valid when can add', () => {
    expect(validateParentRelationship('c', [])).toEqual({ isValid: true });
  });
});

describe('validateChildRelationship', () => {
  it('returns invalid when adding child to root', () => {
    const persons = [person({ id: 'root', firstName: 'Root' })];
    const res = validateChildRelationship('root', 'root', persons);
    expect(res.isValid).toBe(false);
  });
  it('returns valid when not root', () => {
    expect(validateChildRelationship('p1', 'root', [])).toEqual({ isValid: true });
  });
});

describe('hasUnsavedPersonChanges', () => {
  it('returns true when firstName differs', () => {

    const formData = formDataFactory({ firstName: 'New', lastName: 'X' });
    const personToEdit = person({ id: '1', firstName: 'Old', lastName: 'X' });
    expect(hasUnsavedPersonChanges(formData, personToEdit, '')).toBe(true);

  });
  it('returns false when same', () => {
    const formData = formDataFactory({ firstName: 'A', lastName: 'B' });
    const personToEdit = person({ id: '1', firstName: 'A', lastName: 'B' });
    expect(hasUnsavedPersonChanges(formData, personToEdit, '')).toBe(false);
  });
});

describe('sortFamilyMembersByRole', () => {
  it('sorts by role order then name', () => {
    const members = [
      { person: person({ id: '2', firstName: 'B', lastName: 'X' }), role: 'Mother' },
      { person: person({ id: '1', firstName: 'A', lastName: 'X' }), role: 'Father' },
    ];
    const sorted = sortFamilyMembersByRole(members);
    expect(sorted[0].role).toBe('Father');
    expect(sorted[1].role).toBe('Mother');
  });
});

describe('generateSystemPrompt', () => {
  it('includes name and role', () => {
    const p = person({ id: '1', firstName: 'John', lastName: 'Smith' });
    const prompt = generateSystemPrompt(p, 'Father');
    expect(prompt).toContain('John Smith');
    expect(prompt).toContain('father');
  });
});
