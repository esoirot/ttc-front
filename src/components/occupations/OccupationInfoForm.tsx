import { useEffect, useRef, useState } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import { useUpdateOccupation } from "@/hooks/occupations/useOccupations";
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
import { LEGAL_FORMS, TIMEZONES } from "@/constants/occupations";
import { isValidHttpUrl, isValidOptionalEmail } from "@/lib/schemas";
import type { OccupationInfoFormProps } from "@/types/occupations.types";

export function OccupationInfoForm({
  occupationId,
  initial,
}: OccupationInfoFormProps) {
  const intl = useIntl();
  const { updateOccupation, loading: saving } = useUpdateOccupation();
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
      setValidationError(
        intl.formatMessage({
          id: "occupations.infoForm.invalidEmail",
          defaultMessage: "Enter a valid professional email address",
        }),
      );
      return;
    }
    if (!isValidHttpUrl(website.trim())) {
      setValidationError(
        intl.formatMessage({
          id: "occupations.infoForm.invalidWebsite",
          defaultMessage: "Enter a valid website URL",
        }),
      );
      return;
    }
    setValidationError(null);
    await updateOccupation({
      id: occupationId,
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
          <Label htmlFor="act-name">
            <FormattedMessage
              id="occupations.createForm.occupationName"
              defaultMessage="Occupation name"
            />
          </Label>
          <Input
            id="act-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="act-company">
            <FormattedMessage
              id="occupations.infoForm.registeredCompanyName"
              defaultMessage="Registered company name"
            />
          </Label>
          <Input
            id="act-company"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="act-legal">
            <FormattedMessage
              id="occupations.infoForm.legalForm"
              defaultMessage="Legal form"
            />
          </Label>
          <Select value={legalForm} onValueChange={setLegalForm}>
            <SelectTrigger id="act-legal">
              <SelectValue
                placeholder={intl.formatMessage({
                  id: "rates.form.selectEllipsis",
                  defaultMessage: "Select…",
                })}
              />
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
          <Label htmlFor="act-email">
            <FormattedMessage
              id="occupations.infoForm.professionalEmail"
              defaultMessage="Professional email"
            />
          </Label>
          <Input
            id="act-email"
            type="email"
            value={professionalEmail}
            onChange={(e) => setProfessionalEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="act-phone">
            <FormattedMessage
              id="occupations.infoForm.professionalPhone"
              defaultMessage="Professional phone"
            />
          </Label>
          <Input
            id="act-phone"
            value={professionalPhone}
            onChange={(e) => setProfessionalPhone(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="act-website">
            <FormattedMessage
              id="clients.header.field.website"
              defaultMessage="Website"
            />
          </Label>
          <Input
            id="act-website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="act-timezone">
            <FormattedMessage
              id="occupations.infoForm.timezone"
              defaultMessage="Timezone"
            />
          </Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger id="act-timezone">
              <SelectValue
                placeholder={intl.formatMessage({
                  id: "occupations.infoForm.selectTimezone",
                  defaultMessage: "Select timezone…",
                })}
              />
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
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          <FormattedMessage
            id="occupations.infoForm.saved"
            defaultMessage="Saved."
          />
        </p>
      )}
      <Button type="submit" className="self-start" disabled={saving}>
        {saving ? (
          <FormattedMessage
            id="clients.header.saving"
            defaultMessage="Saving…"
          />
        ) : (
          <FormattedMessage id="common.actions.save" defaultMessage="Save" />
        )}
      </Button>
    </form>
  );
}
