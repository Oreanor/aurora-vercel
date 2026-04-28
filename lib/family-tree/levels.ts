import type { FamilyTreeData, Person } from "@/types/family";
import { findMainPersonId } from "@/lib/family/person";

export function resolveMainPersonId(
  data: FamilyTreeData,
  currentUserEmail?: string,
  rootPersonId?: string
) {
  const mainPersonId = rootPersonId || findMainPersonId(data.persons, data.relationships, currentUserEmail);

  if (!mainPersonId || !data.persons.find((person) => person.id === mainPersonId)) {
    return data.persons[0]?.id ?? null;
  }

  return mainPersonId;
}

export function buildLevelsFromMain(
  data: FamilyTreeData,
  mainPersonId: string,
  showDescendants: boolean
) {
  const levelsFromMain = new Map<string, number>();
  levelsFromMain.set(mainPersonId, 0);

  let currentLevel = 0;
  let toProcess = [mainPersonId];
  const processed = new Set<string>([mainPersonId]);

  while (toProcess.length > 0) {
    const nextLevel: string[] = [];

    toProcess.forEach((personId) => {
      const connectedIds = data.relationships
        .filter((relationship) =>
          showDescendants ? relationship.parentId === personId : relationship.childId === personId
        )
        .map((relationship) => (showDescendants ? relationship.childId : relationship.parentId))
        .filter((candidateId) => !processed.has(candidateId));

      connectedIds.forEach((candidateId) => {
        if (candidateId === mainPersonId) return;

        levelsFromMain.set(candidateId, currentLevel + 1);
        if (!processed.has(candidateId)) {
          nextLevel.push(candidateId);
          processed.add(candidateId);
        }
      });
    });

    toProcess = nextLevel;
    currentLevel += 1;
  }

  data.persons.forEach((person) => {
    if (!levelsFromMain.has(person.id)) {
      levelsFromMain.set(person.id, 999);
    }
  });

  if (!showDescendants && data.spouseLinks?.length) {
    let changed = true;
    while (changed) {
      changed = false;
      for (const link of data.spouseLinks) {
        const level1 = levelsFromMain.get(link.personId1);
        const level2 = levelsFromMain.get(link.personId2);
        if (level1 !== undefined && level1 !== 999 && (level2 === undefined || level2 === 999)) {
          levelsFromMain.set(link.personId2, level1);
          changed = true;
        }
        if (level2 !== undefined && level2 !== 999 && (level1 === undefined || level1 === 999)) {
          levelsFromMain.set(link.personId1, level2);
          changed = true;
        }
      }
    }
  }

  return levelsFromMain;
}

export function alignParentLevels(data: FamilyTreeData, levelsFromMain: Map<string, number>, mainPersonId: string) {
  const childrenByParents = new Map<string, Set<string>>();

  data.relationships.forEach((relationship) => {
    if (!childrenByParents.has(relationship.childId)) {
      childrenByParents.set(relationship.childId, new Set());
    }
    childrenByParents.get(relationship.childId)!.add(relationship.parentId);
  });

  childrenByParents.forEach((parentIds, childId) => {
    if (parentIds.size <= 1) return;

    const childLevel = levelsFromMain.get(childId);
    if (childLevel === undefined || childLevel === 999) return;

    const parentLevels = Array.from(parentIds)
      .map((parentId) => {
        const level = levelsFromMain.get(parentId);
        return level !== undefined && level !== 999 ? level : null;
      })
      .filter((level): level is number => level !== null);

    if (parentLevels.length !== parentIds.size || parentLevels.length === 0) return;

    const maxParentLevel = Math.max(...parentLevels);
    parentIds.forEach((parentId) => {
      if (parentId === mainPersonId) return;

      const currentLevel = levelsFromMain.get(parentId);
      if (currentLevel !== undefined && currentLevel !== 999 && currentLevel < maxParentLevel) {
        levelsFromMain.set(parentId, maxParentLevel);
      }
    });
  });
}

export function normalizeTreeLevels(levelsFromMain: Map<string, number>) {
  const normalizedLevels = new Map<string, number>();
  levelsFromMain.forEach((level, personId) => {
    normalizedLevels.set(personId, level === 999 ? 999 : level);
  });
  return normalizedLevels;
}

export function groupPersonsByLevel(persons: Person[], normalizedLevels: Map<string, number>) {
  const personsByLevel = new Map<number, Person[]>();

  persons.forEach((person) => {
    const level = normalizedLevels.get(person.id);
    if (level === undefined || level === 999) return;

    if (!personsByLevel.has(level)) {
      personsByLevel.set(level, []);
    }
    personsByLevel.get(level)!.push(person);
  });

  return personsByLevel;
}
