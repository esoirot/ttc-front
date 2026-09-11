import { useState } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import { useTwoFactor } from "@/hooks/account/useTwoFactor";
import { useChangePassword, useDeleteAccount } from "@/hooks/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function SecurityTab() {
  const intl = useIntl();
  const {
    user,
    setupTwoFactor,
    setupLoading,
    qrCodeUrl,
    secret,
    enableLoading,
    enableError,
    disableTwoFactor,
    disableLoading,
    disableError,
    tfaCode,
    setTfaCode,
    tfaDone,
    disableCode,
    setDisableCode,
    showDisableForm,
    setShowDisableForm,
    handleEnableTfa,
  } = useTwoFactor();

  const {
    changePassword,
    loading: pwLoading,
    error: pwMutationError,
  } = useChangePassword();
  const { deleteAccount, loading: deleteLoading } = useDeleteAccount();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwError(null);
    if (newPassword !== confirmPassword) {
      setPwError(
        intl.formatMessage({
          id: "account.securityTab.passwordsMismatch",
          defaultMessage: "New passwords do not match.",
        }),
      );
      return;
    }
    try {
      const result = await changePassword(currentPassword, newPassword);
      if (result) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPwSaved(true);
        setTimeout(() => setPwSaved(false), 3000);
      }
    } catch {
      /* error state is surfaced via useChangePassword's error */
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <FormattedMessage
              id="account.securityTab.twoFactorAuth"
              defaultMessage="Two-factor authentication"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tfaDone || user?.twoFactorEnabled ? (
            <div className="flex flex-col gap-3">
              <Badge
                variant="secondary"
                className="w-fit text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30"
              >
                ✓{" "}
                <FormattedMessage
                  id="account.securityTab.enabled"
                  defaultMessage="Enabled"
                />
              </Badge>
              <p className="text-sm text-muted-foreground">
                <FormattedMessage
                  id="account.securityTab.protectedWithTotp"
                  defaultMessage="Your account is protected with TOTP-based 2FA."
                />
              </p>
              {!showDisableForm ? (
                <button
                  onClick={() => setShowDisableForm(true)}
                  className="self-start text-xs text-destructive hover:underline"
                >
                  <FormattedMessage
                    id="account.securityTab.disable2faEllipsis"
                    defaultMessage="Disable 2FA…"
                  />
                </button>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const result = await disableTwoFactor(disableCode);
                      if (result) {
                        setShowDisableForm(false);
                        setDisableCode("");
                      }
                    } catch {
                      /* error state is surfaced via useDisableTwoFactor's error */
                    }
                  }}
                  className="flex flex-col gap-3 pt-3 border-t"
                >
                  <p className="text-sm text-muted-foreground">
                    <FormattedMessage
                      id="account.securityTab.confirmAuthenticatorCode"
                      defaultMessage="Enter your current authenticator code to confirm."
                    />
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="disable-tfa-code">
                      <FormattedMessage
                        id="account.securityTab.authenticatorCode"
                        defaultMessage="Authenticator code"
                      />
                    </Label>
                    <Input
                      id="disable-tfa-code"
                      type="text"
                      inputMode="numeric"
                      pattern="\d{6}"
                      maxLength={6}
                      required
                      placeholder="000000"
                      value={disableCode}
                      onChange={(e) =>
                        setDisableCode(e.target.value.replace(/\D/g, ""))
                      }
                    />
                  </div>
                  {disableError && (
                    <p className="text-sm text-destructive">
                      {disableError.message}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      variant="destructive"
                      size="sm"
                      disabled={disableLoading || disableCode.length !== 6}
                    >
                      {disableLoading ? (
                        <FormattedMessage
                          id="account.securityTab.disabling"
                          defaultMessage="Disabling…"
                        />
                      ) : (
                        <FormattedMessage
                          id="account.securityTab.disable2fa"
                          defaultMessage="Disable 2FA"
                        />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowDisableForm(false);
                        setDisableCode("");
                      }}
                    >
                      <FormattedMessage
                        id="common.actions.cancel"
                        defaultMessage="Cancel"
                      />
                    </Button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {!qrCodeUrl ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    <FormattedMessage
                      id="account.securityTab.addExtraLayer"
                      defaultMessage="Add an extra layer of security using an authenticator app."
                    />
                  </p>
                  <Button
                    className="self-start"
                    onClick={() => setupTwoFactor()}
                    disabled={setupLoading}
                  >
                    {setupLoading ? (
                      <FormattedMessage
                        id="account.securityTab.generating"
                        defaultMessage="Generating…"
                      />
                    ) : (
                      <FormattedMessage
                        id="account.securityTab.setUp2fa"
                        defaultMessage="Set up 2FA"
                      />
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    <FormattedMessage
                      id="account.securityTab.scanQrCode"
                      defaultMessage="Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)."
                    />
                  </p>
                  <img
                    src={qrCodeUrl}
                    alt={intl.formatMessage({
                      id: "account.securityTab.qrCodeAlt",
                      defaultMessage: "2FA QR code",
                    })}
                    className="block rounded-lg border max-w-[200px]"
                  />
                  {secret && (
                    <details className="text-sm text-muted-foreground">
                      <summary className="cursor-pointer select-none">
                        <FormattedMessage
                          id="account.securityTab.cantScan"
                          defaultMessage="Can't scan? Enter code manually"
                        />
                      </summary>
                      <code className="block mt-2 px-3 py-2 bg-muted rounded font-mono text-xs break-all">
                        {secret}
                      </code>
                    </details>
                  )}
                  <form
                    onSubmit={handleEnableTfa}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="tfa-code">
                        <FormattedMessage
                          id="account.securityTab.enter6DigitCode"
                          defaultMessage="Enter the 6-digit code to confirm"
                        />
                      </Label>
                      <Input
                        id="tfa-code"
                        type="text"
                        inputMode="numeric"
                        pattern="\d{6}"
                        maxLength={6}
                        required
                        placeholder="000000"
                        value={tfaCode}
                        onChange={(e) =>
                          setTfaCode(e.target.value.replace(/\D/g, ""))
                        }
                      />
                    </div>
                    {enableError && (
                      <p className="text-sm text-destructive">
                        {enableError.message}
                      </p>
                    )}
                    <Button
                      type="submit"
                      className="self-start"
                      disabled={enableLoading || tfaCode.length !== 6}
                    >
                      {enableLoading ? (
                        <FormattedMessage
                          id="account.securityTab.enabling"
                          defaultMessage="Enabling…"
                        />
                      ) : (
                        <FormattedMessage
                          id="account.securityTab.enable2fa"
                          defaultMessage="Enable 2FA"
                        />
                      )}
                    </Button>
                  </form>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <FormattedMessage
              id="account.securityTab.password"
              defaultMessage="Password"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="current-password">
                <FormattedMessage
                  id="account.securityTab.currentPassword"
                  defaultMessage="Current password"
                />
              </Label>
              <Input
                id="current-password"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-password">
                <FormattedMessage
                  id="account.securityTab.newPassword"
                  defaultMessage="New password"
                />
              </Label>
              <Input
                id="new-password"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm-password">
                <FormattedMessage
                  id="account.securityTab.confirmNewPassword"
                  defaultMessage="Confirm new password"
                />
              </Label>
              <Input
                id="confirm-password"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {(pwError ?? pwMutationError) && (
              <p className="text-sm text-destructive">
                {pwError ?? pwMutationError?.message}
              </p>
            )}
            {pwSaved && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                <FormattedMessage
                  id="account.securityTab.passwordUpdated"
                  defaultMessage="Password updated."
                />
              </p>
            )}
            <Button type="submit" className="self-start" disabled={pwLoading}>
              {pwLoading ? (
                <FormattedMessage
                  id="account.securityTab.saving"
                  defaultMessage="Saving…"
                />
              ) : (
                <FormattedMessage
                  id="account.securityTab.updatePassword"
                  defaultMessage="Update password"
                />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            <FormattedMessage
              id="account.securityTab.deleteAccount"
              defaultMessage="Delete account"
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            <FormattedMessage
              id="account.securityTab.deleteAccountHint"
              defaultMessage="Permanently delete your account and all associated data. This cannot be undone."
            />
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="self-start">
                <FormattedMessage
                  id="account.securityTab.deleteAccount"
                  defaultMessage="Delete account"
                />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  <FormattedMessage
                    id="account.securityTab.deleteAccountConfirmTitle"
                    defaultMessage="Delete account?"
                  />
                </AlertDialogTitle>
                <AlertDialogDescription>
                  <FormattedMessage
                    id="account.securityTab.deleteAccountConfirmDescription"
                    defaultMessage="All your data will be permanently deleted. This cannot be undone."
                  />
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <FormattedMessage
                    id="common.actions.cancel"
                    defaultMessage="Cancel"
                  />
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => void deleteAccount()}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <FormattedMessage
                      id="account.securityTab.deleting"
                      defaultMessage="Deleting…"
                    />
                  ) : (
                    <FormattedMessage
                      id="account.securityTab.deleteAccount"
                      defaultMessage="Delete account"
                    />
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
