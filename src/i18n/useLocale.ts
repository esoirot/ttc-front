import { useSyncExternalStore } from "react";

export type Locale = "en" | "fr";

const STORAGE_KEY = "ttc_locale";
const SUPPORTED: Locale[] = ["en", "fr"];

function detectLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "fr") return stored;
  const nav = navigator.language.slice(0, 2);
  return SUPPORTED.includes(nav as Locale) ? (nav as Locale) : "en";
}

let locale: Locale = detectLocale();

const listeners = new Set<() => void>();

export function setLocale(next: Locale) {
  locale = next;
  localStorage.setItem(STORAGE_KEY, next);
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return locale;
}

export function getLocale() {
  return locale;
}

export function useLocale() {
  const current = useSyncExternalStore(subscribe, getSnapshot);

  function toggleLocale() {
    setLocale(current === "en" ? "fr" : "en");
  }

  return { locale: current, setLocale, toggleLocale };
}
