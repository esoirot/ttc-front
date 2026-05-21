import { useState } from "react";
import { useCurrentUser } from "../../hooks/auth/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackupCodesDisplay } from "../../components/auth/BackupCodesDisplay";
import { TwoFactorEnabledView } from "../../components/auth/TwoFactorEnabledView";
import { TwoFactorSetupFlow } from "../../components/auth/TwoFactorSetupFlow";

export function TwoFactorSetupPage() {
  const { user } = useCurrentUser();
  const [shownCodes, setShownCodes] = useState<string[] | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Security</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Two-factor authentication</CardTitle>
        </CardHeader>
        <CardContent>
          {shownCodes ? (
            <BackupCodesDisplay
              codes={shownCodes}
              onDone={() => setShownCodes(null)}
            />
          ) : user?.twoFactorEnabled ? (
            <TwoFactorEnabledView onCodesRegenerated={setShownCodes} />
          ) : (
            <TwoFactorSetupFlow onEnabled={setShownCodes} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
