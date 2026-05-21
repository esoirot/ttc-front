import { useEffect, useState } from "react";
import {
  useInfiniteHubspotDeals,
  useSearchHubspotDeals,
  useCreateDeal,
  type HubspotDeal,
} from "../../hooks/integrations/useHubspot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function DealRow({ deal }: { deal: HubspotDeal }) {
  const p = deal.properties;
  return (
    <tr className="border-b border-border">
      <td className="py-2.5 pr-4 text-sm">{p.dealname ?? "—"}</td>
      <td className="py-2.5 pr-4 text-sm text-muted-foreground">
        {p.amount ? `$${p.amount}` : "—"}
      </td>
      <td className="py-2.5 pr-4 text-sm text-muted-foreground">
        {p.dealstage ?? "—"}
      </td>
      <td className="py-2.5 text-sm text-muted-foreground">
        {p.closedate ? p.closedate.slice(0, 10) : "—"}
      </td>
    </tr>
  );
}

export function DealsTab() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dealname, setDealname] = useState("");
  const [amount, setAmount] = useState("");
  const [dealstage, setDealstage] = useState("");
  const [closedate, setClosedate] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const isSearching = debouncedSearch.length > 0;
  const infinite = useInfiniteHubspotDeals();
  const searchQuery = useSearchHubspotDeals(debouncedSearch);
  const createDeal = useCreateDeal();

  const deals = isSearching
    ? (searchQuery.data?.results ?? [])
    : (infinite.data?.pages.flatMap((p) => p.results) ?? []);

  const isLoading = isSearching ? searchQuery.isLoading : infinite.isLoading;

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
      <div className="flex items-center gap-3">
        <Input
          type="search"
          placeholder="Search deals…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Cancel" : "+ New deal"}
        </Button>
      </div>
      <span className="text-sm text-muted-foreground">
        {isSearching
          ? `${deals.length} result${deals.length !== 1 ? "s" : ""} for "${debouncedSearch}"`
          : `${deals.length} ${deals.length !== 1 ? "deals" : "deal"} loaded`}
      </span>

      {showForm && (
        <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg border">
          <Input
            type="text"
            placeholder="Deal name *"
            value={dealname}
            onChange={(e) => setDealname(e.target.value)}
            className="col-span-2"
          />
          <Input
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Stage"
            value={dealstage}
            onChange={(e) => setDealstage(e.target.value)}
          />
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Close date</Label>
            <Input
              type="date"
              value={closedate}
              onChange={(e) => setClosedate(e.target.value)}
            />
          </div>
          <div className="flex items-end justify-end gap-2">
            {createDeal.error && (
              <span className="text-xs text-destructive">
                {createDeal.error.message}
              </span>
            )}
            <Button
              type="button"
              size="sm"
              onClick={() => void handleCreate()}
              disabled={!dealname.trim() || createDeal.isPending}
            >
              {createDeal.isPending ? "Saving…" : "Create"}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground py-4">Loading…</p>
      ) : (
        <>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Deal
                </th>
                <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Amount
                </th>
                <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Stage
                </th>
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Close date
                </th>
              </tr>
            </thead>
            <tbody>
              {deals.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    {isSearching ? "No deals found" : "No deals yet"}
                  </td>
                </tr>
              )}
              {deals.map((d) => (
                <DealRow key={d.id} deal={d} />
              ))}
            </tbody>
          </table>
          {!isSearching && infinite.hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void infinite.fetchNextPage()}
                disabled={infinite.isFetchingNextPage}
              >
                {infinite.isFetchingNextPage ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
