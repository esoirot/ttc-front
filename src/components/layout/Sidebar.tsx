import { NavLink, Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useIntl, FormattedMessage } from "react-intl";
import type { MessageDescriptor } from "react-intl";
import { useCurrentUser, useLogout } from "../../hooks/auth/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/i18n/useLocale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/layout.types";

type TranslatedNavItem = Omit<NavItem, "label"> & {
  labelMessage: MessageDescriptor;
};

const DASHBOARD_ITEM: TranslatedNavItem = {
  to: "/",
  end: true,
  labelMessage: {
    id: "layout.sidebar.nav.dashboard",
    defaultMessage: "Dashboard",
  },
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

const NAV_GROUPS: {
  labelMessage: MessageDescriptor;
  items: TranslatedNavItem[];
}[] = [
  {
    labelMessage: { id: "layout.sidebar.group.crm", defaultMessage: "CRM" },
    items: [
      {
        to: "/clients",
        end: false,
        labelMessage: {
          id: "layout.sidebar.nav.clients",
          defaultMessage: "Clients",
        },
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
        labelMessage: {
          id: "layout.sidebar.nav.prospects",
          defaultMessage: "Prospects",
        },
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
    labelMessage: {
      id: "layout.sidebar.group.projectManagement",
      defaultMessage: "Project Management",
    },
    items: [
      {
        to: "/projects",
        end: false,
        labelMessage: {
          id: "layout.sidebar.nav.projects",
          defaultMessage: "Projects",
        },
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
        labelMessage: { id: "layout.sidebar.nav.time", defaultMessage: "Time" },
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
    labelMessage: {
      id: "layout.sidebar.group.business",
      defaultMessage: "Business",
    },
    items: [
      {
        to: "/activities",
        end: false,
        labelMessage: {
          id: "layout.sidebar.nav.myActivity",
          defaultMessage: "My Activity",
        },
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
    labelMessage: {
      id: "layout.sidebar.group.finance",
      defaultMessage: "Finance",
    },
    items: [
      {
        to: "/invoices",
        end: false,
        labelMessage: {
          id: "layout.sidebar.nav.invoices",
          defaultMessage: "Invoices",
        },
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
        labelMessage: {
          id: "layout.sidebar.nav.rates",
          defaultMessage: "Rates",
        },
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
    labelMessage: {
      id: "layout.sidebar.group.integrations",
      defaultMessage: "Integrations",
    },
    items: [
      {
        to: "/hubspot",
        end: false,
        labelMessage: {
          id: "layout.sidebar.nav.hubspot",
          defaultMessage: "HubSpot",
        },
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
        labelMessage: {
          id: "layout.sidebar.nav.clockify",
          defaultMessage: "Clockify",
        },
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
      {
        to: "/google-calendar",
        end: false,
        labelMessage: {
          id: "layout.sidebar.nav.googleCalendar",
          defaultMessage: "Google Calendar",
        },
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
              y="2.5"
              width="13"
              height="12"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M1.5 6h13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M4.5 1.5v2M11.5 1.5v2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        ),
      },
    ],
  },
];

const ADMIN_NAV_ITEM: TranslatedNavItem = {
  to: "/admin",
  end: false,
  labelMessage: { id: "layout.sidebar.nav.admin", defaultMessage: "Admin" },
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

function NavItemLink({ to, end, labelMessage, icon }: TranslatedNavItem) {
  const intl = useIntl();
  return (
    <NavLink
      key={to}
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium no-underline transition-colors",
          isActive
            ? "bg-primary/10 text-primary hover:bg-primary/20"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )
      }
    >
      <span className="flex items-center shrink-0">{icon}</span>
      {intl.formatMessage(labelMessage)}
    </NavLink>
  );
}

export function Sidebar() {
  const intl = useIntl();
  const { user } = useCurrentUser();
  const { logout, loading } = useLogout();
  const { theme, toggleTheme } = useTheme();
  const { locale, toggleLocale } = useLocale();

  return (
    <aside className="flex flex-row flex-wrap border-b border-border sm:flex-col sm:flex-nowrap sm:w-56 sm:shrink-0 sm:sticky sm:top-0 sm:h-screen sm:overflow-y-auto sm:border-b-0 sm:border-r bg-sidebar">
      <div className="flex items-center justify-between gap-2 px-4 py-5 font-bold text-sm tracking-tight border-r border-border sm:border-r-0 sm:border-b">
        <span className="flex items-center gap-2">
          <span className="text-primary text-base" aria-hidden="true">
            ⟡
          </span>
          <FormattedMessage
            id="layout.sidebar.appName"
            defaultMessage="Freelance Assistant"
          />
        </span>
        <span className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={intl.formatMessage(
              locale === "en"
                ? {
                    id: "layout.sidebar.switchToFrench",
                    defaultMessage: "Switch to French",
                  }
                : {
                    id: "layout.sidebar.switchToEnglish",
                    defaultMessage: "Switch to English",
                  },
            )}
            onClick={toggleLocale}
            className="text-xs font-semibold"
          >
            {locale.toUpperCase()}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={intl.formatMessage(
              theme === "dark"
                ? {
                    id: "layout.sidebar.switchToLightMode",
                    defaultMessage: "Switch to light mode",
                  }
                : {
                    id: "layout.sidebar.switchToDarkMode",
                    defaultMessage: "Switch to dark mode",
                  },
            )}
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>
        </span>
      </div>

      <nav
        className="flex flex-row flex-1 items-center gap-1 p-2 sm:flex-col sm:flex-1 sm:items-stretch"
        aria-label={intl.formatMessage({
          id: "layout.sidebar.mainNav",
          defaultMessage: "Main navigation",
        })}
      >
        <NavItemLink {...DASHBOARD_ITEM} />

        {NAV_GROUPS.map(({ labelMessage, items }) => (
          <div key={labelMessage.id} className="contents sm:flex sm:flex-col">
            <p className="hidden sm:block px-3 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {intl.formatMessage(labelMessage)}
            </p>
            {items.map((item) => (
              <NavItemLink key={item.to} {...item} />
            ))}
          </div>
        ))}

        {user?.role === "ADMIN" && (
          <div className="contents sm:flex sm:flex-col">
            <p className="hidden sm:block px-3 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <FormattedMessage
                id="layout.sidebar.group.system"
                defaultMessage="System"
              />
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
          {loading ? (
            <FormattedMessage
              id="layout.sidebar.signingOut"
              defaultMessage="Signing out…"
            />
          ) : (
            <FormattedMessage
              id="layout.sidebar.signOut"
              defaultMessage="Sign out"
            />
          )}
        </Button>
      </div>
    </aside>
  );
}
