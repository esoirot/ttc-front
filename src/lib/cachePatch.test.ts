import { QueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import {
  appendToFlatArray,
  patchConnection,
  patchFlatArray,
  patchNestedField,
  removeFromConnection,
  removeFromFlatArray,
} from "./cachePatch";

interface Widget {
  id: number;
  name: string;
}

interface WidgetConnection {
  items: Widget[];
  nextCursor: number | null;
  total: number;
}

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function connectionData(
  items: Widget[],
  total = items.length,
): InfiniteData<WidgetConnection> {
  return {
    pages: [{ items, nextCursor: null, total }],
    pageParams: [undefined],
  };
}

describe("patchFlatArray", () => {
  it("upserts an item into a flat array cache by id", () => {
    const qc = makeClient();
    qc.setQueryData(["widgets"], [{ id: 1, name: "A" }]);

    patchFlatArray(
      qc,
      ["widgets"],
      { id: 1, name: "A-updated" },
      (w: Widget) => w.id,
    );

    expect(qc.getQueryData(["widgets"])).toEqual([
      { id: 1, name: "A-updated" },
    ]);
  });

  it("does nothing when the cache key has no data yet", () => {
    const qc = makeClient();

    patchFlatArray(qc, ["widgets"], { id: 1, name: "A" }, (w: Widget) => w.id);

    expect(qc.getQueryData(["widgets"])).toBeUndefined();
  });
});

describe("appendToFlatArray", () => {
  it("appends a new item to an existing flat array cache", () => {
    const qc = makeClient();
    qc.setQueryData(["widgets"], [{ id: 1, name: "A" }]);

    appendToFlatArray(qc, ["widgets"], { id: 2, name: "B" });

    expect(qc.getQueryData(["widgets"])).toEqual([
      { id: 1, name: "A" },
      { id: 2, name: "B" },
    ]);
  });

  it("creates the array when the cache key was empty", () => {
    const qc = makeClient();

    appendToFlatArray(qc, ["widgets"], { id: 1, name: "A" });

    expect(qc.getQueryData(["widgets"])).toEqual([{ id: 1, name: "A" }]);
  });
});

describe("removeFromFlatArray", () => {
  it("removes the item matching the id from a flat array cache", () => {
    const qc = makeClient();
    qc.setQueryData(
      ["widgets"],
      [
        { id: 1, name: "A" },
        { id: 2, name: "B" },
      ],
    );

    removeFromFlatArray(qc, ["widgets"], 1, (w: Widget) => w.id);

    expect(qc.getQueryData(["widgets"])).toEqual([{ id: 2, name: "B" }]);
  });
});

describe("patchConnection", () => {
  it("upserts the item across every cached page matching the key prefix", () => {
    const qc = makeClient();
    qc.setQueryData(
      ["clients", { search: "" }],
      connectionData([{ id: 1, name: "Acme" }]),
    );

    patchConnection(
      qc,
      ["clients"],
      { id: 1, name: "Acme Corp" },
      (w: Widget) => w.id,
    );

    expect(
      qc.getQueryData<InfiniteData<WidgetConnection>>([
        "clients",
        { search: "" },
      ])?.pages[0].items,
    ).toEqual([{ id: 1, name: "Acme Corp" }]);
  });
});

describe("removeFromConnection", () => {
  it("removes the item and decrements total across every cached page matching the key prefix", () => {
    const qc = makeClient();
    qc.setQueryData(
      ["clients", { search: "" }],
      connectionData(
        [
          { id: 1, name: "Acme" },
          { id: 2, name: "Globex" },
        ],
        2,
      ),
    );

    removeFromConnection(qc, ["clients"], 1, (w: Widget) => w.id);

    const page = qc.getQueryData<InfiniteData<WidgetConnection>>([
      "clients",
      { search: "" },
    ])?.pages[0];
    expect(page?.items).toEqual([{ id: 2, name: "Globex" }]);
    expect(page?.total).toBe(1);
  });
});

interface Invoice {
  id: number;
  items: InvoiceItem[];
}

interface InvoiceItem {
  id: number;
  description: string;
}

describe("patchNestedField", () => {
  it("adds a new item into a nested array field", () => {
    const qc = makeClient();
    qc.setQueryData(["invoice", 1], {
      id: 1,
      items: [{ id: 1, description: "Design" }],
    });

    patchNestedField<Invoice, InvoiceItem>(
      qc,
      ["invoice", 1],
      "items",
      { id: 2, description: "Dev" },
      (i) => i.id,
      "add",
    );

    expect(qc.getQueryData<Invoice>(["invoice", 1])?.items).toEqual([
      { id: 1, description: "Design" },
      { id: 2, description: "Dev" },
    ]);
  });

  it("upserts an existing item in a nested array field", () => {
    const qc = makeClient();
    qc.setQueryData(["invoice", 1], {
      id: 1,
      items: [{ id: 1, description: "Design" }],
    });

    patchNestedField<Invoice, InvoiceItem>(
      qc,
      ["invoice", 1],
      "items",
      { id: 1, description: "Design (revised)" },
      (i) => i.id,
      "upsert",
    );

    expect(qc.getQueryData<Invoice>(["invoice", 1])?.items).toEqual([
      { id: 1, description: "Design (revised)" },
    ]);
  });

  it("removes an item from a nested array field", () => {
    const qc = makeClient();
    qc.setQueryData(["invoice", 1], {
      id: 1,
      items: [
        { id: 1, description: "Design" },
        { id: 2, description: "Dev" },
      ],
    });

    patchNestedField<Invoice, InvoiceItem>(
      qc,
      ["invoice", 1],
      "items",
      { id: 1, description: "Design" },
      (i) => i.id,
      "remove",
    );

    expect(qc.getQueryData<Invoice>(["invoice", 1])?.items).toEqual([
      { id: 2, description: "Dev" },
    ]);
  });
});
