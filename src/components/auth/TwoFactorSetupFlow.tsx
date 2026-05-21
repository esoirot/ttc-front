import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useSetupTwoFactor,
  useEnableTwoFactor,
} from "../../hooks/auth/useAuth";

interface TwoFactorSetupFlowProps {
  onEnabled: (codes: string[]) => void;
}

export function TwoFactorSetupFlow({ onEnabled }: TwoFactorSetupFlowProps) {
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

  async function handleEnable(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = await enableTwoFactor(code);
    const codes = result.data?.enableTwoFactor?.backupCodes;
    if (codes?.length) onEnabled(codes);
  }

  if (!qrCodeUrl) {
    return (
      <div className="flex flex-col gap-4">
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
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Scan this QR code with your authenticator app (Google Authenticator,
        Authy, etc.).
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
      <form onSubmit={handleEnable} className="flex flex-col gap-4 max-w-xs">
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
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error.message}</p>}
        <Button
          type="submit"
          className="self-start"
          disabled={enableLoading || code.length !== 6}
        >
          {enableLoading ? "Enabling…" : "Enable 2FA"}
        </Button>
      </form>
    </div>
  );
}
