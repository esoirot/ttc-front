export const MATCH_RATE_ITEMS = [
  { key: "perfectMatch", label: "Perfect Match" },
  { key: "cm", label: "CM" },
  { key: "repetitions", label: "Répétitions" },
  { key: "repetitionsBetweenFiles", label: "Répétitions entre fichiers" },
  { key: "match100", label: "100%" },
  { key: "match95_99", label: "95 - 99%" },
  { key: "match85_94", label: "85 - 94%" },
  { key: "match75_84", label: "75 - 84%" },
  { key: "match50_74", label: "50 - 74%" },
  { key: "referenceAdaptativeMT", label: "Reference AdaptativeMT" },
  { key: "adaptativeMTWithLearning", label: "AdaptativeMt avec apprentissage" },
  { key: "newWordsTA", label: "Nouveaux mots/TA" },
] as const;

export type MatchRateKey = (typeof MATCH_RATE_ITEMS)[number]["key"];

export type MatchRates = Record<MatchRateKey, number>;

export function defaultMatchRates(): MatchRates {
  return Object.fromEntries(
    MATCH_RATE_ITEMS.map((item) => [item.key, 0]),
  ) as MatchRates;
}
