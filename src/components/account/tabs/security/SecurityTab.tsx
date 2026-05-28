import { useTwoFactor } from "@/hooks/account/useTwoFactor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  return (
    <Card className="max-w-md">
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
                  if (result.data?.disableTwoFactor) {
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
  );
}
