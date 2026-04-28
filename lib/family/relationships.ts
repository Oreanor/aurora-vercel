import type { Person, Relationship } from "@/types/family";

export function getSiblings(personId: string, persons: Person[], relationships: Relationship[]): Person[] {
  const parentIds = new Set(
    relationships.filter((relationship) => relationship.childId === personId).map((relationship) => relationship.parentId)
  );
  if (parentIds.size === 0) return [];

  const siblingIds = new Set<string>();
  relationships.forEach((relationship) => {
    if (relationship.childId !== personId && parentIds.has(relationship.parentId)) {
      siblingIds.add(relationship.childId);
    }
  });

  return persons.filter((person) => siblingIds.has(person.id));
}

export function canAddParent(childId: string, relationships: Relationship[]): boolean {
  return relationships.filter((relationship) => relationship.childId === childId).length < 2;
}

export function relationshipExists(parentId: string, childId: string, relationships: Relationship[]): boolean {
  return relationships.some(
    (relationship) => relationship.parentId === parentId && relationship.childId === childId
  );
}

export function findAllAncestorIds(
  personId: string,
  relationships: Relationship[],
  visited = new Set<string>()
): string[] {
  if (visited.has(personId)) return [];
  visited.add(personId);

  const ancestorIds: string[] = [];
  const parentIds = relationships
    .filter((relationship) => relationship.childId === personId)
    .map((relationship) => relationship.parentId);

  parentIds.forEach((parentId) => {
    ancestorIds.push(parentId);
    ancestorIds.push(...findAllAncestorIds(parentId, relationships, new Set(visited)));
  });

  return ancestorIds;
}

export function findAllAncestors(
  personId: string,
  persons: Person[],
  relationships: Relationship[],
  visited = new Set<string>()
): Person[] {
  if (visited.has(personId)) return [];
  visited.add(personId);

  const ancestors: Person[] = [];
  const parentIds = relationships
    .filter((relationship) => relationship.childId === personId)
    .map((relationship) => relationship.parentId);

  parentIds.forEach((parentId) => {
    const parent = persons.find((person) => person.id === parentId);
    if (parent) {
      ancestors.push(parent);
      ancestors.push(...findAllAncestors(parentId, persons, relationships, new Set(visited)));
    }
  });

  return ancestors;
}

export function findAllDescendantIds(
  personId: string,
  relationships: Relationship[],
  visited = new Set<string>()
): string[] {
  if (visited.has(personId)) return [];
  visited.add(personId);

  const childIds = relationships
    .filter((relationship) => relationship.parentId === personId)
    .map((relationship) => relationship.childId);

  const descendantIds: string[] = [];
  childIds.forEach((childId) => {
    descendantIds.push(childId);
    descendantIds.push(...findAllDescendantIds(childId, relationships, new Set(visited)));
  });

  return descendantIds;
}
