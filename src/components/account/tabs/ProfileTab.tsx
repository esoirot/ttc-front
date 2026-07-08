import { useProfileForm } from "@/hooks/account/useProfileForm";
import { toSafeHttpsSrc } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES } from "@/constants/rates";
import {
  DATE_FORMATS,
  HOUR_FORMATS,
  LANGUAGES,
  NUMBER_FORMATS,
} from "@/constants/hubspot";

export function ProfileTab() {
  const {
    user,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    mobilePhone,
    setMobilePhone,
    jobTitle,
    setJobTitle,
    logoUrl,
    setLogoUrl,
    defaultCurrency,
    setDefaultCurrency,
    interfaceLanguage,
    setInterfaceLanguage,
    dateFormat,
    setDateFormat,
    hourFormat,
    setHourFormat,
    numberFormat,
    setNumberFormat,
    saved,
    saving,
    saveError,
    validationError,
    handleSaveProfile,
  } = useProfileForm();
  const logoPreviewSrc = toSafeHttpsSrc(logoUrl);

  return (
    <form
      onSubmit={handleSaveProfile}
      className="flex flex-col gap-5 max-w-2xl"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-firstname">First name</Label>
              <Input
                id="profile-firstname"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-lastname">Last name</Label>
              <Input
                id="profile-lastname"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-phone">Mobile phone</Label>
            <Input
              id="profile-phone"
              type="tel"
              value={mobilePhone}
              onChange={(e) => setMobilePhone(e.target.value)}
              placeholder="+1 555 000 0000"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-jobtitle">Job title</Label>
            <Input
              id="profile-jobtitle"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Translator"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-logo">Logo URL</Label>
            <Input
              id="profile-logo"
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
            />
            {logoPreviewSrc && (
              <img
                src={logoPreviewSrc}
                alt="Logo preview"
                className="mt-1 max-h-12 max-w-[110px] object-contain rounded border border-border"
              />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Default currency</Label>
            <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
              <SelectTrigger className="w-[140px]">
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
            <p className="text-xs text-muted-foreground">
              Used as the default currency for new rate sheets.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Role</span>
            <Badge variant="secondary" className="w-fit">
              {user?.role}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Localisation</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Interface language</Label>
            <Select
              value={interfaceLanguage}
              onValueChange={setInterfaceLanguage}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Date format</Label>
            <Select value={dateFormat} onValueChange={setDateFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_FORMATS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Hour format</Label>
            <Select value={hourFormat} onValueChange={setHourFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HOUR_FORMATS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Number format</Label>
            <Select value={numberFormat} onValueChange={setNumberFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NUMBER_FORMATS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {validationError && (
        <p className="text-sm text-destructive">{validationError}</p>
      )}

      {saveError && (
        <p className="text-sm text-destructive">{saveError.message}</p>
      )}

      {saved && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Profile saved.
        </p>
      )}

      <Button type="submit" className="self-start" disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
