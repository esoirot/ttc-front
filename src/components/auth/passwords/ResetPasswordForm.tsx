import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { useResetPassword } from "@/hooks/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "../layouts/AuthLayout";

export function ResetPasswordForm() {
  const intl = useIntl();
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
      ? intl.formatMessage({
          id: "auth.register.passwordError",
          defaultMessage: "Password must be at least 8 characters.",
        })
      : "";
  const confirmError =
    touched.confirm && confirm !== password
      ? intl.formatMessage({
          id: "auth.resetPassword.mismatch",
          defaultMessage: "Passwords do not match.",
        })
      : "";
  const isValid = password.length >= 8 && password === confirm;

  if (!token) {
    return (
      <AuthLayout
        title={intl.formatMessage({
          id: "auth.resetPassword.invalidLinkTitle",
          defaultMessage: "Invalid link",
        })}
      >
        <p className="text-sm text-muted-foreground text-center">
          <FormattedMessage
            id="auth.resetPassword.invalidLinkBody"
            defaultMessage="This reset link is missing or malformed."
          />
        </p>
        <p className="text-sm text-center mt-4 text-muted-foreground">
          <Link
            to="/forgot-password"
            className="text-primary font-medium hover:underline"
          >
            <FormattedMessage
              id="auth.resetPassword.requestNewLink"
              defaultMessage="Request a new link"
            />
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
        state: {
          message: intl.formatMessage({
            id: "auth.resetPassword.successMessage",
            defaultMessage: "Password updated. Sign in with your new password.",
          }),
        },
        replace: true,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setServerError(
        msg.toLowerCase().includes("invalid") ||
          msg.toLowerCase().includes("expired")
          ? intl.formatMessage({
              id: "auth.resetPassword.expiredError",
              defaultMessage: "This link is invalid or has expired.",
            })
          : intl.formatMessage({
              id: "auth.forgotPassword.genericError",
              defaultMessage: "Something went wrong. Please try again.",
            }),
      );
    }
  }

  return (
    <AuthLayout
      title={intl.formatMessage({
        id: "auth.resetPassword.title",
        defaultMessage: "Reset password",
      })}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">
            <FormattedMessage
              id="auth.resetPassword.newPasswordLabel"
              defaultMessage="New password"
            />
          </Label>
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
          <Label htmlFor="confirm">
            <FormattedMessage
              id="auth.resetPassword.confirmPasswordLabel"
              defaultMessage="Confirm password"
            />
          </Label>
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
                <FormattedMessage
                  id="auth.resetPassword.requestNewResetLink"
                  defaultMessage="Request a new reset link"
                />
              </Link>
            </p>
          </>
        )}

        <Button type="submit" className="w-full" disabled={loading || !isValid}>
          {loading ? (
            <FormattedMessage
              id="auth.resetPassword.updating"
              defaultMessage="Updating…"
            />
          ) : (
            <FormattedMessage
              id="auth.resetPassword.submit"
              defaultMessage="Set new password"
            />
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
