import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BulkDeleteBarProps<Id extends number | string> {
  selectedIds: Set<Id>;
  itemLabel: string;
  onDelete: (id: Id) => Promise<unknown>;
  onDone: () => void;
  excludeIds?: Set<Id>;
}

export function BulkDeleteBar<Id extends number | string>({
  selectedIds,
  itemLabel,
  onDelete,
  onDone,
  excludeIds,
}: BulkDeleteBarProps<Id>) {
  if (selectedIds.size === 0) return null;

  async function handleConfirm() {
    const ids = [...selectedIds].filter((id) => !excludeIds?.has(id));
    await Promise.allSettled(ids.map((id) => onDelete(id)));
    onDone();
  }

  return (
    <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-muted rounded text-sm">
      <span className="text-muted-foreground">{selectedIds.size} selected</span>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="destructive" className="ml-auto h-7">
            Delete selected ({selectedIds.size})
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedIds.size} {itemLabel}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void handleConfirm()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
