import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Person, Relationship, Gender } from "@/types/family"

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
  const fullName = [person.firstName, person.middleName, person.lastName]
    .filter(Boolean)
    .join(" ");

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
