import { FormattedMessage } from "react-intl";
import { TwoFactorSetupCard } from "@/components/auth/2FA/TwoFactorSetupCard";

export function TwoFactorSetupPage() {
  return (
    <div className="w-full px-8 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">
        <FormattedMessage
          id="account.securityTab.pageTitle"
          defaultMessage="Security"
        />
      </h1>
      <TwoFactorSetupCard />
    </div>
  );
}
