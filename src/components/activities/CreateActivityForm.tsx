import { useNavigate } from "react-router-dom";
import { useCreateActivity } from "@/hooks/activities/useActivities";
import { useCreateActivityForm } from "@/hooks/activities/useCreateActivityForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LanguagePairsInput } from "./LanguagePairsInput";
import { CustomFieldsInput } from "./CustomFieldsInput";
import type { CreateActivityFormProps } from "@/types/activities.types";

export function CreateActivityForm({ onCancel }: CreateActivityFormProps) {
  const navigate = useNavigate();
  const { createActivity, loading: creating } = useCreateActivity();
  const {
    newName,
    setNewName,
    activityType,
    languagePairs,
    customFields,
    reset,
    handleTypeChange,
    addLanguagePair,
    updateLanguagePair,
    removeLanguagePair,
    addCustomField,
    updateCustomField,
    removeCustomField,
    isValid,
  } = useCreateActivityForm();

  function handleCancel() {
    reset();
    onCancel();
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid()) return;
    const result = await createActivity({
      name: newName.trim(),
      activityType,
      languagePairs:
        activityType === "TRANSLATOR" && languagePairs.length > 0
          ? languagePairs
          : null,
      customFields:
        activityType === "CUSTOM" && customFields.length > 0
          ? customFields
          : null,
    });
    if (result.data?.createActivity) {
      navigate(`/activities/${result.data.createActivity.id}`);
    }
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-4">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Activity type</Label>
              <Select value={activityType} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRANSLATOR">Translator</SelectItem>
                  <SelectItem value="CORRECTOR">Corrector</SelectItem>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-activity-name">Activity name</Label>
              <Input
                id="new-activity-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. EI Freelance Translation"
                required
                autoFocus
              />
            </div>
          </div>

          {activityType === "TRANSLATOR" && (
            <LanguagePairsInput
              pairs={languagePairs}
              onAdd={addLanguagePair}
              onUpdate={updateLanguagePair}
              onRemove={removeLanguagePair}
            />
          )}

          {activityType === "CUSTOM" && (
            <CustomFieldsInput
              fields={customFields}
              onAdd={addCustomField}
              onUpdate={updateCustomField}
              onRemove={removeCustomField}
            />
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={creating || !isValid()}>
              {creating ? "Creating…" : "Create"}
            </Button>
            <Button type="button" variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
