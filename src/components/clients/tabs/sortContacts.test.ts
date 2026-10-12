import { describe, expect, it } from "vitest";
import type { CompanyContact } from "@/types/clients.types";
import { sortContacts } from "./sortContacts";

const contact = (
  id: number,
  firstName: string | null,
  lastName: string | null,
): CompanyContact => ({
  id,
  clientId: 1,
  firstName,
  lastName,
  email: null,
  phone: null,
  jobTitle: null,
  color: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

const names = (list: CompanyContact[]) =>
  list.map((c) => [c.firstName, c.lastName].filter(Boolean).join(" "));

const zoe = contact(1, "Zoé", "Martin");
const anne = contact(2, "Anne", "Durand");
const bob = contact(3, "Bob", null);

describe("sortContacts", () => {
  it("sorts by last name A to Z, empty names last", () => {
    expect(names(sortContacts([zoe, bob, anne], "LAST_NAME", "asc"))).toEqual([
      "Anne Durand",
      "Zoé Martin",
      "Bob",
    ]);
  });

  it("sorts by last name Z to A, empty names still last", () => {
    expect(names(sortContacts([anne, bob, zoe], "LAST_NAME", "desc"))).toEqual([
      "Zoé Martin",
      "Anne Durand",
      "Bob",
    ]);
  });

  it("sorts by first name", () => {
    expect(names(sortContacts([zoe, bob, anne], "FIRST_NAME", "asc"))).toEqual([
      "Anne Durand",
      "Bob",
      "Zoé Martin",
    ]);
    expect(names(sortContacts([zoe, bob, anne], "FIRST_NAME", "desc"))).toEqual(
      ["Zoé Martin", "Bob", "Anne Durand"],
    );
  });

  it("breaks ties on the other name, then oldest first", () => {
    const list = [
      contact(9, "Paul", "Durand"),
      contact(7, "Marc", "Durand"),
      contact(4, "Marc", "Durand"),
    ];
    expect(sortContacts(list, "LAST_NAME", "asc").map((c) => c.id)).toEqual([
      4, 7, 9,
    ]);
  });

  it("ignores case and accents", () => {
    // "Émile" and "emile" are the same name, so the first name decides.
    const list = [contact(2, "Zed", "emile"), contact(1, "Abe", "Émile")];
    expect(sortContacts(list, "LAST_NAME", "asc").map((c) => c.id)).toEqual([
      1, 2,
    ]);
  });

  it("does not change the list it is given", () => {
    const list = [zoe, anne];
    sortContacts(list, "LAST_NAME", "asc");
    expect(list).toEqual([zoe, anne]);
  });
});
