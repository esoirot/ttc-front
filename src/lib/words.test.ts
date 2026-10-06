import { describe, expect, it } from "vitest";
import { parseWordCount, taskWordTotal } from "./words";

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

  it("is 0 when nothing is set", () => {
    expect(taskWordTotal({ wordCount: null, subtasks: [] })).toBe(0);
  });
});
