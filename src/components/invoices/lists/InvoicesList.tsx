import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InvoiceStatus } from "@/types/invoices.types";
import { useInvoicesPage } from "@/hooks/invoices/useInvoicesPage";

import { STATUS_TABS } from "@/constants/invoices";
import { InvoiceListCard } from "../cards/InvoiceListCard";
import { GenerateInvoiceForm } from "../forms/GenerateInvoiceForm";
import { CreateInvoiceForm } from "../forms/CreateInvoiceForm";
import { InvoicesPageHeader } from "../headers/InvoicesPageHeader";

export function InvoicesList() {
  const {
    navigate,
    tab,
    setTab,
    search,
    setSearch,
    invoices,
    loading,
    hasMore,
    loadMore,
    total,
    clients,
    projects,
    clientMap,
    showCreate,
    setShowCreate,
    showGenerate,
    setShowGenerate,
    toggleCreate,
    toggleGenerate,
  } = useInvoicesPage();

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <InvoicesPageHeader
        onToggleCreate={toggleCreate}
        onToggleGenerate={toggleGenerate}
      />

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
