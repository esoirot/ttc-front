import { useState } from "react";
import { Link } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { useRequestPasswordReset } from "@/hooks/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidEmail } from "@/lib/schemas";
import { AuthLayout } from "../layouts/AuthLayout";

export function ForgotPasswordForm() {
  const intl = useIntl();
  const { requestReset, loading } = useRequestPasswordReset();
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const emailError =
    emailTouched && !isValidEmail(email)
      ? intl.formatMessage({
          id: "auth.login.emailError",
          defaultMessage: "Enter a valid email address.",
        })
      : "";

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");
    try {
      await requestReset(email);
      setSubmitted(true);
    } catch {
      setServerError(
        intl.formatMessage({
          id: "auth.forgotPassword.genericError",
          defaultMessage: "Something went wrong. Please try again.",
        }),
      );
    }
  }

  if (submitted) {
    return (
      <AuthLayout
        title={intl.formatMessage({
          id: "auth.forgotPassword.checkEmailTitle",
          defaultMessage: "Check your email",
        })}
      >
        <p className="text-sm text-muted-foreground text-center">
          <FormattedMessage
            id="auth.forgotPassword.checkEmailBody"
            defaultMessage="If an account exists for <b>{email}</b>, a reset link has been sent. Check your inbox."
            values={{
              email,
              b: (chunks) => (
                <span className="font-medium text-foreground">{chunks}</span>
              ),
            }}
          />
        </p>
        <p className="text-sm text-center mt-4 text-muted-foreground">
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            <FormattedMessage
              id="auth.forgotPassword.backToSignIn"
              defaultMessage="Back to sign in"
            />
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={intl.formatMessage({
        id: "auth.forgotPassword.title",
        defaultMessage: "Forgot password",
      })}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">
            <FormattedMessage
              id="auth.forgotPassword.emailLabel"
              defaultMessage="Email address"
            />
          </Label>
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
          {loading ? (
            <FormattedMessage
              id="auth.forgotPassword.sending"
              defaultMessage="Sending…"
            />
          ) : (
            <FormattedMessage
              id="auth.forgotPassword.submit"
              defaultMessage="Send reset link"
            />
          )}
        </Button>
      </form>

      <p className="text-sm text-center mt-4 text-muted-foreground">
        <Link to="/login" className="text-primary font-medium hover:underline">
          <FormattedMessage
            id="auth.forgotPassword.backToSignIn"
            defaultMessage="Back to sign in"
          />
        </Link>
      </p>
    </AuthLayout>
  );
}
