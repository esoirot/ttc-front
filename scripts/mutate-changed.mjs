// Mutation testing on the lines changed since origin/main (unpushed commits,
// uncommitted edits, new files). Used by `pnpm run check`.
// `--mutate` replaces the `mutate` globs of stryker.config.json, so the same
// exclusions are applied here.
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const SOURCE = /^src\/.*\.(ts|tsx)$/;
const EXCLUDED =
  /\.test\.tsx?$|\.stories\.tsx$|\.d\.ts$|^src\/(test|types|components\/ui)\/|^src\/main\.tsx$/;

const git = (...args) => execFileSync("git", args, { encoding: "utf8" });

let base = "HEAD";
try {
  base = git("merge-base", "HEAD", "origin/main").trim();
} catch {
  // no remote: compare with the last commit
}

const ranges = new Map();
let file = null;
for (const line of git("diff", "-U0", "--no-renames", base).split("\n")) {
  if (line.startsWith("+++ ")) {
    file = line === "+++ /dev/null" ? null : line.slice(6);
  } else if (file && line.startsWith("@@")) {
    const [, start, count = "1"] = line.match(/\+(\d+)(?:,(\d+))?/);
    if (count !== "0") {
      const to = Number(start) + Number(count) - 1;
      ranges.set(file, [...(ranges.get(file) ?? []), `${start}-${to}`]);
    }
  }
}
for (const added of git("ls-files", "--others", "--exclude-standard").split(
  "\n",
)) {
  if (added) ranges.set(added, null);
}

const mutate = [...ranges]
  .filter(([path]) => SOURCE.test(path) && !EXCLUDED.test(path))
  .flatMap(([path, lines]) =>
    lines ? lines.map((r) => `${path}:${r}`) : [path],
  );

if (mutate.length === 0) {
  console.log("Mutation testing: no changed source lines since origin/main.");
  process.exit(0);
}
console.log(`Mutation testing ${mutate.length} changed range(s).`);
const run = spawnSync(
  "pnpm",
  ["exec", "stryker", "run", "--incremental", "--mutate", mutate.join(",")],
  { stdio: "inherit" },
);
if (run.status !== 0) process.exit(run.status ?? 1);

// Stryker's table mixes whole files and earlier runs: list only the mutants
// that survived on the changed lines.
const inChangedLines = (path, line) => {
  const lines = ranges.get(path);
  return (
    !lines ||
    lines.some((r) => {
      const [from, to] = r.split("-").map(Number);
      return line >= from && line <= to;
    })
  );
};
const { files } = JSON.parse(
  readFileSync("reports/stryker-incremental.json", "utf8"),
);
const left = Object.entries(files).flatMap(([path, { mutants }]) =>
  ranges.has(path)
    ? mutants
        .filter(
          (m) =>
            ["Survived", "NoCoverage"].includes(m.status) &&
            inChangedLines(path, m.location.start.line),
        )
        .map(
          (m) =>
            `  ${m.status} ${path}:${m.location.start.line} ${m.mutatorName} → ${JSON.stringify(m.replacement ?? "").slice(0, 60)}`,
        )
    : [],
);
console.log(
  left.length === 0
    ? "Changed lines: every mutant killed."
    : `Changed lines: ${left.length} mutant(s) left — add a test only where one guards real behaviour:\n${left.join("\n")}`,
);
