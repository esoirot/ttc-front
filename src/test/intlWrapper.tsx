import { IntlProvider } from "react-intl";
import type { ReactNode } from "react";
import { messages } from "@/i18n/messages";
import type { Locale } from "@/i18n/useLocale";

export function createIntlWrapper(locale: Locale = "en") {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <IntlProvider
        locale={locale}
        defaultLocale="en"
        messages={messages[locale]}
      >
        {children}
      </IntlProvider>
    );
  };
}
