import { useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvoiceDetail } from "../../hooks/invoices/useInvoiceDetail";
import { InvoiceDetailHeader } from "../../components/invoices/InvoiceDetailHeader";
import { InvoiceLineItems } from "../../components/invoices/InvoiceLineItems";

export function InvoiceDetailPage() {
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

  const subtotal = invoice.items.reduce((s, item) => s + item.total, 0);

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

      <InvoiceLineItems
        invoiceId={invoiceId}
        items={invoice.items}
        onAddItem={addItem}
        onUpdateItem={updateItem}
        onRemoveItem={(itemId) => void removeItem(itemId)}
        adding={adding}
      />

      <div className="mt-4 flex justify-end">
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Subtotal</p>
          <p className="text-xl font-bold font-mono">
            {subtotal.toFixed(2)} {invoice.currency}
          </p>
        </div>
      </div>
    </div>
  );
}
