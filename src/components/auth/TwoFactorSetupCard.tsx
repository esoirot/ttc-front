import { useState } from "react";
import { useCurrentUser } from "@/hooks/auth/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackupCodesDisplay } from "./BackupCodesDisplay";
import { TwoFactorEnabledView } from "./TwoFactorEnabledView";
import { TwoFactorSetupFlow } from "./TwoFactorSetupFlow";

export function TwoFactorSetupCard() {
  const { user } = useCurrentUser();
  const [shownCodes, setShownCodes] = useState<string[] | null>(null);

  return (
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
  );
}
