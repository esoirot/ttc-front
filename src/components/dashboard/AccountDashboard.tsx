import { useCurrentUser } from "@/hooks/auth/useAuth";
import { useDashboard } from "@/hooks/account/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { TwoFactorPromptCard } from "./2FA/TwoFactorPromptCard";
import { UpcomingDeadlines } from "./deadlines/UpcomingDeadlines";
import { RecentTimeEntries } from "./recentTimeEntries/RecentTimeEntries";
import { StatsGrid } from "./statsGrid/StatsGrid";

export function AccountDashboard() {
  const { user, loading: userLoading } = useCurrentUser();
  const { dashboard, loading: dashLoading } = useDashboard();

  const loading = (userLoading && !user) || dashLoading;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
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
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Dashboard</h1>
      <p className="text-muted-foreground mb-6">
        Welcome back, {user?.name ?? user?.email}.
      </p>

      {!user?.twoFactorEnabled && <TwoFactorPromptCard />}

      {dashboard && (
        <>
          <StatsGrid dashboard={dashboard} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UpcomingDeadlines deadlines={dashboard.upcomingDeadlines} />
            <RecentTimeEntries entries={dashboard.recentTimeEntries} />
          </div>
        </>
      )}
    </div>
  );
}
