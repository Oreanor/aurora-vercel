import type { FamilyTreeData, Person, Relationship, SpouseLink } from "@/types/family";
import { canAddParent, findAllAncestorIds, relationshipExists } from "@/lib/family/relationships";

const createEntityId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

interface RelationshipPayload {
  type: "parent" | "child" | "spouse";
  relatedPersonId: string;
}

export function addPersonToTree(
  data: FamilyTreeData,
  personData: Omit<Person, "id">,
  relationship?: RelationshipPayload
): FamilyTreeData | null {
  const newPersonId = createEntityId("person");
  const newPerson: Person = { ...personData, id: newPersonId };

  let newRelationship: Relationship | null = null;
  let newSpouseLink: SpouseLink | null = null;

  if (relationship) {
    const { type, relatedPersonId } = relationship;

    if (type === "spouse") {
      const [personId1, personId2] = [relatedPersonId, newPersonId].sort();
      newSpouseLink = {
        id: createEntityId("spouse"),
        personId1,
        personId2,
      };
    } else if (type === "child") {
      const relatedPerson = data.persons.find((person) => person.id === relatedPersonId);
      if (!relatedPerson) return null;

      newRelationship = {
        id: createEntityId("rel"),
        parentId: relatedPersonId,
        childId: newPersonId,
      };

      const parentChildren = data.relationships
        .filter((relationshipItem) => relationshipItem.parentId === relatedPersonId)
        .map((relationshipItem) => relationshipItem.childId);
      const spouseCandidates = new Set<string>();

      parentChildren.forEach((childId) => {
        data.relationships
          .filter((relationshipItem) => relationshipItem.childId === childId)
          .map((relationshipItem) => relationshipItem.parentId)
          .filter((parentId) => parentId !== relatedPersonId)
          .forEach((parentId) => spouseCandidates.add(parentId));
      });

      const spouseId = Array.from(spouseCandidates)[0];
      if (spouseId) {
        const spouseRelationship: Relationship = {
          id: `${createEntityId("rel")}-spouse`,
          parentId: spouseId,
          childId: newPersonId,
        };

        return {
          ...data,
          persons: [...data.persons, newPerson],
          relationships: [...data.relationships, newRelationship, spouseRelationship],
        };
      }
    } else if (type === "parent") {
      if (!canAddParent(relatedPersonId, data.relationships)) return null;
      if (relationshipExists(newPersonId, relatedPersonId, data.relationships)) return null;

      newRelationship = {
        id: createEntityId("rel"),
        parentId: newPersonId,
        childId: relatedPersonId,
      };
    }
  }

  return {
    ...data,
    persons: [...data.persons, newPerson],
    relationships: newRelationship ? [...data.relationships, newRelationship] : data.relationships,
    spouseLinks: newSpouseLink ? [...(data.spouseLinks ?? []), newSpouseLink] : data.spouseLinks,
  };
}

export function deletePersonWithAncestors(data: FamilyTreeData, personId: string) {
  const ancestorIds = findAllAncestorIds(personId, data.relationships);
  const deletedIds = Array.from(new Set([personId, ...ancestorIds]));

  return {
    deletedIds,
    nextData: {
      ...data,
      persons: data.persons.filter((person) => !deletedIds.includes(person.id)),
      relationships: data.relationships.filter(
        (relationship) =>
          !deletedIds.includes(relationship.parentId) && !deletedIds.includes(relationship.childId)
      ),
      spouseLinks: (data.spouseLinks ?? []).filter(
        (link) => !deletedIds.includes(link.personId1) && !deletedIds.includes(link.personId2)
      ),
    },
  };
}

export function updatePersonInTree(
  data: FamilyTreeData,
  personId: string,
  personData: Omit<Person, "id">
): FamilyTreeData {
  return {
    ...data,
    persons: data.persons.map((person) => (person.id === personId ? { ...personData, id: personId } : person)),
  };
}
