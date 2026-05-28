import { TwoFactorSetupCard } from "@/components/auth/2FA/TwoFactorSetupCard";

export function TwoFactorSetupPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Security</h1>
      <TwoFactorSetupCard />
    </div>
  );
}
