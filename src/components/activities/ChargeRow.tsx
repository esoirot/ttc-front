import { useState } from "react";
import {
  useUpdateCharge,
  useDeleteCharge,
} from "@/hooks/activities/useActivities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { centsToEuros, eurosToCents, formatCents } from "@/lib/currency";
import type { ChargeRowProps } from "@/types/activities.types";

export function ChargeRow({ charge, activityId }: ChargeRowProps) {
  const { updateCharge, loading: updating } = useUpdateCharge(activityId);
  const { deleteCharge } = useDeleteCharge(activityId);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(charge.name);
  const [editAmount, setEditAmount] = useState(centsToEuros(charge.amount));

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cents = eurosToCents(editAmount);
    await updateCharge({
      id: charge.id,
      name: editName.trim() || null,
      amount: cents,
    });
    setEditing(false);
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="flex items-center gap-2 py-1">
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="h-8 text-sm flex-1"
          required
        />
        <Input
          value={editAmount}
          onChange={(e) => setEditAmount(e.target.value)}
          className="h-8 text-sm w-28"
          type="number"
          step="0.01"
          min="0"
        />
        <Button type="submit" size="sm" disabled={updating}>
          Save
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setEditing(false)}
        >
          Cancel
        </Button>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm">{charge.name}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm font-mono text-muted-foreground">
          {formatCents(charge.amount)}
        </span>
        <button
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setEditing(true)}
        >
          ✎
        </button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="text-xs text-muted-foreground hover:text-destructive">
              ✕
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete charge?</AlertDialogTitle>
              <AlertDialogDescription>
                "{charge.name}" will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => void deleteCharge(charge.id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
