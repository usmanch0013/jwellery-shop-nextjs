export function formatBlogDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
