import { describe, expect, it } from "vitest";
import { parseWordCount, taskWordTotal, projectWordTotal } from "./words";

describe("parseWordCount", () => {
  it.each([
    ["", null],
    ["   ", null],
    ["0", 0],
    ["1200", 1200],
    [" 45 ", 45],
  ])("reads %j as %j", (input, expected) => {
    expect(parseWordCount(input)).toBe(expected);
  });

  it.each(["-5", "12.5", "abc", "1e3", "12 000", "+3"])(
    "rejects %j",
    (input) => {
      expect(parseWordCount(input)).toBe("invalid");
    },
  );
});

describe("taskWordTotal", () => {
  it("adds the task's own words and its checklist items' words", () => {
    expect(
      taskWordTotal({
        wordCount: 500,
        subtasks: [{ wordCount: 200 }, { wordCount: null }],
      }),
    ).toBe(700);
  });

  it("also adds the words logged on the task's time entries", () => {
    expect(
      taskWordTotal({
        wordCount: 500,
        subtasks: [{ wordCount: 200 }],
        totalWordsProcessed: 300,
      }),
    ).toBe(1000);
  });

  it("is 0 when nothing is set", () => {
    expect(taskWordTotal({ wordCount: null, subtasks: [] })).toBe(0);
    expect(
      taskWordTotal({
        wordCount: null,
        subtasks: [],
        totalWordsProcessed: null,
      }),
    ).toBe(0);
  });
});

describe("projectWordTotal", () => {
  it("adds time-entry words to task and checklist words", () => {
    expect(
      projectWordTotal({ totalWordsProcessed: 400, totalTaskWords: 700 }),
    ).toBe(1100);
  });

  it("counts a missing side as 0", () => {
    expect(projectWordTotal({ totalWordsProcessed: 400 })).toBe(400);
    expect(projectWordTotal({ totalTaskWords: 700 })).toBe(700);
    expect(
      projectWordTotal({ totalWordsProcessed: null, totalTaskWords: null }),
    ).toBe(0);
  });
});
