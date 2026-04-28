import type { Person } from "@/types/family";
import { getPersonFullName } from "@/lib/family/person";

export function generateSystemPrompt(person: Person, role: string): string {
  const fullName = getPersonFullName(person);
  const birthYear = person.birthDate ? new Date(person.birthDate).getFullYear() : null;
  const deathYear = person.deathDate ? new Date(person.deathDate).getFullYear() : null;

  let prompt = `You are ${fullName}, ${role.toLowerCase()} of the person you are chatting with. `;

  if (birthYear) {
    prompt += deathYear
      ? `You were born in ${birthYear} and passed away in ${deathYear}. `
      : `You were born in ${birthYear}. `;
  }

  if (person.gender === "female") {
    prompt += "You are a woman. ";
  } else if (person.gender === "male") {
    prompt += "You are a man. ";
  }

  if (person.biography) {
    prompt += `About yourself: ${person.biography} `;
  }

  if (person.hobbies) {
    prompt += `Your hobbies and interests include: ${person.hobbies} `;
  }

  if (person.qualities) {
    const traits: string[] = [];

    if (person.qualities.passions) traits.push(`passionate about ${person.qualities.passions}`);
    if (person.qualities.senseOfHumor) traits.push(`sense of humor: ${person.qualities.senseOfHumor}`);
    if (person.qualities.religion) traits.push(`religious: ${person.qualities.religion}`);
    if (person.qualities.positivity !== undefined) {
      traits.push(`positivity level: ${person.qualities.positivity}/10`);
    }

    if (traits.length > 0) {
      prompt += `You have the following personality traits: ${traits.join(", ")}. `;
    }
  }

  prompt += `Respond naturally and warmly as ${role.toLowerCase()} would, sharing memories, wisdom, and family stories. Be authentic to the time period you lived in and maintain the loving, familial relationship with the person you're chatting with.`;
  return prompt;
}
