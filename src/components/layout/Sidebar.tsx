import { NavLink } from "react-router-dom";
import { useCurrentUser, useLogout } from "../../hooks/useAuth";

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
    to: "/settings/2fa",
    end: false,
    label: "Security",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M8 1L2 3.5v4C2 11 5 14 8 15c3-1 6-4 6-7.5v-4L8 1z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M5.5 8l1.5 1.5 3-3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export function Sidebar() {
  const { user } = useCurrentUser();
  const { logout, loading } = useLogout();

  return (
    <aside className="flex flex-row flex-wrap border-b border-zinc-200 dark:border-zinc-800 sm:flex-col sm:flex-nowrap sm:w-56 sm:shrink-0 sm:sticky sm:top-0 sm:h-screen sm:overflow-y-auto sm:border-b-0 sm:border-r">
      {/* Brand */}
      <div className="flex items-center gap-2 px-4 py-5 font-bold text-sm text-zinc-900 dark:text-white tracking-tight border-r border-zinc-200 dark:border-zinc-800 sm:border-r-0 sm:border-b">
        <span className="text-violet-500 text-base" aria-hidden="true">
          ⟡
        </span>
        Translator Assistant
      </div>

      {/* Nav */}
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
              `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium no-underline transition-colors ${
                isActive
                  ? "bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400"
                  : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
              }`
            }
          >
            <span className="flex items-center shrink-0">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex flex-row items-center gap-3 p-3 w-full border-t border-zinc-200 dark:border-zinc-800 sm:flex-col sm:items-stretch sm:p-4">
        <div className="flex-1 flex flex-col gap-1 min-w-0">
          <span className="text-xs font-medium text-zinc-900 dark:text-white truncate">
            {user?.name ?? user?.email}
          </span>
          <span className="text-xs font-semibold px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 rounded w-fit">
            {user?.role}
          </span>
        </div>
        <button
          className="px-3 py-1.5 bg-transparent text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-md text-xs font-medium cursor-pointer hover:border-violet-500 hover:text-violet-600 transition-colors disabled:opacity-50 sm:w-full"
          onClick={logout}
          disabled={loading}
        >
          {loading ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </aside>
  );
}
