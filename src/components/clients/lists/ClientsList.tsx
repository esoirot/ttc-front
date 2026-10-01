import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClients, useDeleteClient } from "@/hooks/clients/useClients";
import type { ClientType } from "@/types/clients.types";
import { NewClientForm } from "../forms/NewClientForm";
import { ClientCard } from "../cards/ClientCard";

export function ClientsList() {
  const intl = useIntl();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ClientType | "ALL">("ALL");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const { clients, loading, hasMore, loadMore, total } = useClients(
    debouncedSearch || undefined,
    typeFilter === "ALL" ? undefined : typeFilter,
    undefined,
    "CLIENT",
  );
  const { deleteClient } = useDeleteClient();

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          <FormattedMessage id="clients.list.title" defaultMessage="Clients" />
        </h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? "outline" : "default"}
        >
          {showForm ? (
            <FormattedMessage
              id="common.actions.cancel"
              defaultMessage="Cancel"
            />
          ) : (
            <FormattedMessage
              id="clients.list.newClient"
              defaultMessage="New client"
            />
          )}
        </Button>
      </div>

      <div className="flex flex-col gap-3 pb-4 border-b border-border mb-6">
        <Label htmlFor="clients-search" className="sr-only">
          <FormattedMessage
            id="clients.list.searchLabel"
            defaultMessage="Search clients"
          />
        </Label>
        <Input
          id="clients-search"
          type="search"
          placeholder={intl.formatMessage({
            id: "clients.list.searchPlaceholder",
            defaultMessage: "Search clients…",
          })}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Tabs
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as ClientType | "ALL")}
        >
          <TabsList>
            <TabsTrigger value="ALL">
              <FormattedMessage id="clients.list.all" defaultMessage="All" />
            </TabsTrigger>
            <TabsTrigger value="COMPANY">
              <FormattedMessage
                id="clients.list.companies"
                defaultMessage="Companies"
              />
            </TabsTrigger>
            <TabsTrigger value="INDIVIDUAL">
              <FormattedMessage
                id="clients.list.individuals"
                defaultMessage="Individuals"
              />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {showForm && <NewClientForm onClose={() => setShowForm(false)} />}

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          <FormattedMessage
            id="clients.list.empty"
            defaultMessage="No clients yet. Create one above."
          />
        </p>
      ) : (
        <>
          <p className="text-muted-foreground text-xs mb-2">
            <FormattedMessage
              id="clients.list.countOfTotal"
              defaultMessage="{count} of {total}"
              values={{ count: clients.length, total }}
            />
          </p>
          <div className="flex flex-col gap-2">
            {clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onDelete={(id) => void deleteClient(id)}
              />
            ))}
          </div>
          {hasMore && (
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={loadMore}
              disabled={loading}
            >
              <FormattedMessage
                id="clients.list.loadMore"
                defaultMessage="Load more"
              />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
