export function formatDateForInput(date: Date | string | undefined): string {
  if (!date) return "";
  if (typeof date === "string") return date;

  const resolvedDate = new Date(date);
  const year = resolvedDate.getFullYear();
  const month = String(resolvedDate.getMonth() + 1).padStart(2, "0");
  const day = String(resolvedDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateForComparison(date: Date | string | undefined): string {
  return formatDateForInput(date);
}
