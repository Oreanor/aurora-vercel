import { FamilyTree } from '@/types/family';

/**
 * Форматирует название дерева в короткий формат "J.Smith family"
 * Берет первую персону из дерева и формирует название из её имени
 */
export function formatTreeNameShort(tree: FamilyTree): string {
  if (tree.data.persons.length === 0) {
    return tree.name || tree.id;
  }

  // Берем первую персону
  const firstPerson = tree.data.persons[0];
  const firstName = firstPerson.firstName || '';
  const lastName = firstPerson.lastName || '';

  if (!firstName && !lastName) {
    return tree.name || tree.id;
  }

  // Формируем "J.Smith family"
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastNameCapitalized = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();

  return `${firstInitial}.${lastNameCapitalized} family`;
}

