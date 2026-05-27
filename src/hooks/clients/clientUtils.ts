import type { Client } from "@/types/clients.types";

export function hasBilling(client: Client): boolean {
  return (
    client.paymentDelayDays !== null ||
    client.taxRate !== null ||
    client.billingEndOfMonth
  );
}

export function contactLabel(client: Client): string | null {
  const first = client.contacts[0];
  if (first) {
    return (
      [first.firstName, first.lastName].filter(Boolean).join(" ") ||
      first.email ||
      first.phone ||
      null
    );
  }
  return client.email || client.phone || null;
}
