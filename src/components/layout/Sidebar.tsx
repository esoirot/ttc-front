import { NavLink, Link } from "react-router-dom";
import { useCurrentUser, useLogout } from "../../hooks/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/layout.types";

const DASHBOARD_ITEM: NavItem = {
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
};

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "CRM",
    items: [
      {
        to: "/clients",
        end: false,
        label: "Clients",
        icon: (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="8"
              cy="5"
              r="2.5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M2 13c0-2.761 2.686-5 6-5s6 2.239 6 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        ),
      },
      {
        to: "/prospects",
        end: false,
        label: "Prospects",
        icon: (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="6.5"
              cy="6.5"
              r="4"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M9.5 9.5L14 14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Project Management",
    items: [
      {
        to: "/projects",
        end: false,
        label: "Projects",
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
              y="3"
              width="14"
              height="10"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M5 7h6M5 10h4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        ),
      },
      {
        to: "/time",
        end: false,
        label: "Time",
        icon: (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="currentColor"
              strokeWidth="1.5"
            />
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
    ],
  },
  {
    label: "Business",
    items: [
      {
        to: "/activities",
        end: false,
        label: "My Activity",
        icon: (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="1.5"
              y="4.5"
              width="13"
              height="9"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M5 4.5V3.5A1.5 1.5 0 0 1 6.5 2h3A1.5 1.5 0 0 1 11 3.5v1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M1.5 8.5h13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        to: "/invoices",
        end: false,
        label: "Invoices",
        icon: (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="2"
              y="1"
              width="12"
              height="14"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M5 5h6M5 8h6M5 11h3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        ),
      },
      {
        to: "/rates",
        end: false,
        label: "Rates",
        icon: (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M8 5v1.5M8 9.5V11M6.5 6.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5c0 1-1.5 1.5-1.5 2.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Integrations",
    items: [
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
            <circle
              cx="5"
              cy="8"
              r="2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
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
      {
        to: "/time-tracker",
        end: false,
        label: "Clockify",
        icon: (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
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
    ],
  },
];

const ADMIN_NAV_ITEM: NavItem = {
  to: "/admin",
  end: false,
  label: "Admin",
  icon: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M2 13c0-2.761 2.686-5 6-5s6 2.239 6 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="13" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M13 9.5v-.5M13 12.5v.5M11.5 11h-.5M14.5 11h.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
};

function NavItemLink({ to, end, label, icon }: NavItem) {
  return (
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
  );
}

export function Sidebar() {
  const { user } = useCurrentUser();
  const { logout, loading } = useLogout();

  return (
    <aside className="flex flex-row flex-wrap border-b border-border sm:flex-col sm:flex-nowrap sm:w-56 sm:shrink-0 sm:sticky sm:top-0 sm:h-screen sm:overflow-y-auto sm:border-b-0 sm:border-r bg-sidebar">
      <div className="flex items-center gap-2 px-4 py-5 font-bold text-sm tracking-tight border-r border-border sm:border-r-0 sm:border-b">
        <span className="text-primary text-base" aria-hidden="true">
          ⟡
        </span>
        Freelance Assistant
      </div>

      <nav
        className="flex flex-row flex-1 items-center gap-1 p-2 sm:flex-col sm:flex-1 sm:items-stretch"
        aria-label="Main navigation"
      >
        <NavItemLink {...DASHBOARD_ITEM} />

        {NAV_GROUPS.map(({ label, items }) => (
          <div key={label} className="contents sm:flex sm:flex-col">
            <p className="hidden sm:block px-3 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            {items.map((item) => (
              <NavItemLink key={item.to} {...item} />
            ))}
          </div>
        ))}

        {user?.role === "ADMIN" && (
          <div className="contents sm:flex sm:flex-col">
            <p className="hidden sm:block px-3 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              System
            </p>
            <NavItemLink {...ADMIN_NAV_ITEM} />
          </div>
        )}
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
