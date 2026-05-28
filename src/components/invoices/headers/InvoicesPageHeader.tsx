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
      <h1 className="text-2xl font-bold">Invoices</h1>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onToggleGenerate}>
          Generate from project
        </Button>
        <Button onClick={onToggleCreate}>New invoice</Button>
      </div>
    </div>
  );
}
