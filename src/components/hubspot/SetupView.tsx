const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(
    "/graphql",
    "",
  ) ?? "http://localhost:3000";

export function SetupView() {
  return (
    <div className="flex flex-col items-center gap-6 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-3xl" aria-hidden="true">
          🔗
        </span>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Connect HubSpot
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
          Authenticate with your HubSpot account to manage contacts, companies,
          and deals.
        </p>
      </div>
      <button
        type="button"
        className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-md transition-colors cursor-pointer"
        onClick={() => {
          window.location.href = `${API_BASE}/hubspot/auth`;
        }}
      >
        Connect HubSpot
      </button>
    </div>
  );
}
