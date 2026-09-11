import { FormattedMessage } from "react-intl";
import { Button } from "@/components/ui/button";

export function InvoicesPageHeader({
  onToggleCreate,
  onToggleGenerate,
}: {
  onToggleCreate: () => void;
  onToggleGenerate: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">
        <FormattedMessage
          id="invoices.pageHeader.title"
          defaultMessage="Invoices"
        />
      </h1>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onToggleGenerate}>
          <FormattedMessage
            id="invoices.pageHeader.generateFromProject"
            defaultMessage="Generate from project"
          />
        </Button>
        <Button onClick={onToggleCreate}>
          <FormattedMessage
            id="invoices.pageHeader.newInvoice"
            defaultMessage="New invoice"
          />
        </Button>
      </div>
    </div>
  );
}
