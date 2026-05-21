import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useClients, useDeleteClient } from "../../hooks/clients/useClients";
import { ClientCard } from "../../components/clients/ClientCard";
import { NewClientForm } from "../../components/clients/NewClientForm";

export function ClientsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const { clients, loading, hasMore, loadMore, total } = useClients(
    debouncedSearch || undefined,
  );
  const { deleteClient } = useDeleteClient();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? "outline" : "default"}
        >
          {showForm ? "Cancel" : "New client"}
        </Button>
      </div>
      <Label htmlFor="clients-search" className="sr-only">
        Search clients
      </Label>
      <Input
        id="clients-search"
        type="search"
        placeholder="Search clients…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6"
      />

      {showForm && <NewClientForm onClose={() => setShowForm(false)} />}

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No clients yet. Create one above.
        </p>
      ) : (
        <>
          <p className="text-muted-foreground text-xs mb-2">
            {clients.length} of {total}
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
              Load more
            </Button>
          )}
        </>
      )}
    </div>
  );
}
