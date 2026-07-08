import { useState } from "react";
import { Link } from "react-router-dom";
import { useRequestPasswordReset } from "@/hooks/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidEmail } from "@/lib/schemas";
import { AuthLayout } from "../layouts/AuthLayout";

export function ForgotPasswordForm() {
  const { requestReset, loading } = useRequestPasswordReset();
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const emailError =
    emailTouched && !isValidEmail(email) ? "Enter a valid email address." : "";

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");
    try {
      await requestReset(email);
      setSubmitted(true);
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  }

  if (submitted) {
    return (
      <AuthLayout title="Check your email">
        <p className="text-sm text-muted-foreground text-center">
          If an account exists for{" "}
          <span className="font-medium text-foreground">{email}</span>, a reset
          link has been sent. Check your inbox.
        </p>
        <p className="text-sm text-center mt-4 text-muted-foreground">
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot password">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email address</Label>
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

        {serverError && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="text-sm text-center mt-4 text-muted-foreground">
        <Link to="/login" className="text-primary font-medium hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
