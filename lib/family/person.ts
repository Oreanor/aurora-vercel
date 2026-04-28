import type { Person, Relationship } from "@/types/family";

export function getPersonFullName(person: Person): string {
  return [person.firstName, person.middleName, person.lastName].filter(Boolean).join(" ");
}

export function getPersonInitial(person: Person): string {
  return person.firstName ? person.firstName.charAt(0).toUpperCase() : "?";
}

export function formatPersonYears(person: Person): string {
  const birthYear = person.birthDate ? new Date(person.birthDate).getFullYear() : null;
  const deathYear = person.deathDate ? new Date(person.deathDate).getFullYear() : null;

  if (!birthYear) return "";
  return deathYear ? `${birthYear}-${deathYear}` : `${birthYear}`;
}

export function findMainPersonId(
  persons: Person[],
  relationships: Relationship[],
  currentUserEmail?: string
): string {
  if (currentUserEmail) {
    const currentUserPerson = persons.find((person) => person.email === currentUserEmail);
    if (currentUserPerson) {
      return currentUserPerson.id;
    }
  }

  const getDepthFromRoot = (personId: string, visited = new Set<string>()): number => {
    if (visited.has(personId)) return -1;
    visited.add(personId);

    const parents = relationships.filter((relationship) => relationship.childId === personId).map((relationship) => relationship.parentId);

    if (parents.length === 0) {
      return 0;
    }

    const parentDepths = parents
      .map((parentId) => getDepthFromRoot(parentId, new Set(visited)))
      .filter((depth) => depth >= 0);

    if (parentDepths.length === 0) return 0;

    return Math.max(...parentDepths) + 1;
  };

  const depthsFromRoot = new Map<string, number>();
  persons.forEach((person) => {
    depthsFromRoot.set(person.id, getDepthFromRoot(person.id));
  });

  const maxDepth = Math.max(...Array.from(depthsFromRoot.values()), 0);
  return Array.from(depthsFromRoot.entries()).find(([, depth]) => depth === maxDepth)?.[0] || "";
}
