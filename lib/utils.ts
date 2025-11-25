import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Person, Relationship, IQualities } from "@/types/family"

export interface FamilyMemberWithRole {
  person: Person;
  role: string;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Вычисляет роль персоны по отношению к главному человеку
 * @param personId - ID персоны, для которой вычисляем роль
 * @param mainPersonId - ID главного человека (пользователя)
 * @param relationships - массив связей родитель-ребенок
 * @param persons - массив всех персон (для определения пола)
 * @returns строка с ролью (например, "Отец", "Бабушка", "Прадедушка")
 */
export function getPersonRole(
  personId: string,
  mainPersonId: string,
  relationships: Relationship[],
  persons: Person[]
): string {
  // If this is the main person themselves
  if (personId === mainPersonId) {
    return "You";
  }

  // Find person to determine gender
  const person = persons.find((p) => p.id === personId);
  const gender = person?.gender || "other";

  // Function to determine relationship level (how many generations up)
  const getGenerationLevel = (
    fromId: string,
    toId: string,
    visited = new Set<string>()
  ): number | null => {
    if (fromId === toId) return 0;
    if (visited.has(fromId)) return null; // Cycle
    visited.add(fromId);

    // Find parents
    const parentIds = relationships
      .filter((rel) => rel.childId === fromId)
      .map((rel) => rel.parentId);

    // Check if toId is a parent
    if (parentIds.includes(toId)) {
      return 1;
    }

    // Recursively check parents
    for (const parentId of parentIds) {
      const level = getGenerationLevel(parentId, toId, new Set(visited));
      if (level !== null) {
        return level + 1;
      }
    }

    return null;
  };

  const level = getGenerationLevel(mainPersonId, personId);

  // If no relationship, return empty string
  if (level === null) {
    return "";
  }

  // Determine role based on level and gender
  switch (level) {
    case 1:
      return gender === "female" ? "Mother" : "Father";
    case 2:
      return gender === "female" ? "Grandmother" : "Grandfather";
    case 3:
      return gender === "female" ? "Great-grandmother" : "Great-grandfather";
    case 4:
      return gender === "female" ? "Great-great-grandmother" : "Great-great-grandfather";
    default:
      // For more distant relatives
      const greatCount = level - 2;
      const greatPrefix = "Great-".repeat(greatCount);
      return gender === "female" ? `${greatPrefix}grandmother` : `${greatPrefix}grandfather`;
  }
}

/**
 * Generates system prompt for Mistral based on person data
 * @param person - person data
 * @param role - person's role relative to the user
 * @returns system prompt for the model
 */
export function generateSystemPrompt(person: Person, role: string): string {
  const fullName = getPersonFullName(person);

  const birthYear = person.birthDate
    ? new Date(person.birthDate).getFullYear()
    : null;
  const deathYear = person.deathDate
    ? new Date(person.deathDate).getFullYear()
    : null;

  let prompt = `You are ${fullName}, ${role.toLowerCase()} of the person you are chatting with. `;

  // Add date information
  if (birthYear) {
    if (deathYear) {
      prompt += `You were born in ${birthYear} and passed away in ${deathYear}. `;
    } else {
      prompt += `You were born in ${birthYear}. `;
    }
  }

  // Add gender information for context
  if (person.gender === "female") {
    prompt += "You are a woman. ";
  } else if (person.gender === "male") {
    prompt += "You are a man. ";
  }

  // Add biography if it exists
  if (person.biography) {
    prompt += `About yourself: ${person.biography} `;
  }

  // Add hobbies if they exist
  if (person.hobbies) {
    prompt += `Your hobbies and interests include: ${person.hobbies} `;
  }

  // Add qualities if they exist
  if (person.qualities) {
    const qualities = person.qualities;
    prompt += `You have the following personality traits: `;
    const traits: string[] = [];
    
    if (qualities.passions) traits.push(`passionate about ${qualities.passions}`);
    if (qualities.senseOfHumor) traits.push(`sense of humor: ${qualities.senseOfHumor}`);
    if (qualities.religion) traits.push(`religious: ${qualities.religion}`);
    if (qualities.positivity !== undefined) {
      traits.push(`positivity level: ${qualities.positivity}/10`);
    }
    
    if (traits.length > 0) {
      prompt += traits.join(", ") + ". ";
    }
  }

  prompt += `Respond naturally and warmly as ${role.toLowerCase()} would, sharing memories, wisdom, and family stories. Be authentic to the time period you lived in and maintain the loving, familial relationship with the person you're chatting with.`;

  return prompt;
}

/**
 * Sorts family members by role and name
 * @param familyMembers - array of family members with their roles
 * @returns sorted array
 */
export function sortFamilyMembersByRole(
  familyMembers: FamilyMemberWithRole[]
): FamilyMemberWithRole[] {
  return [...familyMembers].sort((a, b) => {
    // Sort by role (parents first, then grandparents, etc.)
    const roleOrder: { [key: string]: number } = {
      Father: 1,
      Mother: 2,
      Grandfather: 3,
      Grandmother: 4,
      "Great-grandfather": 5,
      "Great-grandmother": 6,
    };
    const orderA = roleOrder[a.role] || 99;
    const orderB = roleOrder[b.role] || 99;
    if (orderA !== orderB) return orderA - orderB;
    // If order is the same, sort by name
    const nameA = [a.person.firstName, a.person.lastName].filter(Boolean).join(" ");
    const nameB = [b.person.firstName, b.person.lastName].filter(Boolean).join(" ");
    return nameA.localeCompare(nameB);
  });
}

/**
 * Forms full name of person from firstName, middleName and lastName
 * @param person - person object
 * @returns full name
 */
export function getPersonFullName(person: Person): string {
  return [person.firstName, person.middleName, person.lastName]
    .filter(Boolean)
    .join(" ");
}

/**
 * Gets person's initial (first letter of name)
 * @param person - person object
 * @returns initial in uppercase or "?"
 */
export function getPersonInitial(person: Person): string {
  return person.firstName ? person.firstName.charAt(0).toUpperCase() : "?";
}

/**
 * Formats person's years of life into string like "1923-1998" or "1923"
 * @param person - person object
 * @returns formatted string with years or empty string
 */
export function formatPersonYears(person: Person): string {
  const birthYear = person.birthDate
    ? new Date(person.birthDate).getFullYear()
    : null;
  const deathYear = person.deathDate
    ? new Date(person.deathDate).getFullYear()
    : null;

  if (!birthYear) return "";
  return deathYear ? `${birthYear}-${deathYear}` : `${birthYear}`;
}

/**
 * Finds the main person in the family tree
 * @param persons - array of all persons
 * @param relationships - array of parent-child relationships
 * @param currentUserEmail - current user's email (optional)
 * @returns ID of main person or empty string
 */
export function findMainPersonId(
  persons: Person[],
  relationships: Relationship[],
  currentUserEmail?: string
): string {
  // If email provided, find person with that email
  if (currentUserEmail) {
    const currentUserPerson = persons.find((p) => p.email === currentUserEmail);
    if (currentUserPerson) {
      return currentUserPerson.id;
    }
  }

  // Otherwise find person with maximum depth from root
  const getDepthFromRoot = (personId: string, visited = new Set<string>()): number => {
    if (visited.has(personId)) return -1;
    visited.add(personId);

    const parents = relationships
      .filter((rel) => rel.childId === personId)
      .map((rel) => rel.parentId);

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
    const depth = getDepthFromRoot(person.id);
    depthsFromRoot.set(person.id, depth);
  });

  const maxDepth = Math.max(...Array.from(depthsFromRoot.values()), 0);
  return (
    Array.from(depthsFromRoot.entries()).find(([, depth]) => depth === maxDepth)?.[0] || ""
  );
}

/**
 * Проверяет, можно ли добавить родителя для указанного ребенка
 * @param childId - ID ребенка
 * @param relationships - массив существующих связей
 * @returns true если можно добавить (меньше 2 родителей), false иначе
 */
export function canAddParent(childId: string, relationships: Relationship[]): boolean {
  const existingParents = relationships.filter((rel) => rel.childId === childId);
  return existingParents.length < 2;
}

/**
 * Проверяет, существует ли уже связь между двумя персонами
 * @param parentId - ID родителя
 * @param childId - ID ребенка
 * @param relationships - массив существующих связей
 * @returns true если связь уже существует
 */
export function relationshipExists(
  parentId: string,
  childId: string,
  relationships: Relationship[]
): boolean {
  return relationships.some(
    (rel) => rel.parentId === parentId && rel.childId === childId
  );
}

/**
 * Formats a date for HTML input[type="date"] (YYYY-MM-DD format)
 * @param date - Date object, string, or undefined
 * @returns Formatted date string or empty string
 */
export function formatDateForInput(date: Date | string | undefined): string {
  if (!date) return '';
  if (typeof date === 'string') return date;
  // If it's a Date object, format as YYYY-MM-DD
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date for comparison (normalizes to YYYY-MM-DD format)
 * @param date - Date object, string, or undefined
 * @returns Formatted date string or empty string
 */
export function formatDateForComparison(date: Date | string | undefined): string {
  return formatDateForInput(date);
}

/**
 * Finds all ancestors of a person recursively (returns IDs)
 * @param personId - ID of the person
 * @param relationships - array of all relationships
 * @param visited - set of visited person IDs (for cycle detection)
 * @returns Array of ancestor IDs
 */
export function findAllAncestorIds(
  personId: string,
  relationships: Relationship[],
  visited = new Set<string>()
): string[] {
  if (visited.has(personId)) return [];
  visited.add(personId);

  const ancestorIds: string[] = [];
  
  // Find all parents of this person
  const parentIds = relationships
    .filter((rel) => rel.childId === personId)
    .map((rel) => rel.parentId);

  parentIds.forEach((parentId) => {
    ancestorIds.push(parentId);
    // Recursively find ancestors of this parent
    const parentAncestors = findAllAncestorIds(parentId, relationships, new Set(visited));
    ancestorIds.push(...parentAncestors);
  });

  return ancestorIds;
}

/**
 * Finds all ancestors of a person recursively (returns Person objects)
 * @param personId - ID of the person
 * @param persons - array of all persons
 * @param relationships - array of all relationships
 * @param visited - set of visited person IDs (for cycle detection)
 * @returns Array of ancestor Person objects
 */
export function findAllAncestors(
  personId: string,
  persons: Person[],
  relationships: Relationship[],
  visited = new Set<string>()
): Person[] {
  if (visited.has(personId)) return [];
  visited.add(personId);

  const ancestors: Person[] = [];
  
  // Find all parents of this person
  const parentIds = relationships
    .filter((rel) => rel.childId === personId)
    .map((rel) => rel.parentId);

  parentIds.forEach((parentId) => {
    const parent = persons.find((p) => p.id === parentId);
    if (parent) {
      ancestors.push(parent);
      // Recursively find ancestors of this parent
      const parentAncestors = findAllAncestors(parentId, persons, relationships, new Set(visited));
      ancestors.push(...parentAncestors);
    }
  });

  return ancestors;
}

/**
 * Validates if a parent of a specific gender can be added to a child
 * @param childId - ID of the child
 * @param parentGender - Gender of the parent to add ('male' or 'female')
 * @param persons - Array of all persons
 * @param relationships - Array of all relationships
 * @returns Object with isValid flag and error message if invalid
 */
export function validateParentRelationship(
  childId: string,
  parentGender: 'male' | 'female',
  persons: Person[],
  relationships: Relationship[]
): { isValid: boolean; error?: string } {
  // Find all relationships where childId is the child
  const existingParentRelations = relationships.filter((rel) => rel.childId === childId);
  
  // Check that child has less than 2 parents
  if (existingParentRelations.length >= 2) {
    return {
      isValid: false,
      error: `This person already has ${existingParentRelations.length} parent(s). Cannot add more parents.`
    };
  }
  
  // Check that new parent is not of the same gender as existing one
  if (existingParentRelations.length > 0) {
    // Find existing parents
    const existingParentIds = existingParentRelations.map((rel) => rel.parentId);
    const existingParents = persons.filter((p) => existingParentIds.includes(p.id));
    
    // Check if there's already a parent of the same gender
    const sameGenderParent = existingParents.find((parent) => parent.gender === parentGender);
    
    if (sameGenderParent) {
      const genderLabel = parentGender === 'male' ? 'father' : 'mother';
      const childPerson = persons.find((p) => p.id === childId);
      const childName = childPerson ? getPersonFullName(childPerson) : 'this person';
      const parentName = getPersonFullName(sameGenderParent);
      return {
        isValid: false,
        error: `Such relationship already exists: ${parentName} is already the ${genderLabel} of ${childName}. Cannot add another ${genderLabel} of the same gender.`
      };
    }
  }
  
  return { isValid: true };
}

/**
 * Validates if a child can be added to a parent (checks if parent is root)
 * @param parentId - ID of the parent
 * @param mainPersonId - ID of the main person (root)
 * @param persons - Array of all persons
 * @returns Object with isValid flag and error message if invalid
 */
export function validateChildRelationship(
  parentId: string,
  mainPersonId: string | undefined,
  persons: Person[]
): { isValid: boolean; error?: string } {
  // Check if trying to add child to root (main person)
  if (mainPersonId && parentId === mainPersonId) {
    const rootPerson = persons.find((p) => p.id === mainPersonId);
    const rootName = rootPerson ? getPersonFullName(rootPerson) : 'root person';
    return {
      isValid: false,
      error: `Cannot add children to the root person (${rootName}). The root person is the main person of the tree and cannot have children.`
    };
  }
  
  return { isValid: true };
}

/**
 * Checks if there are unsaved changes in edit mode by comparing form data with original person
 * @param formData - Current form data
 * @param personToEdit - Original person data
 * @param parentGender - Current parent gender selection (for edit mode)
 * @param qualities - Current qualities data
 * @param showQualities - Whether qualities are shown/enabled
 * @returns true if there are unsaved changes
 */
export function hasUnsavedPersonChanges(
  formData: Omit<Person, 'id'>,
  personToEdit: Person,
  parentGender: 'male' | 'female' | '',
  qualities?: IQualities,
  showQualities?: boolean
): boolean {
  const currentGender = parentGender || formData.gender;
  const originalGender = personToEdit.gender;
  
  if (formData.firstName !== (personToEdit.firstName || '') ||
      formData.lastName !== (personToEdit.lastName || '') ||
      formData.middleName !== (personToEdit.middleName || '') ||
      formatDateForComparison(formData.birthDate) !== formatDateForComparison(personToEdit.birthDate) ||
      formatDateForComparison(formData.deathDate) !== formatDateForComparison(personToEdit.deathDate) ||
      currentGender !== originalGender ||
      formData.photo !== (personToEdit.photo || '') ||
      formData.biography !== (personToEdit.biography || '') ||
      formData.hobbies !== (personToEdit.hobbies || '') ||
      JSON.stringify(showQualities ? qualities : undefined) !== JSON.stringify(personToEdit.qualities)) {
    return true;
  }
  
  return false;
}
