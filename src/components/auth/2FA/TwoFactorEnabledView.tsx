import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { TwoFactorEnabledViewProps } from "@/types/auth.types";
import {
  useBackupCodeCount,
  useRegenerateBackupCodes,
} from "@/hooks/auth/useAuth";

export function TwoFactorEnabledView({
  onCodesRegenerated,
}: TwoFactorEnabledViewProps) {
  const intl = useIntl();
  const {
    regenerateBackupCodes,
    loading: regenLoading,
    error: regenError,
  } = useRegenerateBackupCodes();
  const { count: codeCount } = useBackupCodeCount(false);
  const [showRegen, setShowRegen] = useState(false);
  const [regenCode, setRegenCode] = useState("");

  async function handleRegen(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const result = await regenerateBackupCodes(regenCode);
      const codes = result?.backupCodes;
      if (codes?.length) {
        onCodesRegenerated(codes);
        setShowRegen(false);
        setRegenCode("");
      }
    } catch {
      /* error state is surfaced via useRegenerateBackupCodes's error */
    }
  }

  if (showRegen) {
    return (
      <div className="flex flex-col gap-4">
        <Badge
          variant="secondary"
          className="w-fit text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30"
        >
          ✓{" "}
          <FormattedMessage
            id="auth.backupCodes.enabled"
            defaultMessage="Enabled"
          />
        </Badge>
        <form onSubmit={handleRegen} className="flex flex-col gap-4 max-w-xs">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="regen-code">
              <FormattedMessage
                id="auth.twoFactorEnabled.regenLabel"
                defaultMessage="Enter your 6-digit authenticator code to regenerate backup codes"
              />
            </Label>
            <Input
              id="regen-code"
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              required
              placeholder="000000"
              value={regenCode}
              onChange={(e) => setRegenCode(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          {regenError && (
            <p className="text-sm text-destructive">{regenError.message}</p>
          )}
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={regenLoading || regenCode.length !== 6}
            >
              {regenLoading ? (
                <FormattedMessage
                  id="auth.twoFactorEnabled.regenerating"
                  defaultMessage="Regenerating…"
                />
              ) : (
                <FormattedMessage
                  id="auth.twoFactorEnabled.regenerateCodes"
                  defaultMessage="Regenerate codes"
                />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowRegen(false);
                setRegenCode("");
              }}
            >
              <FormattedMessage
                id="common.actions.cancel"
                defaultMessage="Cancel"
              />
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Badge
        variant="secondary"
        className="w-fit text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30"
      >
        ✓{" "}
        <FormattedMessage
          id="auth.backupCodes.enabled"
          defaultMessage="Enabled"
        />
      </Badge>
      <p className="text-sm text-muted-foreground">
        <FormattedMessage
          id="auth.twoFactorEnabled.protected"
          defaultMessage="Your account is protected with TOTP-based 2FA."
        />
      </p>
      {codeCount !== null && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {intl.formatMessage(
              {
                id: "auth.twoFactorEnabled.codesRemaining",
                defaultMessage:
                  "{count, plural, one {# backup code remaining} other {# backup codes remaining}}",
              },
              { count: codeCount },
            )}
          </span>
          {codeCount <= 2 && (
            <Badge variant="destructive" className="text-xs">
              <FormattedMessage
                id="auth.twoFactorEnabled.low"
                defaultMessage="Low"
              />
            </Badge>
          )}
        </div>
      )}
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => setShowRegen(true)}
      >
        <FormattedMessage
          id="auth.twoFactorEnabled.regenerateBackupCodes"
          defaultMessage="Regenerate backup codes"
        />
      </Button>
    </div>
  );
}
