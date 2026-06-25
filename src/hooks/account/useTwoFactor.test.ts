import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/test/queryClientWrapper";

const { gqlFetch, gqlMutate } = vi.hoisted(() => ({
  gqlFetch: vi.fn(),
  gqlMutate: vi.fn(),
}));

vi.mock("@/lib/apollo", () => ({
  gqlFetch,
  gqlMutate,
  apolloClient: { clearStore: vi.fn() },
}));

import { useTwoFactor } from "./useTwoFactor";

describe("useTwoFactor", () => {
  beforeEach(() => {
    gqlFetch.mockReset();
    gqlMutate.mockReset();
    gqlFetch.mockResolvedValue({ me: null });
  });

  it("starts with empty codes and the disable form hidden", () => {
    const { result } = renderHook(() => useTwoFactor(), {
      wrapper: createQueryWrapper(),
    });

    expect(result.current.tfaCode).toBe("");
    expect(result.current.tfaDone).toBe(false);
    expect(result.current.showDisableForm).toBe(false);
  });

  it("handleEnableTfa submits the current code and flips tfaDone", async () => {
    gqlMutate.mockResolvedValueOnce({
      enableTwoFactor: { backupCodes: ["a", "b"] },
    });

    const { result } = renderHook(() => useTwoFactor(), {
      wrapper: createQueryWrapper(),
    });

    act(() => {
      result.current.setTfaCode("123456");
    });

    await act(async () => {
      await result.current.handleEnableTfa({
        preventDefault: () => {},
      } as unknown as React.SubmitEvent<HTMLFormElement>);
    });

    expect(gqlMutate).toHaveBeenCalledWith(expect.anything(), {
      code: "123456",
    });
    await waitFor(() => expect(result.current.tfaDone).toBe(true));
  });

  it("setShowDisableForm toggles the disable form visibility", () => {
    const { result } = renderHook(() => useTwoFactor(), {
      wrapper: createQueryWrapper(),
    });

    act(() => {
      result.current.setShowDisableForm(true);
    });

    expect(result.current.showDisableForm).toBe(true);
  });
});
