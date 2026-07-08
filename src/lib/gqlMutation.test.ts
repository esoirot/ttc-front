import { gql } from "@apollo/client/core";
import type { TypedDocumentNode } from "@apollo/client/core";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/test/queryClientWrapper";

const { gqlMutate } = vi.hoisted(() => ({ gqlMutate: vi.fn() }));
vi.mock("@/lib/apollo", () => ({ gqlFetch: vi.fn(), gqlMutate }));

import { useGqlMutation } from "./gqlMutation";

interface Widget {
  id: number;
  name: string;
}

const CREATE_WIDGET_MUTATION: TypedDocumentNode<
  { createWidget: Widget },
  { name: string }
> = gql`
  mutation CreateWidget($name: String!) {
    createWidget(input: { name: $name }) {
      id
      name
    }
  }
`;

describe("useGqlMutation", () => {
  beforeEach(() => gqlMutate.mockReset());

  it("unwraps the mutation result via the unwrap function", async () => {
    gqlMutate.mockResolvedValueOnce({
      createWidget: { id: 1, name: "Sprocket" },
    });

    const { result } = renderHook(
      () =>
        useGqlMutation({
          mutation: CREATE_WIDGET_MUTATION,
          unwrap: (d) => d.createWidget,
        }),
      { wrapper: createQueryWrapper() },
    );

    const widget = await result.current.mutateAsync({ name: "Sprocket" });

    expect(widget).toEqual({ id: 1, name: "Sprocket" });
    expect(gqlMutate).toHaveBeenCalledWith(CREATE_WIDGET_MUTATION, {
      name: "Sprocket",
    });
  });

  it("calls onSuccess with the unwrapped result and original variables", async () => {
    gqlMutate.mockResolvedValueOnce({
      createWidget: { id: 1, name: "Sprocket" },
    });
    const onSuccess = vi.fn();

    const { result } = renderHook(
      () =>
        useGqlMutation({
          mutation: CREATE_WIDGET_MUTATION,
          unwrap: (d) => d.createWidget,
          onSuccess,
        }),
      { wrapper: createQueryWrapper() },
    );

    await result.current.mutateAsync({ name: "Sprocket" });

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(onSuccess.mock.calls[0][0]).toEqual({ id: 1, name: "Sprocket" });
    expect(onSuccess.mock.calls[0][1]).toEqual({ name: "Sprocket" });
  });

  it("surfaces a rejected mutation as an error", async () => {
    gqlMutate.mockRejectedValueOnce(new Error("network down"));

    const { result } = renderHook(
      () =>
        useGqlMutation({
          mutation: CREATE_WIDGET_MUTATION,
          unwrap: (d) => d.createWidget,
        }),
      { wrapper: createQueryWrapper() },
    );

    await expect(
      result.current.mutateAsync({ name: "Sprocket" }),
    ).rejects.toThrow("network down");
  });
});
