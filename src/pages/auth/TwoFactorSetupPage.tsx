import { useState, type FormEvent } from "react";
import {
  useCurrentUser,
  useSetupTwoFactor,
  useEnableTwoFactor,
} from "../../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function TwoFactorSetupPage() {
  const { user } = useCurrentUser();
  const {
    setupTwoFactor,
    loading: setupLoading,
    qrCodeUrl,
    secret,
  } = useSetupTwoFactor();
  const {
    enableTwoFactor,
    loading: enableLoading,
    error,
  } = useEnableTwoFactor();
  const [code, setCode] = useState("");
  const [done, setDone] = useState(false);

  async function handleEnable(e: FormEvent) {
    e.preventDefault();
    const result = await enableTwoFactor(code);
    if (result.data?.enableTwoFactor) setDone(true);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Security</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Two-factor authentication</CardTitle>
        </CardHeader>
        <CardContent>
          {done || user?.twoFactorEnabled ? (
            <div className="flex flex-col gap-2">
              <Badge
                variant="secondary"
                className="w-fit text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30"
              >
                ✓ Enabled
              </Badge>
              <p className="text-sm text-muted-foreground">
                Your account is protected with TOTP-based 2FA.
              </p>
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
                    onSubmit={handleEnable}
                    className="flex flex-col gap-4 max-w-xs"
                  >
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="confirm-code">
                        Enter the 6-digit code to confirm
                      </Label>
                      <Input
                        id="confirm-code"
                        type="text"
                        inputMode="numeric"
                        pattern="\d{6}"
                        maxLength={6}
                        required
                        placeholder="000000"
                        value={code}
                        onChange={(e) =>
                          setCode(e.target.value.replace(/\D/g, ""))
                        }
                      />
                    </div>

                    {error && (
                      <p className="text-sm text-destructive">
                        {error.message}
                      </p>
                    )}

                    <Button
                      type="submit"
                      className="self-start"
                      disabled={enableLoading || code.length !== 6}
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
    </div>
  );
}
