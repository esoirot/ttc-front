import { useEffect, useRef, useState } from "react";
import { useUpdateActivity } from "@/hooks/activities/useActivities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEGAL_FORMS, TIMEZONES } from "@/constants/activities";
import { isValidHttpUrl, isValidOptionalEmail } from "@/lib/schemas";
import type { ActivityInfoFormProps } from "@/types/activities.types";

export function ActivityInfoForm({
  activityId,
  initial,
}: ActivityInfoFormProps) {
  const { updateActivity, loading: saving } = useUpdateActivity();
  const [name, setName] = useState(initial.name);
  const [companyName, setCompanyName] = useState(initial.companyName ?? "");
  const [legalForm, setLegalForm] = useState(initial.legalForm ?? "");
  const [professionalEmail, setProfessionalEmail] = useState(
    initial.professionalEmail ?? "",
  );
  const [professionalPhone, setProfessionalPhone] = useState(
    initial.professionalPhone ?? "",
  );
  const [website, setWebsite] = useState(initial.website ?? "");
  const [timezone, setTimezone] = useState(initial.timezone ?? "");
  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    return () => clearTimeout(savedTimeoutRef.current);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValidOptionalEmail(professionalEmail.trim())) {
      setValidationError("Enter a valid professional email address");
      return;
    }
    if (!isValidHttpUrl(website.trim())) {
      setValidationError("Enter a valid website URL");
      return;
    }
    setValidationError(null);
    await updateActivity({
      id: activityId,
      name: name.trim() || null,
      companyName: companyName.trim() || null,
      legalForm: legalForm || null,
      professionalEmail: professionalEmail.trim() || null,
      professionalPhone: professionalPhone.trim() || null,
      website: website.trim() || null,
      timezone: timezone || null,
    });
    setSaved(true);
    clearTimeout(savedTimeoutRef.current);
    savedTimeoutRef.current = setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="act-name">Activity name</Label>
          <Input
            id="act-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="act-company">Registered company name</Label>
          <Input
            id="act-company"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="act-legal">Legal form</Label>
          <Select value={legalForm} onValueChange={setLegalForm}>
            <SelectTrigger id="act-legal">
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {LEGAL_FORMS.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="act-email">Professional email</Label>
          <Input
            id="act-email"
            type="email"
            value={professionalEmail}
            onChange={(e) => setProfessionalEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="act-phone">Professional phone</Label>
          <Input
            id="act-phone"
            value={professionalPhone}
            onChange={(e) => setProfessionalPhone(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="act-website">Website</Label>
          <Input
            id="act-website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="act-timezone">Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger id="act-timezone">
              <SelectValue placeholder="Select timezone…" />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {validationError && (
        <p className="text-sm text-destructive">{validationError}</p>
      )}
      {saved && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">Saved.</p>
      )}
      <Button type="submit" className="self-start" disabled={saving}>
        {saving ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
