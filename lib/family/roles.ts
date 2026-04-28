import type { Person, Relationship } from "@/types/family";

export interface FamilyMemberWithRole {
  person: Person;
  role: string;
}

export function getPersonRole(
  personId: string,
  mainPersonId: string,
  relationships: Relationship[],
  persons: Person[]
): string {
  if (personId === mainPersonId) {
    return "You";
  }

  const person = persons.find((candidate) => candidate.id === personId);
  const gender = person?.gender || "other";

  const getGenerationLevel = (fromId: string, toId: string, visited = new Set<string>()): number | null => {
    if (fromId === toId) return 0;
    if (visited.has(fromId)) return null;
    visited.add(fromId);

    const parentIds = relationships
      .filter((relationship) => relationship.childId === fromId)
      .map((relationship) => relationship.parentId);

    if (parentIds.includes(toId)) {
      return 1;
    }

    for (const parentId of parentIds) {
      const level = getGenerationLevel(parentId, toId, new Set(visited));
      if (level !== null) {
        return level + 1;
      }
    }

    return null;
  };

  const level = getGenerationLevel(mainPersonId, personId);
  if (level === null) {
    return "";
  }

  switch (level) {
    case 1:
      return gender === "female" ? "Mother" : "Father";
    case 2:
      return gender === "female" ? "Grandmother" : "Grandfather";
    case 3:
      return gender === "female" ? "Great-grandmother" : "Great-grandfather";
    case 4:
      return gender === "female" ? "Great-great-grandmother" : "Great-great-grandfather";
    default: {
      const greatPrefix = "Great-".repeat(level - 2);
      return gender === "female" ? `${greatPrefix}grandmother` : `${greatPrefix}grandfather`;
    }
  }
}

export function sortFamilyMembersByRole(
  familyMembers: FamilyMemberWithRole[]
): FamilyMemberWithRole[] {
  return [...familyMembers].sort((left, right) => {
    const roleOrder: Record<string, number> = {
      Father: 1,
      Mother: 2,
      Grandfather: 3,
      Grandmother: 4,
      "Great-grandfather": 5,
      "Great-grandmother": 6,
    };

    const orderLeft = roleOrder[left.role] || 99;
    const orderRight = roleOrder[right.role] || 99;
    if (orderLeft !== orderRight) return orderLeft - orderRight;

    const nameLeft = [left.person.firstName, left.person.lastName].filter(Boolean).join(" ");
    const nameRight = [right.person.firstName, right.person.lastName].filter(Boolean).join(" ");
    return nameLeft.localeCompare(nameRight);
  });
}
