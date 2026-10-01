import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ALL_PERMISSIONS } from "@/constants/admin";
import type { AdminPermission } from "@/types/users.types";

export function PermissionsEditor({
  value,
  onChange,
}: {
  value: AdminPermission[];
  onChange: (v: AdminPermission[]) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {ALL_PERMISSIONS.map((p) => (
        <Label key={p} className="font-normal">
          <Checkbox
            checked={value.includes(p)}
            onCheckedChange={(checked) =>
              onChange(checked ? [...value, p] : value.filter((x) => x !== p))
            }
          />
          <span className="font-mono text-xs">{p}</span>
        </Label>
      ))}
    </div>
  );
}
