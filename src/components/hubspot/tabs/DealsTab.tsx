import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { HubspotDeal } from "@/types/hubspot.types";
import {
  useCreateDeal,
  useInfiniteHubspotDeals,
  useSearchHubspotDeals,
} from "@/hooks/integrations/useHubspot";

function DealRow({ deal }: { deal: HubspotDeal }) {
  const intl = useIntl();
  const p = deal.properties;
  const amount = p.amount ? Number(p.amount) : null;
  return (
    <tr className="border-b border-border">
      <td className="py-2.5 pr-4 text-sm">{p.dealname ?? "—"}</td>
      <td className="py-2.5 pr-4 text-sm text-muted-foreground">
        {amount == null || isNaN(amount)
          ? "—"
          : p.deal_currency_code
            ? intl.formatNumber(amount, {
                style: "currency",
                currency: p.deal_currency_code,
              })
            : intl.formatNumber(amount)}
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
  const intl = useIntl();
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
          placeholder={intl.formatMessage({
            id: "hubspot.dealsTab.searchPlaceholder",
            defaultMessage: "Search deals…",
          })}
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
          {showForm ? (
            <FormattedMessage
              id="common.actions.cancel"
              defaultMessage="Cancel"
            />
          ) : (
            <FormattedMessage
              id="hubspot.dealsTab.newDeal"
              defaultMessage="+ New deal"
            />
          )}
        </Button>
      </div>
      <span className="text-sm text-muted-foreground">
        {isSearching
          ? intl.formatMessage(
              {
                id: "hubspot.tab.resultCount",
                defaultMessage:
                  '{count, plural, one {# result} other {# results}} for "{query}"',
              },
              { count: deals.length, query: debouncedSearch },
            )
          : intl.formatMessage(
              {
                id: "hubspot.dealsTab.loadedCount",
                defaultMessage:
                  "{count, plural, one {# deal loaded} other {# deals loaded}}",
              },
              { count: deals.length },
            )}
      </span>

      {showForm && (
        <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg border">
          <Input
            type="text"
            placeholder={intl.formatMessage({
              id: "hubspot.dealsTab.dealNamePlaceholder",
              defaultMessage: "Deal name *",
            })}
            value={dealname}
            onChange={(e) => setDealname(e.target.value)}
            className="col-span-2"
          />
          <Input
            type="text"
            placeholder={intl.formatMessage({
              id: "hubspot.dealsTab.amountPlaceholder",
              defaultMessage: "Amount",
            })}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Input
            type="text"
            placeholder={intl.formatMessage({
              id: "hubspot.dealsTab.stagePlaceholder",
              defaultMessage: "Stage",
            })}
            value={dealstage}
            onChange={(e) => setDealstage(e.target.value)}
          />
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">
              <FormattedMessage
                id="hubspot.dealsTab.closeDateLabel"
                defaultMessage="Close date"
              />
            </Label>
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
              {createDeal.isPending ? (
                <FormattedMessage
                  id="hubspot.tab.saving"
                  defaultMessage="Saving…"
                />
              ) : (
                <FormattedMessage
                  id="hubspot.tab.create"
                  defaultMessage="Create"
                />
              )}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground py-4">
          <FormattedMessage
            id="hubspot.tab.loading"
            defaultMessage="Loading…"
          />
        </p>
      ) : (
        <>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <FormattedMessage
                    id="hubspot.dealsTab.colDeal"
                    defaultMessage="Deal"
                  />
                </th>
                <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <FormattedMessage
                    id="hubspot.dealsTab.colAmount"
                    defaultMessage="Amount"
                  />
                </th>
                <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <FormattedMessage
                    id="hubspot.dealsTab.colStage"
                    defaultMessage="Stage"
                  />
                </th>
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <FormattedMessage
                    id="hubspot.dealsTab.colCloseDate"
                    defaultMessage="Close date"
                  />
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
                    {isSearching ? (
                      <FormattedMessage
                        id="hubspot.dealsTab.noResults"
                        defaultMessage="No deals found"
                      />
                    ) : (
                      <FormattedMessage
                        id="hubspot.dealsTab.noDeals"
                        defaultMessage="No deals yet"
                      />
                    )}
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
                {infinite.isFetchingNextPage ? (
                  <FormattedMessage
                    id="hubspot.tab.loading"
                    defaultMessage="Loading…"
                  />
                ) : (
                  <FormattedMessage
                    id="hubspot.tab.loadMore"
                    defaultMessage="Load more"
                  />
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
