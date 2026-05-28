import { RatesTabs } from "@/components/rates/tabs/RatesTabs";

export function RatesPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Rates</h1>
      <RatesTabs />
    </div>
  );
}
