import { useEffect, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useUpdateOccupation } from "@/hooks/occupations/useOccupations";
import { Button } from "@/components/ui/button";
import { CustomFieldsInput } from "./CustomFieldsInput";
import type {
  CustomFieldDraft,
  CustomFieldsSectionProps,
} from "@/types/occupations.types";

export function CustomFieldsSection({
  occupationId,
  initialFields,
}: CustomFieldsSectionProps) {
  const { updateOccupation, loading: saving } = useUpdateOccupation();
  const [fields, setFields] = useState<CustomFieldDraft[]>(
    initialFields.map(({ key, value }) => ({ key, value })),
  );
  const [saved, setSaved] = useState(false);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    return () => clearTimeout(savedTimeoutRef.current);
  }, []);

  function updateField(
    i: number,
    field: keyof CustomFieldDraft,
    value: string,
  ) {
    setFields((prev) =>
      prev.map((f, idx) => (idx === i ? { ...f, [field]: value } : f)),
    );
  }

  const isValid = fields.every((f) => f.key.trim() !== "");

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid) return;
    await updateOccupation({
      id: occupationId,
      customFields: fields.map((f) => ({
        key: f.key.trim(),
        value: f.value.trim(),
      })),
    });
    setSaved(true);
    clearTimeout(savedTimeoutRef.current);
    savedTimeoutRef.current = setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-3">
      <CustomFieldsInput
        fields={fields}
        onAdd={() => setFields((prev) => [...prev, { key: "", value: "" }])}
        onUpdate={updateField}
        onRemove={(i) =>
          setFields((prev) => prev.filter((_, idx) => idx !== i))
        }
      />
      <div className="flex items-center justify-end gap-2">
        {saved && (
          <span className="text-sm text-emerald-600 dark:text-emerald-400">
            <FormattedMessage
              id="occupations.infoForm.saved"
              defaultMessage="Saved."
            />
          </span>
        )}
        <Button type="submit" size="sm" disabled={saving || !isValid}>
          {saving ? (
            <FormattedMessage
              id="clients.header.saving"
              defaultMessage="Saving…"
            />
          ) : (
            <FormattedMessage id="common.actions.save" defaultMessage="Save" />
          )}
        </Button>
      </div>
    </form>
  );
}
