import { NavLink, Link } from "react-router-dom";
import { useCurrentUser } from "../../hooks/auth/useAuth";
import type { AdminPermission } from "@/types/users.types";
import { cn } from "@/lib/utils";

const RESOURCE_LINKS: {
  to: string;
  label: string;
  permission?: AdminPermission;
}[] = [
  { to: "/admin/users", label: "Users", permission: "MANAGE_USERS" },
  { to: "/admin/clients", label: "Clients", permission: "MANAGE_CLIENTS" },
  { to: "/admin/projects", label: "Projects", permission: "MANAGE_PROJECTS" },
  { to: "/admin/invoices", label: "Invoices", permission: "MANAGE_INVOICES" },
  { to: "/admin/time", label: "Time Entries", permission: "MANAGE_TIME" },
  { to: "/admin/rates", label: "Rates", permission: "MANAGE_RATES" },
];

const SYSTEM_LINKS = [
  { to: "/admin/audit", label: "Audit Log" },
  { to: "/admin/hubspot", label: "HubSpot" },
  { to: "/admin/activity", label: "Activity Log" },
];

function NavGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-3 mb-4">
      <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-1 px-2">
        {label}
      </p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === "/admin"}
      className={({ isActive }) =>
        cn(
          "flex items-center px-2 py-1.5 rounded text-sm transition-colors",
          isActive
            ? "bg-primary text-primary-foreground font-medium"
            : "text-foreground/70 hover:text-foreground hover:bg-accent/50",
        )
      }
    >
      {label}
    </NavLink>
  );
}

export function AdminSidebar() {
  const { user } = useCurrentUser();
  const perms: AdminPermission[] = user?.adminPermissions ?? [];

  // superadmin (ADMIN role with empty perms) sees everything
  const hasAll = perms.length === 0;
  const canSee = (p: AdminPermission) => hasAll || perms.includes(p);

  return (
    // wrap in .dark to force dark palette regardless of system preference
    <div className="dark h-full">
      <aside className="w-56 h-full flex flex-col bg-background border-r border-border overflow-y-auto shrink-0">
        {/* Header */}
        <div className="px-4 py-4 border-b border-border">
          <Link
            to="/admin"
            className="block text-base font-bold text-foreground leading-tight"
          >
            Admin
          </Link>
          <Link
            to="/"
            className="text-xs text-muted-foreground hover:text-foreground mt-0.5 block"
          >
            ← Back to app
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4">
          <NavGroup label="Overview">
            <NavItem to="/admin" label="Dashboard" />
          </NavGroup>

          <NavGroup label="Resources">
            {RESOURCE_LINKS.filter(
              (l) => !l.permission || canSee(l.permission),
            ).map((l) => (
              <NavItem key={l.to} to={l.to} label={l.label} />
            ))}
          </NavGroup>

          <NavGroup label="System">
            {SYSTEM_LINKS.map((l) => (
              <NavItem key={l.to} to={l.to} label={l.label} />
            ))}
          </NavGroup>
        </nav>

        {/* Footer */}
        {user && (
          <div className="px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
            <p className="text-xs text-muted-foreground/60">{user.role}</p>
          </div>
        )}
      </aside>
    </div>
  );
}
