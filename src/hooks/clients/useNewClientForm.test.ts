import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/test/queryClientWrapper";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({ gqlFetch, gqlMutate }));

import { useNewClientForm } from "./useNewClientForm";

function submitEvent() {
  return { preventDefault: () => {} } as React.SubmitEvent<HTMLFormElement>;
}

describe("useNewClientForm", () => {
  beforeEach(() => {
    gqlFetch.mockReset().mockResolvedValue({ tags: [] });
    gqlMutate.mockReset();
  });

  it("requires a company name when clientType is COMPANY", async () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useNewClientForm(onClose), {
      wrapper: createQueryWrapper(),
    });

    await act(async () => {
      await result.current.handleSubmit(submitEvent());
    });

    expect(result.current.error).toBe("Company name is required");
    expect(gqlMutate).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("requires a first name when clientType is INDIVIDUAL", async () => {
    const { result } = renderHook(() => useNewClientForm(vi.fn()), {
      wrapper: createQueryWrapper(),
    });

    act(() => result.current.setField("clientType", "INDIVIDUAL"));

    await act(async () => {
      await result.current.handleSubmit(submitEvent());
    });

    expect(result.current.error).toBe("First name is required");
    expect(gqlMutate).not.toHaveBeenCalled();
  });

  it("composes the individual's name from firstName + lastName", async () => {
    gqlMutate.mockResolvedValueOnce({ createClient: { id: 1 } });
    const { result } = renderHook(() => useNewClientForm(vi.fn()), {
      wrapper: createQueryWrapper(),
    });

    act(() => {
      result.current.setField("clientType", "INDIVIDUAL");
      result.current.setField("firstName", "Jane");
      result.current.setField("lastName", "Doe");
    });

    await act(async () => {
      await result.current.handleSubmit(submitEvent());
    });

    const input = gqlMutate.mock.calls[0][1] as {
      input: Record<string, unknown>;
    };
    expect(input.input).toMatchObject({
      clientType: "INDIVIDUAL",
      name: "Jane Doe",
      firstName: "Jane",
      lastName: "Doe",
    });
    expect(input.input).not.toHaveProperty("legalName");
    expect(input.input).not.toHaveProperty("vatNumber");
  });

  it("composes the individual's name from firstName alone when lastName is blank", async () => {
    gqlMutate.mockResolvedValueOnce({ createClient: { id: 1 } });
    const { result } = renderHook(() => useNewClientForm(vi.fn()), {
      wrapper: createQueryWrapper(),
    });

    act(() => {
      result.current.setField("clientType", "INDIVIDUAL");
      result.current.setField("firstName", "Jane");
    });

    await act(async () => {
      await result.current.handleSubmit(submitEvent());
    });

    expect(gqlMutate.mock.calls[0][1]).toMatchObject({
      input: expect.objectContaining({ name: "Jane" }),
    });
  });

  it("converts paymentDelayDays/taxRate to numbers and omits them when blank", async () => {
    gqlMutate.mockResolvedValueOnce({ createClient: { id: 1 } });
    const { result } = renderHook(() => useNewClientForm(vi.fn()), {
      wrapper: createQueryWrapper(),
    });

    act(() => {
      result.current.setField("name", "Acme");
      result.current.setField("paymentDelayDays", "30");
      result.current.setField("taxRate", "5.5");
    });

    await act(async () => {
      await result.current.handleSubmit(submitEvent());
    });

    expect(gqlMutate.mock.calls[0][1]).toMatchObject({
      input: expect.objectContaining({ paymentDelayDays: 30, taxRate: 5.5 }),
    });
  });

  it("omits billingEndOfMonth from the payload when false", async () => {
    gqlMutate.mockResolvedValueOnce({ createClient: { id: 1 } });
    const { result } = renderHook(() => useNewClientForm(vi.fn()), {
      wrapper: createQueryWrapper(),
    });

    act(() => result.current.setField("name", "Acme"));

    await act(async () => {
      await result.current.handleSubmit(submitEvent());
    });

    const input = gqlMutate.mock.calls[0][1] as {
      input: { billingEndOfMonth?: boolean };
    };
    expect(input.input.billingEndOfMonth).toBeUndefined();
  });

  it("includes defaultStatus in the payload when provided", async () => {
    gqlMutate.mockResolvedValueOnce({ createClient: { id: 1 } });
    const { result } = renderHook(
      () => useNewClientForm(vi.fn(), "TO_CONTACT"),
      { wrapper: createQueryWrapper() },
    );

    act(() => result.current.setField("name", "Acme"));

    await act(async () => {
      await result.current.handleSubmit(submitEvent());
    });

    expect(gqlMutate.mock.calls[0][1]).toMatchObject({
      input: expect.objectContaining({ status: "TO_CONTACT" }),
    });
  });

  it("includes addressLine2, state, legalForm, color, and notes when set (company)", async () => {
    gqlMutate.mockResolvedValueOnce({ createClient: { id: 1 } });
    const { result } = renderHook(() => useNewClientForm(vi.fn()), {
      wrapper: createQueryWrapper(),
    });

    act(() => {
      result.current.setField("name", "Acme");
      result.current.handleAddressChange("addressLine2", "Suite 200");
      result.current.handleAddressChange("state", "Quebec");
      result.current.setField("legalForm", "SAS");
      result.current.setField("color", "#D2D5DA");
      result.current.setField("notes", "Prefers email contact");
    });

    await act(async () => {
      await result.current.handleSubmit(submitEvent());
    });

    expect(gqlMutate.mock.calls[0][1]).toMatchObject({
      input: expect.objectContaining({
        addressLine2: "Suite 200",
        state: "Quebec",
        legalForm: "SAS",
        color: "#D2D5DA",
        notes: "Prefers email contact",
      }),
    });
  });

  it("omits legalForm from the payload for INDIVIDUAL clients", async () => {
    gqlMutate.mockResolvedValueOnce({ createClient: { id: 1 } });
    const { result } = renderHook(() => useNewClientForm(vi.fn()), {
      wrapper: createQueryWrapper(),
    });

    act(() => {
      result.current.setField("clientType", "INDIVIDUAL");
      result.current.setField("firstName", "Jane");
      result.current.setField("legalForm", "SAS");
    });

    await act(async () => {
      await result.current.handleSubmit(submitEvent());
    });

    const input = gqlMutate.mock.calls[0][1] as {
      input: Record<string, unknown>;
    };
    expect(input.input).not.toHaveProperty("legalForm");
  });

  it("resets the form, clears tagIds, and calls onClose on success", async () => {
    gqlMutate.mockResolvedValueOnce({ createClient: { id: 1 } });
    const onClose = vi.fn();
    const { result } = renderHook(() => useNewClientForm(onClose), {
      wrapper: createQueryWrapper(),
    });

    act(() => {
      result.current.setField("name", "Acme");
      result.current.setTagIds([1, 2]);
    });

    await act(async () => {
      await result.current.handleSubmit(submitEvent());
    });

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(result.current.form.name).toBe("");
    expect(result.current.tagIds).toEqual([]);
  });
});
