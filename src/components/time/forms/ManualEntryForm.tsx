import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ManualEntryFormProps } from "@/types/time-entries.types";
import { useCreateTimeEntry } from "@/hooks/time/useTimeEntries";
import { DescriptionCombobox } from "../form-inputs/DescriptionCombobox";
import { TtcTagChips } from "../tags/TtcTagChips";

function toLocalIso(date: string, time: string): string {
  return `${date}T${time}:00`;
}

export function ManualEntryForm({
  onClose,
  recentDescriptions,
  tags,
}: ManualEntryFormProps) {
  const { createTimeEntry, loading: creating } = useCreateTimeEntry();
  const [desc, setDesc] = useState("");
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("10:00");

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!startDate || !endDate) return;
    await createTimeEntry({
      description: desc || undefined,
      startTime: toLocalIso(startDate, startTime),
      endTime: toLocalIso(endDate, endTime),
      tagIds: tagIds.length ? tagIds : undefined,
    });
    setDesc("");
    setTagIds([]);
    setStartDate("");
    setEndDate("");
    onClose();
  }

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="me-desc">Description</Label>
            <DescriptionCombobox
              value={desc}
              onChange={setDesc}
              recentDescriptions={recentDescriptions}
              placeholder="What did you work on?"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Tags</Label>
            <TtcTagChips
              tagIds={tagIds}
              tags={tags}
              onAdd={(id) => setTagIds((prev) => [...prev, id])}
              onRemove={(id) =>
                setTagIds((prev) => prev.filter((t) => t !== id))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="me-start-date">Start date</Label>
              <Input
                id="me-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="me-start-time">Start time</Label>
              <Input
                id="me-start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="me-end-date">End date</Label>
              <Input
                id="me-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="me-end-time">End time</Label>
              <Input
                id="me-end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" disabled={creating} className="self-end">
            {creating ? "Saving…" : "Save entry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
