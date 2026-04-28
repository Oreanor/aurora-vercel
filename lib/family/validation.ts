import type { IQualities, Person, Relationship } from "@/types/family";
import { formatDateForComparison } from "@/lib/family/dates";
import { getPersonFullName } from "@/lib/family/person";

export interface RelationshipValidationResult {
  isValid: boolean;
  error?: string;
  errorKey?: string;
  errorValues?: Record<string, string | number>;
}

export function validateParentRelationship(
  childId: string,
  relationships: Relationship[]
): RelationshipValidationResult {
  const existingParentRelations = relationships.filter((relationship) => relationship.childId === childId);

  if (existingParentRelations.length >= 2) {
    return {
      isValid: false,
      error: `This person already has ${existingParentRelations.length} parent(s). Cannot add more parents.`,
      errorKey: "personForm.validation.tooManyParents",
      errorValues: { count: existingParentRelations.length },
    };
  }

  return { isValid: true };
}

export function validateChildRelationship(
  parentId: string,
  mainPersonId: string | undefined,
  persons: Person[]
): RelationshipValidationResult {
  if (mainPersonId && parentId === mainPersonId) {
    const rootPerson = persons.find((person) => person.id === mainPersonId);
    const rootName = rootPerson ? getPersonFullName(rootPerson) : "";
    return {
      isValid: false,
      error: `Cannot add children to the root person (${rootName}). The root person is the main person of the tree and cannot have children.`,
      errorKey: "personForm.validation.cannotAddChildrenToRoot",
      errorValues: { name: rootName },
    };
  }

  return { isValid: true };
}

export function hasUnsavedPersonChanges(
  formData: Omit<Person, "id">,
  personToEdit: Person,
  parentGender: "male" | "female" | "",
  qualities?: IQualities,
  showQualities?: boolean
): boolean {
  const currentGender = parentGender || formData.gender;
  const originalGender = personToEdit.gender;

  return (
    formData.firstName !== (personToEdit.firstName || "") ||
    formData.lastName !== (personToEdit.lastName || "") ||
    formData.middleName !== (personToEdit.middleName || "") ||
    formatDateForComparison(formData.birthDate) !== formatDateForComparison(personToEdit.birthDate) ||
    formatDateForComparison(formData.deathDate) !== formatDateForComparison(personToEdit.deathDate) ||
    currentGender !== originalGender ||
    formData.photo !== (personToEdit.photo || "") ||
    formData.biography !== (personToEdit.biography || "") ||
    formData.hobbies !== (personToEdit.hobbies || "") ||
    JSON.stringify(showQualities ? qualities : undefined) !== JSON.stringify(personToEdit.qualities)
  );
}
