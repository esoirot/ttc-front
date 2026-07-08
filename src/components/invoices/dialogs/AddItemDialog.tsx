import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { AddItemDialogProps as Props } from "@/types/invoices.types";
import { TimeEntriesTab } from "../tabs/TimeEntriesTab";
import { CustomLineTab } from "../tabs/CustomLineTab";

export function AddItemDialog({
  invoiceId,
  alreadyAddedEntryIds,
  onAdd,
  adding,
  open,
  onOpenChange,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Add line item</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="time">
          <TabsList className="mb-4">
            <TabsTrigger value="time">Time Entries</TabsTrigger>
            <TabsTrigger value="custom">Custom Line</TabsTrigger>
          </TabsList>
          <TabsContent value="time" className="mt-0">
            <TimeEntriesTab
              invoiceId={invoiceId}
              alreadyAddedEntryIds={alreadyAddedEntryIds}
              onAdd={onAdd}
              adding={adding}
            />
          </TabsContent>
          <TabsContent value="custom" className="mt-0">
            <CustomLineTab
              invoiceId={invoiceId}
              onAdd={onAdd}
              adding={adding}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
