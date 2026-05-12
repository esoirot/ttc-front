import { useState, type FormEvent } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { useVerifyTwoFactor } from "../../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TwoFactorVerifyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { tempToken?: string; from?: string } | null;
  const tempToken = state?.tempToken;
  const from = state?.from ?? "/";
  const { verifyTwoFactor, loading, error } = useVerifyTwoFactor();
  const [code, setCode] = useState("");

  if (!tempToken) return <Navigate to="/login" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = await verifyTwoFactor(tempToken!, code);
    if (result.data?.verifyTwoFactor?.user) {
      navigate(from, { replace: true });
    }
  }

  return (
    <AuthLayout title="Two-factor authentication">
      <p className="text-sm text-muted-foreground mb-4">
        Enter the 6-digit code from your authenticator app.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code">Authenticator code</Label>
          <Input
            id="code"
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            required
            autoComplete="one-time-code"
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error.message}</p>}

        <Button
          type="submit"
          className="w-full"
          disabled={loading || code.length !== 6}
        >
          {loading ? "Verifying…" : "Verify"}
        </Button>
      </form>
    </AuthLayout>
  );
}
