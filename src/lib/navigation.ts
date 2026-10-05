// Full-page navigation goes through here instead of touching window.location
// directly, so tests can mock it (window.location is non-configurable under
// Vitest's vmThreads pool).

export function redirectTo(url: string): void {
  window.location.href = url;
}

export function replaceLocation(url: string): void {
  window.location.replace(url);
}

export function currentPathname(): string {
  return window.location.pathname;
}

// Pages reachable without a session: an auth failure here must not trigger a
// token refresh or a redirect to /login.
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/2fa",
  "/forgot-password",
  "/reset-password",
];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}
