import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useIntl } from "react-intl";
import {
  useVerifyTwoFactor,
  useVerifyTwoFactorBackup,
} from "@/hooks/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "../layouts/AuthLayout";

export function TwoFactorVerifyForm() {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { tempToken?: string; from?: string } | null;
  const tempToken = state?.tempToken;
  const from = state?.from ?? "/";
  const {
    verifyTwoFactor,
    loading: totpLoading,
    error: totpError,
  } = useVerifyTwoFactor();
  const {
    verifyBackup,
    loading: backupLoading,
    error: backupError,
  } = useVerifyTwoFactorBackup();
  const [code, setCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);

  if (!tempToken) return <Navigate to="/login" replace />;

  async function handleTotpSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const result = await verifyTwoFactor(tempToken!, code);
      if (result.user) {
        navigate(from, { replace: true });
      }
    } catch {
      /* error state is surfaced via useVerifyTwoFactor's error */
    }
  }

  async function handleBackupSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const result = await verifyBackup(tempToken!, backupCode.trim());
      if (result.user) {
        navigate(from, { replace: true });
      }
    } catch {
      /* error state is surfaced via useVerifyTwoFactorBackup's error */
    }
  }

  if (useBackup) {
    return (
      <AuthLayout
        title={intl.formatMessage({
          id: "auth.twoFactorVerify.backupCodeTitle",
          defaultMessage: "Backup code",
        })}
      >
        <p className="text-sm text-muted-foreground mb-4">
          {intl.formatMessage({
            id: "auth.twoFactorVerify.enterBackupCode",
            defaultMessage: "Enter one of your saved backup codes.",
          })}
        </p>
        <form onSubmit={handleBackupSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="backup-code">
              {intl.formatMessage({
                id: "auth.twoFactorVerify.backupCodeLabel",
                defaultMessage: "Backup code",
              })}
            </Label>
            <Input
              id="backup-code"
              type="text"
              autoComplete="off"
              placeholder="e.g. a3f8c2d1e5b9…"
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value)}
            />
          </div>

          {backupError && (
            <p className="text-sm text-destructive">{backupError.message}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={backupLoading || backupCode.trim().length === 0}
          >
            {backupLoading
              ? intl.formatMessage({
                  id: "auth.twoFactorVerify.verifying",
                  defaultMessage: "Verifying…",
                })
              : intl.formatMessage({
                  id: "auth.twoFactorVerify.verifyBackupCode",
                  defaultMessage: "Verify backup code",
                })}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => setUseBackup(false)}
          >
            {intl.formatMessage({
              id: "auth.twoFactorVerify.useAuthenticatorInstead",
              defaultMessage: "Use authenticator code instead",
            })}
          </Button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={intl.formatMessage({
        id: "auth.twoFactorSetupCard.title",
        defaultMessage: "Two-factor authentication",
      })}
    >
      <p className="text-sm text-muted-foreground mb-4">
        {intl.formatMessage({
          id: "auth.twoFactorVerify.enterCode",
          defaultMessage: "Enter the 6-digit code from your authenticator app.",
        })}
      </p>
      <form onSubmit={handleTotpSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code">
            {intl.formatMessage({
              id: "auth.twoFactorVerify.authenticatorCodeLabel",
              defaultMessage: "Authenticator code",
            })}
          </Label>
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

        {totpError && (
          <p className="text-sm text-destructive">{totpError.message}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={totpLoading || code.length !== 6}
        >
          {totpLoading
            ? intl.formatMessage({
                id: "auth.twoFactorVerify.verifying",
                defaultMessage: "Verifying…",
              })
            : intl.formatMessage({
                id: "auth.twoFactorVerify.verify",
                defaultMessage: "Verify",
              })}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full text-muted-foreground text-sm"
          onClick={() => setUseBackup(true)}
        >
          {intl.formatMessage({
            id: "auth.twoFactorVerify.lostAccess",
            defaultMessage: "Lost access to authenticator? Use backup code",
          })}
        </Button>
      </form>
    </AuthLayout>
  );
}
