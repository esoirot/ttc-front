import { useState } from "react";
import {
  useInfiniteHubspotDeals,
  useCreateDeal,
  type HubspotDeal,
} from "../../hooks/useHubspot";

function DealRow({ deal }: { deal: HubspotDeal }) {
  const p = deal.properties;
  return (
    <tr className="border-b border-zinc-100 dark:border-zinc-800">
      <td className="py-2.5 pr-4 text-sm text-zinc-900 dark:text-white">
        {p.dealname ?? "—"}
      </td>
      <td className="py-2.5 pr-4 text-sm text-zinc-500 dark:text-zinc-400">
        {p.amount ? `$${p.amount}` : "—"}
      </td>
      <td className="py-2.5 pr-4 text-sm text-zinc-500 dark:text-zinc-400">
        {p.dealstage ?? "—"}
      </td>
      <td className="py-2.5 text-sm text-zinc-500 dark:text-zinc-400">
        {p.closedate ? p.closedate.slice(0, 10) : "—"}
      </td>
    </tr>
  );
}

export function DealsTab() {
  const [showForm, setShowForm] = useState(false);
  const [dealname, setDealname] = useState("");
  const [amount, setAmount] = useState("");
  const [dealstage, setDealstage] = useState("");
  const [closedate, setClosedate] = useState("");

  const infinite = useInfiniteHubspotDeals();
  const deals = infinite.data?.pages.flatMap((p) => p.results) ?? [];
  const createDeal = useCreateDeal();

  const handleCreate = async () => {
    if (!dealname.trim()) return;
    await createDeal.mutateAsync({
      dealname: dealname.trim(),
      ...(amount.trim() ? { amount: amount.trim() } : {}),
      ...(dealstage.trim() ? { dealstage: dealstage.trim() } : {}),
      ...(closedate ? { closedate } : {}),
    });
    setDealname("");
    setAmount("");
    setDealstage("");
    setClosedate("");
    setShowForm(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {deals.length} {deals.length !== 1 ? "deals" : "deal"} loaded
        </span>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="px-3 py-1.5 text-xs font-medium border border-zinc-200 dark:border-zinc-700 rounded-md hover:border-violet-500 hover:text-violet-600 transition-colors cursor-pointer"
        >
          {showForm ? "Cancel" : "+ New deal"}
        </button>
      </div>

      {showForm && (
        <div className="grid grid-cols-2 gap-3 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <input
            type="text"
            placeholder="Deal name *"
            value={dealname}
            onChange={(e) => setDealname(e.target.value)}
            className="col-span-2 px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <input
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <input
            type="text"
            placeholder="Stage"
            value={dealstage}
            onChange={(e) => setDealstage(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400">Close date</label>
            <input
              type="date"
              value={closedate}
              onChange={(e) => setClosedate(e.target.value)}
              className="px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div className="flex items-end justify-end gap-2">
            {createDeal.error && (
              <span className="text-xs text-red-600 self-center">
                {createDeal.error.message}
              </span>
            )}
            <button
              type="button"
              onClick={() => void handleCreate()}
              disabled={!dealname.trim() || createDeal.isPending}
              className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors cursor-pointer"
            >
              {createDeal.isPending ? "Saving…" : "Create"}
            </button>
          </div>
        </div>
      )}

      {infinite.isLoading ? (
        <p className="text-sm text-zinc-400 py-4">Loading…</p>
      ) : (
        <>
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="pb-2 pr-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Deal
                </th>
                <th className="pb-2 pr-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Amount
                </th>
                <th className="pb-2 pr-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Stage
                </th>
                <th className="pb-2 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Close date
                </th>
              </tr>
            </thead>
            <tbody>
              {deals.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-sm text-zinc-400"
                  >
                    No deals yet
                  </td>
                </tr>
              )}
              {deals.map((d) => (
                <DealRow key={d.id} deal={d} />
              ))}
            </tbody>
          </table>
          {infinite.hasNextPage && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => void infinite.fetchNextPage()}
                disabled={infinite.isFetchingNextPage}
                className="px-4 py-2 text-sm font-medium border border-zinc-200 dark:border-zinc-700 rounded-md hover:border-violet-500 hover:text-violet-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                {infinite.isFetchingNextPage ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
