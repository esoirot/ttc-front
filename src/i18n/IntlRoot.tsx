import type { ReactNode } from "react";
import { IntlProvider } from "react-intl";
import { useLocale } from "./useLocale";
import { messages } from "./messages";

export function IntlRoot({ children }: { children: ReactNode }) {
  const { locale } = useLocale();

  return (
    <IntlProvider
      locale={locale}
      defaultLocale="en"
      messages={messages[locale]}
    >
      {children}
    </IntlProvider>
  );
}
