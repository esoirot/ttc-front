import { en } from "./en";
import { fr } from "./fr";
import type { Locale } from "../useLocale";

export const messages: Record<Locale, Record<string, string>> = { en, fr };
