import { useState, type FormEvent } from "react";
import {
  useCurrentUser,
  useUpdateMe,
  useSetupTwoFactor,
  useEnableTwoFactor,
  useDisableTwoFactor,
} from "../../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function EditProfilePage() {
  const { user } = useCurrentUser();
  const { updateMe, loading: saving, error: saveError } = useUpdateMe();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saved, setSaved] = useState(false);

  const {
    setupTwoFactor,
    loading: setupLoading,
    qrCodeUrl,
    secret,
  } = useSetupTwoFactor();
  const {
    enableTwoFactor,
    loading: enableLoading,
    error: enableError,
  } = useEnableTwoFactor();
  const {
    disableTwoFactor,
    loading: disableLoading,
    error: disableError,
  } = useDisableTwoFactor();
  const [tfaCode, setTfaCode] = useState("");
  const [tfaDone, setTfaDone] = useState(false);
  const [disableCode, setDisableCode] = useState("");
  const [showDisableForm, setShowDisableForm] = useState(false);

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    await updateMe({ name: name.trim() || undefined, email: email.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleEnableTfa(e: FormEvent) {
    e.preventDefault();
    const result = await enableTwoFactor(tfaCode);
    if (result.data?.enableTwoFactor) setTfaDone(true);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">
        Edit Profile
      </h1>

      <Tabs defaultValue="profile">
        <TabsList className="mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <form
            onSubmit={handleSaveProfile}
            className="flex flex-col gap-5 max-w-md"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Role</span>
              <Badge variant="secondary" className="w-fit">
                {user?.role}
              </Badge>
            </div>

            {saveError && (
              <p className="text-sm text-destructive">{saveError.message}</p>
            )}

            {saved && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                Profile saved.
              </p>
            )}

            <Button type="submit" className="self-start" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="security">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-base">
                Two-factor authentication
              </CardTitle>
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
                      <Input
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
                        Add an extra layer of security using an authenticator
                        app.
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
