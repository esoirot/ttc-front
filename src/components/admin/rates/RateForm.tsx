import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES, TRANSLATION_RATE_TYPES } from "@/constants/rates";
import type { TranslationRateType } from "@/types/rates.types";
import { useMyActivities } from "@/hooks/activities/useActivities";

export function RateForm({
  form,
  onChange,
}: {
  form: {
    name: string;
    type: TranslationRateType;
    amount: string;
    currency: string;
    description: string;
    activityId: string;
  };
  onChange: (f: typeof form) => void;
}) {
  const { activities } = useMyActivities();

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label>Name *</Label>
        <Input
          className="mt-1"
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
        />
      </div>
      <div>
        <Label>Activity *</Label>
        <Select
          value={form.activityId}
          onValueChange={(v) => onChange({ ...form, activityId: v })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select activity…" />
          </SelectTrigger>
          <SelectContent>
            {activities.map((a) => (
              <SelectItem key={a.id} value={String(a.id)}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Type</Label>
        <Select
          value={form.type}
          onValueChange={(v) =>
            onChange({ ...form, type: v as TranslationRateType })
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TRANSLATION_RATE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Amount *</Label>
          <Input
            className="mt-1"
            type="number"
            step="0.0001"
            value={form.amount}
            onChange={(e) => onChange({ ...form, amount: e.target.value })}
          />
        </div>
        <div>
          <Label>Currency</Label>
          <Select
            value={form.currency}
            onValueChange={(v) => onChange({ ...form, currency: v })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <Input
          className="mt-1"
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
        />
      </div>
    </div>
  );
}
