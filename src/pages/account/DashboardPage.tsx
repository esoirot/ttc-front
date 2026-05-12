import { Link } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardPage() {
  const { user, loading } = useCurrentUser();

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Skeleton className="h-8 w-36 mb-6" />
        <Skeleton className="h-4 w-56" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Dashboard</h1>

      <p className="text-muted-foreground">
        Welcome back, {user?.name ?? user?.email}.
      </p>

      {!user?.twoFactorEnabled && (
        <Card className="mt-6 max-w-sm border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Secure your account</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Two-factor authentication is not enabled.
            </p>
            <Button asChild size="sm" className="self-start">
              <Link to="/settings/2fa">Enable 2FA</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
