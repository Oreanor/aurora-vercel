export function familyRoleToKey(role: string): string | null {
  switch (role) {
    case "You":
      return "roles.you";
    case "Father":
      return "roles.father";
    case "Mother":
      return "roles.mother";
    case "Grandfather":
      return "roles.grandfather";
    case "Grandmother":
      return "roles.grandmother";
    case "Great-grandfather":
      return "roles.greatGrandfather";
    case "Great-grandmother":
      return "roles.greatGrandmother";
    case "Great-great-grandfather":
      return "roles.greatGreatGrandfather";
    case "Great-great-grandmother":
      return "roles.greatGreatGrandmother";
    default:
      return null;
  }
}

export function translateFamilyRole(
  role: string,
  t: (path: string, variables?: Record<string, string | number | null | undefined>) => string
): string {
  const key = familyRoleToKey(role);
  if (key) {
    return t(key);
  }

  const normalized = role.toLowerCase();
  const grandmotherSuffix = "grandmother";
  const grandfatherSuffix = "grandfather";

  if (normalized.endsWith(grandmotherSuffix) || normalized.endsWith(grandfatherSuffix)) {
    const isFemale = normalized.endsWith(grandmotherSuffix);
    const prefix = normalized
      .replace(grandmotherSuffix, "")
      .replace(grandfatherSuffix, "");
    const greatCount = prefix.split("great-").filter(Boolean).length;

    if (greatCount > 0) {
      return t(isFemale ? "roles.greatAncestorFemale" : "roles.greatAncestorMale", {
        count: greatCount,
      });
    }
  }

  return role;
}
