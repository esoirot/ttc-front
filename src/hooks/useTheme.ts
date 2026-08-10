import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "ttc_theme";

let theme: Theme = document.documentElement.classList.contains("dark")
  ? "dark"
  : "light";

const listeners = new Set<() => void>();

function applyTheme(next: Theme) {
  document.documentElement.classList.toggle("dark", next === "dark");
}

function setTheme(next: Theme) {
  theme = next;
  localStorage.setItem(STORAGE_KEY, next);
  applyTheme(next);
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return theme;
}

export function useTheme() {
  const current = useSyncExternalStore(subscribe, getSnapshot);

  function toggleTheme() {
    setTheme(current === "dark" ? "light" : "dark");
  }

  return { theme: current, toggleTheme };
}
