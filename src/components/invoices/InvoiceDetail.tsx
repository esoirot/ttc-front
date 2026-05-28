import { useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvoiceDetail } from "@/hooks/invoices/useInvoiceDetail";
import { InvoiceDetailHeader } from "./InvoiceDetailHeader";
import { InvoiceMetaCard } from "./InvoiceMetaCard";
import { InvoiceLineItems } from "./InvoiceLineItems";
import { InvoiceSubtotal } from "./InvoiceSubtotal";

export function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const invoiceId = Number(id);
  const {
    invoice,
    loading,
    user,
    updateInvoice,
    addItem,
    adding,
    updateItem,
    removeItem,
    downloading,
    handleDownloadPdf,
    handleDelete,
  } = useInvoiceDetail(invoiceId);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <p className="text-muted-foreground">Invoice not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <InvoiceDetailHeader
        number={invoice.number}
        status={invoice.status}
        dueDate={invoice.dueDate}
        logoUrl={user?.logoUrl}
        downloading={downloading}
        onStatusChange={(next) =>
          void updateInvoice({ id: invoiceId, status: next })
        }
        onDownloadPdf={handleDownloadPdf}
        onDelete={handleDelete}
      />

      <InvoiceMetaCard
        clientId={invoice.clientId}
        currency={invoice.currency}
        dueDate={invoice.dueDate}
        notes={invoice.notes}
        onUpdate={(input) =>
          updateInvoice({
            id: invoiceId,
            clientId: input.clientId ?? undefined,
            currency: input.currency,
            dueDate: input.dueDate ?? undefined,
            notes: input.notes ?? undefined,
          })
        }
      />

      <InvoiceLineItems
        invoiceId={invoiceId}
        items={invoice.items}
        onAddItem={addItem}
        onUpdateItem={updateItem}
        onRemoveItem={(itemId) => void removeItem(itemId)}
        adding={adding}
      />

      <InvoiceSubtotal items={invoice.items} currency={invoice.currency} />
    </div>
  );
}
