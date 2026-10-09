import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/test/queryClientWrapper";
import type { Client } from "@/types/clients.types";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { useClientHeaderForm } from "./useClientHeaderForm";

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
    addressLine2: null,
    city: null,
    country: null,
    state: null,
    postalCode: null,
    vatNumber: null,
    legalForm: null,
    color: null,
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
    status: "CLIENT",
    contactedAt: null,
    tags: [],
    contacts: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as Client;
}

describe("useClientHeaderForm", () => {
  beforeEach(() => {
    gqlFetch.mockReset().mockResolvedValue({ tags: [] });
    gqlMutate.mockReset();
  });

  it("seeds form state from the client (formFromClient projection)", () => {
    const client = makeClient({
      email: "a@b.com",
      paymentDelayDays: 30,
      taxRate: 5.5,
      contactedAt: "2026-06-01T00:00:00.000Z",
    });
    const { result } = renderHook(() => useClientHeaderForm(client, vi.fn()), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.form).toMatchObject({
      name: "Acme",
      email: "a@b.com",
      paymentDelayDays: "30",
      taxRate: "5.5",
      contactedAt: "2026-06-01",
    });
    expect(result.current.isCompany).toBe(true);
  });

  it("save: company branch erases firstName/lastName, includes legalName/vatNumber", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const client = makeClient({
      id: 5,
      legalName: "Acme Legal",
      vatNumber: "VAT123",
    });
    const { result } = renderHook(() => useClientHeaderForm(client, onUpdate), {
      wrapper: createQueryWrapper(),
    });

    await act(async () => {
      await result.current.handleSave({
        preventDefault: () => {},
      } as React.SubmitEvent<HTMLFormElement>);
    });

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 5,
        clientType: "COMPANY",
        legalName: "Acme Legal",
        vatNumber: "VAT123",
        firstName: null,
        lastName: null,
      }),
    );
  });

  it("save: company branch includes legalForm, addressLine2, state, color, and notes", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const client = makeClient({
      id: 12,
      legalForm: "SAS",
      addressLine2: "Suite 200",
      state: "Quebec",
      color: "#D2D5DA",
      notes: "Prefers email contact",
    });
    const { result } = renderHook(() => useClientHeaderForm(client, onUpdate), {
      wrapper: createQueryWrapper(),
    });

    await act(async () => {
      await result.current.handleSave({
        preventDefault: () => {},
      } as React.SubmitEvent<HTMLFormElement>);
    });

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        legalForm: "SAS",
        addressLine2: "Suite 200",
        state: "Quebec",
        color: "#D2D5DA",
        notes: "Prefers email contact",
      }),
    );
  });

  it("save: individual branch erases legalForm", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const client = makeClient({
      id: 13,
      clientType: "INDIVIDUAL",
      firstName: "Jane",
    });
    const { result } = renderHook(() => useClientHeaderForm(client, onUpdate), {
      wrapper: createQueryWrapper(),
    });

    await act(async () => {
      await result.current.handleSave({
        preventDefault: () => {},
      } as React.SubmitEvent<HTMLFormElement>);
    });

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ legalForm: null }),
    );
  });

  it("save: individual branch erases legalName/vatNumber, includes firstName/lastName", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const client = makeClient({
      id: 6,
      clientType: "INDIVIDUAL",
      firstName: "Jane",
      lastName: "Doe",
    });
    const { result } = renderHook(() => useClientHeaderForm(client, onUpdate), {
      wrapper: createQueryWrapper(),
    });

    await act(async () => {
      await result.current.handleSave({
        preventDefault: () => {},
      } as React.SubmitEvent<HTMLFormElement>);
    });

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 6,
        clientType: "INDIVIDUAL",
        firstName: "Jane",
        lastName: "Doe",
        legalName: null,
        vatNumber: null,
      }),
    );
  });

  it("save: sends contactedAt as a plain YYYY-MM-DD date", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const client = makeClient({ id: 7 });
    const { result } = renderHook(() => useClientHeaderForm(client, onUpdate), {
      wrapper: createQueryWrapper(),
    });

    act(() => {
      result.current.set("contactedAt")({
        target: { value: "2026-06-10" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    await act(async () => {
      await result.current.handleSave({
        preventDefault: () => {},
      } as React.SubmitEvent<HTMLFormElement>);
    });

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ contactedAt: "2026-06-10" }),
    );
  });

  describe("a newer contact date previews the next status", () => {
    const typeDate = (
      result: { current: ReturnType<typeof useClientHeaderForm> },
      value: string,
    ) =>
      act(() => {
        result.current.set("contactedAt")({
          target: { value },
        } as React.ChangeEvent<HTMLInputElement>);
      });
    const formFor = (client: Client) =>
      renderHook(() => useClientHeaderForm(client, vi.fn()), {
        wrapper: createQueryWrapper(),
      }).result;

    it.each([
      ["TO_CONTACT", "CONTACTED"],
      ["FORMER_CLIENT", "CONTACTED"],
      ["CONTACTED", "FOLLOW_UP_1"],
      ["FOLLOW_UP_1", "FOLLOW_UP_2"],
      ["FOLLOW_UP_2", "RECONTACT_LATER"],
      ["RECONTACT_LATER", "CONTACTED"],
    ] as const)("%s shows %s", (from, to) => {
      const result = formFor(
        makeClient({ status: from, contactedAt: "2026-09-28T00:00:00.000Z" }),
      );
      typeDate(result, "2026-10-09");
      expect(result.current.form.status).toBe(to);
    });

    it("counts a first contact date as newer", () => {
      const result = formFor(
        makeClient({ status: "TO_CONTACT", contactedAt: null }),
      );
      typeDate(result, "2026-10-09");
      expect(result.current.form.status).toBe("CONTACTED");
    });

    it.each(["TALKING", "CLIENT"] as const)("%s does not move", (status) => {
      const result = formFor(
        makeClient({ status, contactedAt: "2026-09-28T00:00:00.000Z" }),
      );
      typeDate(result, "2026-10-09");
      expect(result.current.form.status).toBe(status);
    });

    it.each([
      ["an older date", "2026-09-01"],
      ["the same date", "2026-09-28"],
      ["a cleared date", ""],
    ])("goes back to the saved status on %s", (_, back) => {
      const result = formFor(
        makeClient({
          status: "FORMER_CLIENT",
          contactedAt: "2026-09-28T00:00:00.000Z",
        }),
      );
      typeDate(result, "2026-10-09");
      typeDate(result, back);
      expect(result.current.form.status).toBe("FORMER_CLIENT");
    });

    it("recalculates from the saved status, over a status picked before", () => {
      const result = formFor(
        makeClient({
          status: "CONTACTED",
          contactedAt: "2026-09-28T00:00:00.000Z",
        }),
      );
      act(() => {
        result.current.setForm((prev) => ({ ...prev, status: "TALKING" }));
      });
      typeDate(result, "2026-10-09");
      expect(result.current.form.status).toBe("FOLLOW_UP_1");
    });

    it("only a contact date change moves the status", () => {
      const result = formFor(
        makeClient({
          status: "CONTACTED",
          contactedAt: "2026-09-28T00:00:00.000Z",
        }),
      );
      act(() => {
        result.current.setForm((prev) => ({ ...prev, status: "TALKING" }));
      });
      act(() => {
        result.current.set("name")({
          target: { value: "Acme 2" },
        } as React.ChangeEvent<HTMLInputElement>);
      });
      expect(result.current.form.status).toBe("TALKING");
    });

    it("keeps a status picked after the date", () => {
      const result = formFor(
        makeClient({
          status: "CONTACTED",
          contactedAt: "2026-09-28T00:00:00.000Z",
        }),
      );
      typeDate(result, "2026-10-09");
      act(() => {
        result.current.setForm((prev) => ({ ...prev, status: "TALKING" }));
      });
      expect(result.current.form.status).toBe("TALKING");
    });
  });

  it("save: sends null contactedAt when the field is cleared", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const client = makeClient({
      id: 8,
      contactedAt: "2026-06-01T00:00:00.000Z",
    });
    const { result } = renderHook(() => useClientHeaderForm(client, onUpdate), {
      wrapper: createQueryWrapper(),
    });

    act(() => {
      result.current.set("contactedAt")({
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    await act(async () => {
      await result.current.handleSave({
        preventDefault: () => {},
      } as React.SubmitEvent<HTMLFormElement>);
    });

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ contactedAt: null }),
    );
  });

  it.each([
    ["2026-12-01", "2026-12-01"],
    ["", null],
  ])("seeds the recontact date and saves %j as %j", async (typed, sent) => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const client = makeClient({
      id: 10,
      toRecontactAt: "2026-11-02T00:00:00.000Z",
    });
    const { result } = renderHook(() => useClientHeaderForm(client, onUpdate), {
      wrapper: createQueryWrapper(),
    });
    expect(result.current.form.toRecontactAt).toBe("2026-11-02");

    act(() => {
      result.current.set("toRecontactAt")({
        target: { value: typed },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    await act(async () => {
      await result.current.handleSave({
        preventDefault: () => {},
      } as React.SubmitEvent<HTMLFormElement>);
    });

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ toRecontactAt: sent }),
    );
  });

  it("starts with an empty recontact date when the client has none", () => {
    const { result } = renderHook(
      () => useClientHeaderForm(makeClient(), vi.fn()),
      { wrapper: createQueryWrapper() },
    );
    expect(result.current.form.toRecontactAt).toBe("");
  });

  it("sends null for optional empty-string fields so they are erased", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const client = makeClient({ id: 9, email: null, phone: null });
    const { result } = renderHook(() => useClientHeaderForm(client, onUpdate), {
      wrapper: createQueryWrapper(),
    });

    await act(async () => {
      await result.current.handleSave({
        preventDefault: () => {},
      } as React.SubmitEvent<HTMLFormElement>);
    });

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ email: null, phone: null }),
    );
  });

  it("keeps an existing industry on save", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const client = makeClient({ id: 9, industry: "LEGAL" });
    const { result } = renderHook(() => useClientHeaderForm(client, onUpdate), {
      wrapper: createQueryWrapper(),
    });

    await act(async () => {
      await result.current.handleSave({
        preventDefault: () => {},
      } as React.SubmitEvent<HTMLFormElement>);
    });

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ industry: "LEGAL" }),
    );
  });

  it("erases cleared address and industry fields with null", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const client = makeClient({
      id: 9,
      address: "1 Main St",
      city: "Paris",
      country: "FR",
      postalCode: "75001",
      industry: "LEGAL",
    });
    const { result } = renderHook(() => useClientHeaderForm(client, onUpdate), {
      wrapper: createQueryWrapper(),
    });

    act(() => {
      result.current.handleAddressChange("address", "");
      result.current.handleAddressChange("city", "");
      result.current.handleAddressChange("country", "");
      result.current.handleAddressChange("postalCode", "");
      result.current.setForm((prev) => ({ ...prev, industry: null }));
    });
    await act(async () => {
      await result.current.handleSave({
        preventDefault: () => {},
      } as React.SubmitEvent<HTMLFormElement>);
    });

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        address: null,
        city: null,
        country: null,
        postalCode: null,
        industry: null,
      }),
    );
  });

  it("sets editing(false) after a successful save", async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const client = makeClient({ id: 10 });
    const { result } = renderHook(() => useClientHeaderForm(client, onUpdate), {
      wrapper: createQueryWrapper(),
    });

    act(() => result.current.setEditing(true));
    expect(result.current.editing).toBe(true);

    await act(async () => {
      await result.current.handleSave({
        preventDefault: () => {},
      } as React.SubmitEvent<HTMLFormElement>);
    });

    await waitFor(() => expect(result.current.editing).toBe(false));
  });

  it("resetForm reverts in-progress edits back to the client's current values", () => {
    const client = makeClient({ id: 11, name: "Acme" });
    const { result } = renderHook(() => useClientHeaderForm(client, vi.fn()), {
      wrapper: createQueryWrapper(),
    });

    act(() => {
      result.current.set("name")({
        target: { value: "Changed" },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.form.name).toBe("Changed");

    act(() => result.current.resetForm());
    expect(result.current.form.name).toBe("Acme");
  });
});
