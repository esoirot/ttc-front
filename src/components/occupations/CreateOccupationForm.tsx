import { useNavigate } from "react-router-dom";
import { useIntl, FormattedMessage } from "react-intl";
import { useCreateOccupation } from "@/hooks/occupations/useOccupations";
import { useCreateOccupationForm } from "@/hooks/occupations/useCreateOccupationForm";
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
import { OCCUPATION_TYPE_LABEL_MESSAGES } from "@/constants/occupations";
import { LanguagePairsInput } from "./LanguagePairsInput";
import { CustomFieldsInput } from "./CustomFieldsInput";
import type { CreateOccupationFormProps } from "@/types/occupations.types";

export function CreateOccupationForm({ onCancel }: CreateOccupationFormProps) {
  const intl = useIntl();
  const navigate = useNavigate();
  const { createOccupation, loading: creating } = useCreateOccupation();
  const {
    newName,
    setNewName,
    occupationType,
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
  } = useCreateOccupationForm();

  function handleCancel() {
    reset();
    onCancel();
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid()) return;
    const result = await createOccupation({
      name: newName.trim(),
      occupationType,
      languagePairs:
        occupationType === "TRANSLATOR" && languagePairs.length > 0
          ? languagePairs
          : null,
      customFields:
        occupationType === "CUSTOM" && customFields.length > 0
          ? customFields
          : null,
    });
    if (result) {
      navigate(`/occupations/${result.id}`);
    }
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-4">
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>
                <FormattedMessage
                  id="occupations.createForm.occupationType"
                  defaultMessage="Occupation type"
                />
              </Label>
              <Select value={occupationType} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRANSLATOR">
                    {intl.formatMessage(
                      OCCUPATION_TYPE_LABEL_MESSAGES.TRANSLATOR,
                    )}
                  </SelectItem>
                  <SelectItem value="CORRECTOR">
                    {intl.formatMessage(
                      OCCUPATION_TYPE_LABEL_MESSAGES.CORRECTOR,
                    )}
                  </SelectItem>
                  <SelectItem value="CUSTOM">
                    {intl.formatMessage(OCCUPATION_TYPE_LABEL_MESSAGES.CUSTOM)}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-occupation-name">
                <FormattedMessage
                  id="occupations.createForm.occupationName"
                  defaultMessage="Occupation name"
                />
              </Label>
              <Input
                id="new-occupation-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={intl.formatMessage({
                  id: "occupations.createForm.occupationNamePlaceholder",
                  defaultMessage: "e.g. EI Freelance Translation",
                })}
                required
                autoFocus
              />
            </div>
          </div>

          {occupationType === "TRANSLATOR" && (
            <LanguagePairsInput
              pairs={languagePairs}
              onAdd={addLanguagePair}
              onUpdate={updateLanguagePair}
              onRemove={removeLanguagePair}
            />
          )}

          {occupationType === "CUSTOM" && (
            <CustomFieldsInput
              fields={customFields}
              onAdd={addCustomField}
              onUpdate={updateCustomField}
              onRemove={removeCustomField}
            />
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={creating || !isValid()}>
              {creating ? (
                <FormattedMessage
                  id="occupations.createForm.creating"
                  defaultMessage="Creating…"
                />
              ) : (
                <FormattedMessage
                  id="projects.taskChecklist.create"
                  defaultMessage="Create"
                />
              )}
            </Button>
            <Button type="button" variant="ghost" onClick={handleCancel}>
              <FormattedMessage
                id="common.actions.cancel"
                defaultMessage="Cancel"
              />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
