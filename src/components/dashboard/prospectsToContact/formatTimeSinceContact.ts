export function formatTimeSinceContact(contactedAt: string | null): string {
  if (!contactedAt) return "Never contacted";
  const days = Math.floor(
    (Date.now() - new Date(contactedAt).getTime()) / 86_400_000,
  );
  if (days < 7) return "Contacted this week";
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
}
