import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";
import App from "./App.tsx";
import { IntlRoot } from "./i18n/IntlRoot.tsx";
import { createAppQueryClient } from "./lib/queryClient.ts";
import { Toaster } from "./components/ui/sonner.tsx";

const queryClient = createAppQueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <IntlRoot>
        <App />
        <Toaster richColors closeButton />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </IntlRoot>
    </QueryClientProvider>
  </StrictMode>,
);
