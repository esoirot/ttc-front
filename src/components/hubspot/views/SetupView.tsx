import { Button } from "@/components/ui/button";

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
        <h2 className="text-lg font-semibold">Connect HubSpot</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Authenticate with your HubSpot account to manage contacts, companies,
          and deals.
        </p>
      </div>
      <Button
        type="button"
        onClick={() => {
          window.location.href = `${API_BASE}/hubspot/auth`;
        }}
      >
        Connect HubSpot
      </Button>
    </div>
  );
}
