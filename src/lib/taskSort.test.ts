import { describe, expect, it } from "vitest";
import { compareTasks } from "./taskSort";
import type { Task } from "@/types/tasks.types";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 1,
    projectId: 1,
    assigneeId: null,
    title: "Task",
    description: null,
    status: "TODO",
    dueDate: null,
    startDate: null,
    recurring: null,
    reminderOffset: null,
    sortOrder: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as Task;
}

describe("compareTasks", () => {
  it("sorts by title ascending case-insensitively", () => {
    const a = makeTask({ title: "banana" });
    const b = makeTask({ title: "Apple" });
    expect(compareTasks(a, b, "title", "asc")).toBeGreaterThan(0);
    expect(compareTasks(b, a, "title", "asc")).toBeLessThan(0);
  });

  it("sorts by title descending", () => {
    const a = makeTask({ title: "Apple" });
    const b = makeTask({ title: "banana" });
    expect(compareTasks(a, b, "title", "desc")).toBeGreaterThan(0);
  });

  it("sorts by createdAt ascending (oldest first)", () => {
    const older = makeTask({ createdAt: "2026-01-01T00:00:00.000Z" });
    const newer = makeTask({ createdAt: "2026-02-01T00:00:00.000Z" });
    expect(compareTasks(older, newer, "createdAt", "asc")).toBeLessThan(0);
  });

  it("sorts by createdAt descending (newest first)", () => {
    const older = makeTask({ createdAt: "2026-01-01T00:00:00.000Z" });
    const newer = makeTask({ createdAt: "2026-02-01T00:00:00.000Z" });
    expect(compareTasks(older, newer, "createdAt", "desc")).toBeGreaterThan(0);
  });

  it("sorts by dueDate ascending (soonest first)", () => {
    const soon = makeTask({ dueDate: "2026-01-01T00:00:00.000Z" });
    const later = makeTask({ dueDate: "2026-05-01T00:00:00.000Z" });
    expect(compareTasks(soon, later, "dueDate", "asc")).toBeLessThan(0);
  });

  it("sorts by dueDate descending (latest first)", () => {
    const soon = makeTask({ dueDate: "2026-01-01T00:00:00.000Z" });
    const later = makeTask({ dueDate: "2026-05-01T00:00:00.000Z" });
    expect(compareTasks(soon, later, "dueDate", "desc")).toBeGreaterThan(0);
  });

  it("always places tasks with no due date last, regardless of direction", () => {
    const dated = makeTask({ dueDate: "2026-01-01T00:00:00.000Z" });
    const undated = makeTask({ dueDate: null });
    expect(compareTasks(dated, undated, "dueDate", "asc")).toBeLessThan(0);
    expect(compareTasks(dated, undated, "dueDate", "desc")).toBeLessThan(0);
    expect(compareTasks(undated, dated, "dueDate", "asc")).toBeGreaterThan(0);
    expect(compareTasks(undated, dated, "dueDate", "desc")).toBeGreaterThan(0);
  });

  it("treats two undated tasks as equal for dueDate sort", () => {
    const a = makeTask({ dueDate: null });
    const b = makeTask({ dueDate: null });
    expect(compareTasks(a, b, "dueDate", "asc")).toBe(0);
    expect(compareTasks(a, b, "dueDate", "desc")).toBe(0);
  });
});
