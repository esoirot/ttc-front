import { useState } from "react";
import { useCreateCharge } from "@/hooks/activities/useActivities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { eurosToCents } from "@/lib/currency";
import type { AddChargeFormProps } from "@/types/activities.types";

export function AddChargeForm({ activityId, type }: AddChargeFormProps) {
  const { createCharge, loading } = useCreateCharge(activityId);
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cents = eurosToCents(amount);
    if (!name.trim() || cents == null) return;
    await createCharge({ name: name.trim(), amount: cents, type });
    setName("");
    setAmount("");
    setShow(false);
  }

  if (!show) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="mt-1 text-xs h-7"
        onClick={() => setShow(true)}
      >
        + Add
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="h-8 text-sm flex-1"
        required
        autoFocus
      />
      <Input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.00"
        type="number"
        step="0.01"
        min="0"
        className="h-8 text-sm w-28"
      />
      <Button type="submit" size="sm" disabled={loading}>
        Add
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => setShow(false)}
      >
        Cancel
      </Button>
    </form>
  );
}
