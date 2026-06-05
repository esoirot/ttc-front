import { useState } from "react";
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
      setPwError("New passwords do not match.");
      return;
    }
    const result = await changePassword(currentPassword, newPassword);
    if (result) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 3000);
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Two-factor authentication</CardTitle>
        </CardHeader>
        <CardContent>
          {tfaDone || user?.twoFactorEnabled ? (
            <div className="flex flex-col gap-3">
              <Badge
                variant="secondary"
                className="w-fit text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30"
              >
                ✓ Enabled
              </Badge>
              <p className="text-sm text-muted-foreground">
                Your account is protected with TOTP-based 2FA.
              </p>
              {!showDisableForm ? (
                <button
                  onClick={() => setShowDisableForm(true)}
                  className="self-start text-xs text-destructive hover:underline"
                >
                  Disable 2FA…
                </button>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const result = await disableTwoFactor(disableCode);
                    if (result) {
                      setShowDisableForm(false);
                      setDisableCode("");
                    }
                  }}
                  className="flex flex-col gap-3 pt-3 border-t"
                >
                  <p className="text-sm text-muted-foreground">
                    Enter your current authenticator code to confirm.
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="disable-tfa-code">Authenticator code</Label>
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
                      {disableLoading ? "Disabling…" : "Disable 2FA"}
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
                      Cancel
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
                    Add an extra layer of security using an authenticator app.
                  </p>
                  <Button
                    className="self-start"
                    onClick={() => setupTwoFactor()}
                    disabled={setupLoading}
                  >
                    {setupLoading ? "Generating…" : "Set up 2FA"}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Scan this QR code with your authenticator app (Google
                    Authenticator, Authy, etc.).
                  </p>
                  <img
                    src={qrCodeUrl}
                    alt="2FA QR code"
                    className="block rounded-lg border max-w-[200px]"
                  />
                  {secret && (
                    <details className="text-sm text-muted-foreground">
                      <summary className="cursor-pointer select-none">
                        Can't scan? Enter code manually
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
                        Enter the 6-digit code to confirm
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
                      {enableLoading ? "Enabling…" : "Enable 2FA"}
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
          <CardTitle className="text-base">Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-password">New password</Label>
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
              <Label htmlFor="confirm-password">Confirm new password</Label>
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
                Password updated.
              </p>
            )}
            <Button type="submit" className="self-start" disabled={pwLoading}>
              {pwLoading ? "Saving…" : "Update password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            Delete account
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data. This cannot
            be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="self-start">
                Delete account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete account?</AlertDialogTitle>
                <AlertDialogDescription>
                  All your data will be permanently deleted. This cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => void deleteAccount()}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting…" : "Delete account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
