import { FamilyTree } from '@/types/family';

/**
 * Formats tree name into short format "J.Smith family"
 * Takes the first person from the tree and forms name from their name
 */
export function formatTreeNameShort(tree: FamilyTree): string {
  if (tree.data.persons.length === 0) {
    return tree.name || tree.id;
  }

  // Take the first person
  const firstPerson = tree.data.persons[0];
  const firstName = firstPerson.firstName || '';
  const lastName = firstPerson.lastName || '';

  if (!firstName && !lastName) {
    return tree.name || tree.id;
  }

  // Form "J.Smith family"
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastNameCapitalized = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();

  return `${firstInitial}.${lastNameCapitalized} family`;
}

