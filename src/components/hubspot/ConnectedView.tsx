import { useState } from "react";
import { useDisconnectHubspot } from "../../hooks/useHubspot";
import { ContactsTab } from "./ContactsTab";
import { CompaniesTab } from "./CompaniesTab";
import { DealsTab } from "./DealsTab";

type Tab = "contacts" | "companies" | "deals";

const TABS: { id: Tab; label: string }[] = [
  { id: "contacts", label: "Contacts" },
  { id: "companies", label: "Companies" },
  { id: "deals", label: "Deals" },
];

export function ConnectedView({ portalId }: { portalId: string | null }) {
  const [activeTab, setActiveTab] = useState<Tab>("contacts");
  const disconnect = useDisconnectHubspot();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-zinc-900 dark:text-white">
            HubSpot connected
          </span>
          {portalId && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Portal {portalId}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => void disconnect.mutateAsync()}
          disabled={disconnect.isPending}
          className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 dark:border-red-900 rounded-md hover:bg-red-50 dark:hover:bg-red-950 transition-colors cursor-pointer disabled:opacity-50"
        >
          {disconnect.isPending ? "Disconnecting…" : "Disconnect"}
        </button>
      </div>

      <div className="flex gap-0 border-b border-zinc-200 dark:border-zinc-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
              activeTab === tab.id
                ? "border-violet-500 text-violet-600 dark:text-violet-400"
                : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "contacts" && <ContactsTab />}
        {activeTab === "companies" && <CompaniesTab />}
        {activeTab === "deals" && <DealsTab />}
      </div>
    </div>
  );
}
