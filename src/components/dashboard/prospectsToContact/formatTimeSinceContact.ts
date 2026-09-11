import type { IntlShape } from "react-intl";

export function formatTimeSinceContact(
  contactedAt: string | null,
  intl: IntlShape,
): string {
  if (!contactedAt)
    return intl.formatMessage({
      id: "dashboard.prospectsToContact.neverContacted",
      defaultMessage: "Never contacted",
    });
  const days = Math.floor(
    (Date.now() - new Date(contactedAt).getTime()) / 86_400_000,
  );
  if (days < 7)
    return intl.formatMessage({
      id: "dashboard.prospectsToContact.contactedThisWeek",
      defaultMessage: "Contacted this week",
    });
  const weeks = Math.floor(days / 7);
  return intl.formatMessage(
    {
      id: "dashboard.prospectsToContact.weeksAgo",
      defaultMessage: "{weeks, plural, one {# week ago} other {# weeks ago}}",
    },
    { weeks },
  );
}
