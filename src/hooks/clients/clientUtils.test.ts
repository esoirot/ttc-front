import { describe, expect, it } from "vitest";
import type { Client, CompanyContact } from "@/types/clients.types";
import { contactLabel, hasBilling } from "./clientUtils";

function makeClient(overrides: Partial<Client> = {}): Client {
  return {
    id: 1,
    userId: 1,
    name: "Acme",
    legalName: null,
    email: null,
    phone: null,
    company: null,
    address: null,
    city: null,
    country: null,
    postalCode: null,
    vatNumber: null,
    notes: null,
    hubspotId: null,
    clientType: "COMPANY",
    firstName: null,
    lastName: null,
    paymentDelayDays: null,
    taxRate: null,
    billingEndOfMonth: false,
    website: null,
    industry: null,
    tags: [],
    contacts: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as Client;
}

function makeContact(overrides: Partial<CompanyContact> = {}): CompanyContact {
  return {
    id: 1,
    clientId: 1,
    firstName: null,
    lastName: null,
    email: null,
    phone: null,
    jobTitle: null,
    color: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("hasBilling", () => {
  it("is false when no billing fields are set", () => {
    expect(hasBilling(makeClient())).toBe(false);
  });

  it("is true when paymentDelayDays is set", () => {
    expect(hasBilling(makeClient({ paymentDelayDays: 30 }))).toBe(true);
  });

  it("is true when taxRate is set", () => {
    expect(hasBilling(makeClient({ taxRate: 0.2 }))).toBe(true);
  });

  it("is true when billingEndOfMonth is set", () => {
    expect(hasBilling(makeClient({ billingEndOfMonth: true }))).toBe(true);
  });
});

describe("contactLabel", () => {
  it("returns null when there are no contacts and no client email/phone", () => {
    expect(contactLabel(makeClient())).toBeNull();
  });

  it("falls back to client email when there are no contacts", () => {
    expect(contactLabel(makeClient({ email: "a@b.com" }))).toBe("a@b.com");
  });

  it("falls back to client phone when there is no contact or email", () => {
    expect(contactLabel(makeClient({ phone: "123" }))).toBe("123");
  });

  it("joins first contact's first and last name", () => {
    const client = makeClient({
      contacts: [makeContact({ firstName: "Jane", lastName: "Doe" })],
    });
    expect(contactLabel(client)).toBe("Jane Doe");
  });

  it("falls back to first contact's email when name is missing", () => {
    const client = makeClient({
      contacts: [makeContact({ email: "jane@acme.com" })],
    });
    expect(contactLabel(client)).toBe("jane@acme.com");
  });

  it("falls back to first contact's phone when name and email are missing", () => {
    const client = makeClient({
      contacts: [makeContact({ phone: "555-1234" })],
    });
    expect(contactLabel(client)).toBe("555-1234");
  });

  it("returns null when the first contact has no name, email, or phone", () => {
    const client = makeClient({ contacts: [makeContact()] });
    expect(contactLabel(client)).toBeNull();
  });
});
