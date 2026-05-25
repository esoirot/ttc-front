import type { InvoiceSubtotalProps as Props } from "@/types/invoices.types";

export function InvoiceSubtotal({ items, currency }: Props) {
  const subtotal = items.reduce((s, item) => s + item.total, 0);
  return (
    <div className="mt-4 flex justify-end">
      <div className="text-right">
        <p className="text-sm text-muted-foreground">Subtotal</p>
        <p className="text-xl font-bold font-mono">
          {subtotal.toFixed(2)} {currency}
        </p>
      </div>
    </div>
  );
}
