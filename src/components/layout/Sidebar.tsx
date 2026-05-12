import { NavLink, Link } from "react-router-dom";
import { useCurrentUser, useLogout } from "../../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    to: "/",
    end: true,
    label: "Dashboard",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="1"
          y="1"
          width="6"
          height="6"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="9"
          y="1"
          width="6"
          height="6"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="1"
          y="9"
          width="6"
          height="6"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="9"
          y="9"
          width="6"
          height="6"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    to: "/time-tracker",
    end: false,
    label: "Time Tracker",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M8 4.5v4l2.5 1.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: "/hubspot",
    end: false,
    label: "HubSpot",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="5" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle
          cx="12"
          cy="4"
          r="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle
          cx="12"
          cy="12"
          r="1.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M7 7l3.5-2M7 9l3.5 2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function Sidebar() {
  const { user } = useCurrentUser();
  const { logout, loading } = useLogout();

  return (
    <aside className="flex flex-row flex-wrap border-b border-border sm:flex-col sm:flex-nowrap sm:w-56 sm:shrink-0 sm:sticky sm:top-0 sm:h-screen sm:overflow-y-auto sm:border-b-0 sm:border-r bg-sidebar">
      <div className="flex items-center gap-2 px-4 py-5 font-bold text-sm tracking-tight border-r border-border sm:border-r-0 sm:border-b">
        <span className="text-primary text-base" aria-hidden="true">
          ⟡
        </span>
        Translator Assistant
      </div>

      <nav
        className="flex flex-row flex-1 items-center gap-1 p-2 sm:flex-col sm:flex-1 sm:items-stretch"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map(({ to, end, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium no-underline transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )
            }
          >
            <span className="flex items-center shrink-0">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <Separator className="hidden sm:block" />

      <div className="flex flex-row items-center gap-3 p-3 w-full sm:flex-col sm:items-stretch sm:p-4">
        <Link
          to="/profile/edit"
          className="flex-1 flex flex-col gap-1 min-w-0 no-underline hover:opacity-80 transition-opacity"
        >
          <span className="text-xs font-medium truncate">
            {user?.name ?? user?.email}
          </span>
          <Badge variant="secondary" className="w-fit text-xs">
            {user?.role}
          </Badge>
        </Link>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 sm:w-full"
          onClick={logout}
          disabled={loading}
        >
          {loading ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    </aside>
  );
}
