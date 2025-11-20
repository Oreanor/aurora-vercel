import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Person, Relationship } from "@/types/family"

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
  // Если это сам главный человек
  if (personId === mainPersonId) {
    return "You";
  }

  // Находим персону для определения пола
  const person = persons.find((p) => p.id === personId);
  const gender = person?.gender || "other";

  // Функция для определения уровня родства (сколько поколений вверх)
  const getGenerationLevel = (
    fromId: string,
    toId: string,
    visited = new Set<string>()
  ): number | null => {
    if (fromId === toId) return 0;
    if (visited.has(fromId)) return null; // Цикл
    visited.add(fromId);

    // Находим родителей
    const parentIds = relationships
      .filter((rel) => rel.childId === fromId)
      .map((rel) => rel.parentId);

    // Проверяем, является ли toId родителем
    if (parentIds.includes(toId)) {
      return 1;
    }

    // Рекурсивно проверяем родителей
    for (const parentId of parentIds) {
      const level = getGenerationLevel(parentId, toId, new Set(visited));
      if (level !== null) {
        return level + 1;
      }
    }

    return null;
  };

  const level = getGenerationLevel(mainPersonId, personId);

  // Если связи нет, возвращаем пустую строку
  if (level === null) {
    return "";
  }

  // Определяем роль на основе уровня и пола
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
      // Для более дальних родственников
      const greatCount = level - 2;
      const greatPrefix = "Great-".repeat(greatCount);
      return gender === "female" ? `${greatPrefix}grandmother` : `${greatPrefix}grandfather`;
  }
}

/**
 * Генерирует system prompt для Mistral на основе данных персоны
 * @param person - данные персоны
 * @param role - роль персоны по отношению к пользователю
 * @returns system prompt для модели
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

  // Добавляем информацию о датах
  if (birthYear) {
    if (deathYear) {
      prompt += `You were born in ${birthYear} and passed away in ${deathYear}. `;
    } else {
      prompt += `You were born in ${birthYear}. `;
    }
  }

  // Добавляем информацию о поле для контекста
  if (person.gender === "female") {
    prompt += "You are a woman. ";
  } else if (person.gender === "male") {
    prompt += "You are a man. ";
  }

  // Добавляем качества, если они есть
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
 * Сортирует членов семьи по роли и имени
 * @param familyMembers - массив членов семьи с их ролями
 * @returns отсортированный массив
 */
export function sortFamilyMembersByRole(
  familyMembers: FamilyMemberWithRole[]
): FamilyMemberWithRole[] {
  return [...familyMembers].sort((a, b) => {
    // Сортируем по роли (родители первыми, потом бабушки/дедушки и т.д.)
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
    // Если порядок одинаковый, сортируем по имени
    const nameA = [a.person.firstName, a.person.lastName].filter(Boolean).join(" ");
    const nameB = [b.person.firstName, b.person.lastName].filter(Boolean).join(" ");
    return nameA.localeCompare(nameB);
  });
}

/**
 * Формирует полное имя персоны из firstName, middleName и lastName
 * @param person - объект персоны
 * @returns полное имя
 */
export function getPersonFullName(person: Person): string {
  return [person.firstName, person.middleName, person.lastName]
    .filter(Boolean)
    .join(" ");
}

/**
 * Получает инициал персоны (первая буква имени)
 * @param person - объект персоны
 * @returns инициал в верхнем регистре или "?"
 */
export function getPersonInitial(person: Person): string {
  return person.firstName ? person.firstName.charAt(0).toUpperCase() : "?";
}

/**
 * Форматирует годы жизни персоны в строку вида "1923-1998" или "1923"
 * @param person - объект персоны
 * @returns отформатированная строка с годами или пустая строка
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
 * Находит главного человека в семейном дереве
 * @param persons - массив всех персон
 * @param relationships - массив связей родитель-ребенок
 * @param currentUserEmail - email текущего пользователя (опционально)
 * @returns ID главного человека или пустая строка
 */
export function findMainPersonId(
  persons: Person[],
  relationships: Relationship[],
  currentUserEmail?: string
): string {
  // Если передан email, ищем персону с таким email
  if (currentUserEmail) {
    const currentUserPerson = persons.find((p) => p.email === currentUserEmail);
    if (currentUserPerson) {
      return currentUserPerson.id;
    }
  }

  // Иначе находим человека с максимальной глубиной от корня
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
