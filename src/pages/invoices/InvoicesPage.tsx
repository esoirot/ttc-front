import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useInvoices,
  type InvoiceStatus,
} from "../../hooks/invoices/useInvoices";
import { useClients } from "../../hooks/clients/useClients";
import { useProjects } from "../../hooks/projects/useProjects";
import { CreateInvoiceForm } from "../../components/invoices/CreateInvoiceForm";
import { GenerateInvoiceForm } from "../../components/invoices/GenerateInvoiceForm";
import { InvoiceListCard } from "../../components/invoices/InvoiceListCard";

const STATUS_TABS: { value: InvoiceStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Sent" },
  { value: "PAID", label: "Paid" },
];

export function InvoicesPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<InvoiceStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const { invoices, loading, hasMore, loadMore, total } = useInvoices(
    tab === "ALL" ? undefined : tab,
    undefined,
    debouncedSearch || undefined,
  );
  const { clients } = useClients();
  const { projects } = useProjects();
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c.name]));

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowGenerate(!showGenerate);
              setShowCreate(false);
            }}
          >
            Generate from project
          </Button>
          <Button
            onClick={() => {
              setShowCreate(!showCreate);
              setShowGenerate(false);
            }}
          >
            New invoice
          </Button>
        </div>
      </div>

      {showCreate && (
        <CreateInvoiceForm
          clients={clients}
          onClose={() => setShowCreate(false)}
          onCreated={(id) => navigate(`/invoices/${id}`)}
        />
      )}

      {showGenerate && (
        <GenerateInvoiceForm
          clients={clients}
          projects={projects}
          onClose={() => setShowGenerate(false)}
          onGenerated={(id) => navigate(`/invoices/${id}`)}
        />
      )}

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as InvoiceStatus | "ALL")}
      >
        <div className="flex flex-col gap-3 pb-4 border-b border-border mb-6">
          <Label htmlFor="invoices-search" className="sr-only">
            Search invoices
          </Label>
          <Input
            id="invoices-search"
            type="search"
            placeholder="Search invoices…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <TabsList>
            {STATUS_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {STATUS_TABS.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            {loading ? (
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded" />
                ))}
              </div>
            ) : invoices.length === 0 ? (
              <p className="text-muted-foreground text-sm">No invoices.</p>
            ) : (
              <>
                <p className="text-muted-foreground text-xs mb-2">
                  {invoices.length} of {total}
                </p>
                <div className="flex flex-col gap-2">
                  {invoices.map((inv) => (
                    <InvoiceListCard
                      key={inv.id}
                      inv={inv}
                      clientName={
                        inv.clientId != null
                          ? clientMap[inv.clientId]
                          : undefined
                      }
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
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
