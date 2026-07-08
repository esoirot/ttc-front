import { useCurrentUser } from "@/hooks/auth/useAuth";
import { useDashboard } from "@/hooks/account/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { TwoFactorPromptCard } from "./2FA/TwoFactorPromptCard";
import { UpcomingDeadlines } from "./deadlines/UpcomingDeadlines";
import { RecentTimeEntries } from "./recentTimeEntries/RecentTimeEntries";
import { StatsGrid } from "./statsGrid/StatsGrid";
import { ProspectsToContact } from "./prospectsToContact/ProspectsToContact";
import { GoogleCalendarWidget } from "./googleCalendar/GoogleCalendarWidget";

export function AccountDashboard() {
  const { user, loading: userLoading } = useCurrentUser();
  const { dashboard, loading: dashLoading } = useDashboard();

  const loading = (userLoading && !user) || dashLoading;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <Skeleton className="h-80 w-full lg:w-80 lg:shrink-0 rounded-lg" />
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">{today}</p>
      </div>
      <p className="text-muted-foreground mb-6">
        Welcome back, {user?.name ?? user?.email}.
      </p>

      {!user?.twoFactorEnabled && <TwoFactorPromptCard />}

      {dashboard && (
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="w-full lg:w-80 lg:shrink-0">
            <GoogleCalendarWidget />
          </div>
          <div className="flex-1 min-w-0">
            <StatsGrid dashboard={dashboard} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UpcomingDeadlines deadlines={dashboard.upcomingDeadlines} />
              <RecentTimeEntries entries={dashboard.recentTimeEntries} />
            </div>

            <div className="mt-6">
              <ProspectsToContact prospects={dashboard.prospectsToContact} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
