import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { GoogleOAuthButton } from "../../components/auth/GoogleOAuthButton";
import { useLogin, useCurrentUser } from "../../hooks/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { isValidEmail } from "../../components/auth/utils";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: string; message?: string } | null;
  const from = state?.from ?? "/";
  const successMessage = state?.message ?? "";
  const { isAuthenticated } = useCurrentUser();
  const { login, loading, error } = useLogin();

  useEffect(() => {
    if (!isAuthenticated) return;
    const raw = sessionStorage.getItem("oauth_from");
    if (!raw) return;
    sessionStorage.removeItem("oauth_from");
    try {
      const { dest, ts } = JSON.parse(raw) as { dest: string; ts: number };
      if (Date.now() - ts < 60_000) navigate(dest, { replace: true });
    } catch {
      /* malformed or legacy bare-string value — ignore */
    }
  }, [isAuthenticated, navigate]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const emailError =
    emailTouched && !isValidEmail(email) ? "Enter a valid email address." : "";
  const passwordError =
    passwordTouched && password.length === 0 ? "Password is required." : "";

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = await login(email, password);
    const data = result.data?.login;

    if (data?.requiresTwoFactor) {
      navigate("/2fa/verify", { state: { tempToken: data.tempToken, from } });
    } else if (data?.user) {
      navigate(from, { replace: true });
    }
  }

  return (
    <AuthLayout title="Sign in">
      {successMessage && (
        <p className="text-sm text-center text-emerald-600 mb-2">
          {successMessage}
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            aria-invalid={!!emailError}
          />
          {emailError && (
            <p className="text-xs text-destructive">{emailError}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-xs text-muted-foreground hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setPasswordTouched(true)}
            aria-invalid={!!passwordError}
          />
          {passwordError && (
            <p className="text-xs text-destructive">{passwordError}</p>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error.message}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-4 text-xs text-muted-foreground">
        <Separator className="flex-1" />
        <span>or</span>
        <Separator className="flex-1" />
      </div>

      <GoogleOAuthButton from={from} />

      <p className="text-sm text-center mt-4 text-muted-foreground">
        No account?{" "}
        <Link
          to="/register"
          className="text-primary font-medium hover:underline"
        >
          Register
        </Link>
      </p>
    </AuthLayout>
  );
}
