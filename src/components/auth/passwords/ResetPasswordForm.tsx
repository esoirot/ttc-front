import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useResetPassword } from "@/hooks/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "../layouts/AuthLayout";

export function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { resetPassword, loading } = useResetPassword();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const [serverError, setServerError] = useState("");

  const passwordError =
    touched.password && password.length < 8
      ? "Password must be at least 8 characters."
      : "";
  const confirmError =
    touched.confirm && confirm !== password ? "Passwords do not match." : "";
  const isValid = password.length >= 8 && password === confirm;

  if (!token) {
    return (
      <AuthLayout title="Invalid link">
        <p className="text-sm text-muted-foreground text-center">
          This reset link is missing or malformed.
        </p>
        <p className="text-sm text-center mt-4 text-muted-foreground">
          <Link
            to="/forgot-password"
            className="text-primary font-medium hover:underline"
          >
            Request a new link
          </Link>
        </p>
      </AuthLayout>
    );
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid) return;
    setServerError("");
    try {
      await resetPassword(token, password);
      navigate("/login", {
        state: { message: "Password updated. Sign in with your new password." },
        replace: true,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setServerError(
        msg.toLowerCase().includes("invalid") ||
          msg.toLowerCase().includes("expired")
          ? "This link is invalid or has expired."
          : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <AuthLayout title="Reset password">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            aria-invalid={!!passwordError}
          />
          {passwordError && (
            <p className="text-xs text-destructive">{passwordError}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
            aria-invalid={!!confirmError}
          />
          {confirmError && (
            <p className="text-xs text-destructive">{confirmError}</p>
          )}
        </div>

        {serverError && (
          <>
            <p className="text-sm text-destructive">{serverError}</p>
            <p className="text-sm text-muted-foreground">
              <Link
                to="/forgot-password"
                className="text-primary font-medium hover:underline"
              >
                Request a new reset link
              </Link>
            </p>
          </>
        )}

        <Button type="submit" className="w-full" disabled={loading || !isValid}>
          {loading ? "Updating…" : "Set new password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
