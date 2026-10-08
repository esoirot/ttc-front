import { useState } from "react";
import { ColorField } from "@/components/clients/form-fields/ColorField";

const HEX = /^#[0-9a-f]{6}$/i;

/**
 * The client colour picker for a task. Saves a picked preset at once, a typed
 * colour once it is a full hex, and an emptied field as "no colour".
 */
export function TaskColorField({
  id,
  value,
  onSave,
}: {
  id: string;
  value: string;
  onSave: (color: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  return (
    <ColorField
      id={id}
      value={draft}
      onChange={(next) => {
        setDraft(next);
        if (next === "" || HEX.test(next)) onSave(next);
      }}
    />
  );
}
