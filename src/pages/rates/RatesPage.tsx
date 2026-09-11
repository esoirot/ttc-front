import { useIntl } from "react-intl";
import { RatesTabs } from "@/components/rates/tabs/RatesTabs";

export function RatesPage() {
  const intl = useIntl();
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">
        {intl.formatMessage({
          id: "rates.page.title",
          defaultMessage: "Rates",
        })}
      </h1>
      <RatesTabs />
    </div>
  );
}
