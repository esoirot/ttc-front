import type { SortDirection } from "@/components/sort/SortControls";
import type { PERSON_SORT_FIELDS } from "@/constants/clients";
import type { CompanyContact } from "@/types/clients.types";

export type ContactSortField = (typeof PERSON_SORT_FIELDS)[number];

const collator = new Intl.Collator(undefined, { sensitivity: "base" });

/** Empty names last whatever the direction; same name → other name, then oldest. */
function byName(a: string | null, b: string | null, sign: number): number {
  if (!a || !b) return (a ? 0 : 1) - (b ? 0 : 1);
  return sign * collator.compare(a, b);
}

export function sortContacts(
  contacts: CompanyContact[],
  field: ContactSortField,
  direction: SortDirection,
): CompanyContact[] {
  const sign = direction === "asc" ? 1 : -1;
  const [main, other] =
    field === "LAST_NAME"
      ? (["lastName", "firstName"] as const)
      : (["firstName", "lastName"] as const);
  return [...contacts].sort(
    (a, b) =>
      byName(a[main], b[main], sign) ||
      byName(a[other], b[other], sign) ||
      a.id - b.id,
  );
}
