import { describe, expect, it } from "vitest";
import { messages } from "./messages";

// Every message is declared inline as { id, defaultMessage } (or the JSX
// equivalent). The English defaultMessage is only shown when a key is missing
// from the loaded catalog, so the real guarantees are: each id exists in every
// catalog, and the inline English text is the same as the English catalog.
const sources = import.meta.glob<string>(
  [
    "/src/**/*.{ts,tsx}",
    "!/src/**/*.test.*",
    "!/src/**/*.stories.*",
    "!/src/i18n/messages/**",
  ],
  { query: "?raw", import: "default", eager: true },
);

const DESCRIPTOR =
  /id[=:]\s*"([\w.-]+)"\s*,?\s*defaultMessage[=:]\s*\{?\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/g;

function unescape(s: string): string {
  return s.replace(/\\(["'\\])/g, "$1");
}

const used = new Map<string, { defaultMessage: string; file: string }[]>();
for (const [file, source] of Object.entries(sources)) {
  for (const m of source.matchAll(DESCRIPTOR)) {
    const list = used.get(m[1]) ?? [];
    list.push({ defaultMessage: unescape(m[2] ?? m[3]), file });
    used.set(m[1], list);
  }
}

describe("i18n catalogs", () => {
  it("finds the message descriptors in the source", () => {
    expect(used.size).toBeGreaterThan(500);
  });

  it("has the same keys in English and French", () => {
    expect(Object.keys(messages.fr).sort()).toEqual(
      Object.keys(messages.en).sort(),
    );
  });

  it.each(["en", "fr"] as const)(
    "defines every message id used in the code in the %s catalog",
    (locale) => {
      const missing = [...used.keys()].filter(
        (id) => !(id in messages[locale]),
      );
      expect(missing).toEqual([]);
    },
  );

  it("keeps each inline English default identical to the English catalog", () => {
    const drift = [...used.entries()].flatMap(([id, uses]) =>
      uses
        .filter(
          (u) =>
            id in messages.en &&
            u.defaultMessage !== messages.en[id as keyof typeof messages.en],
        )
        .map(
          (u) =>
            `${id} (${u.file}): "${u.defaultMessage}" vs "${messages.en[id as keyof typeof messages.en]}"`,
        ),
    );
    expect(drift).toEqual([]);
  });

  it("has no empty translations", () => {
    const empty = (["en", "fr"] as const).flatMap((locale) =>
      Object.entries(messages[locale])
        .filter(([, v]) => !String(v).trim())
        .map(([k]) => `${locale}:${k}`),
    );
    expect(empty).toEqual([]);
  });
});
