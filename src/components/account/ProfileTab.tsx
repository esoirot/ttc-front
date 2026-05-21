import { useProfileForm } from "@/hooks/account/useProfileForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export function ProfileTab() {
  const {
    user,
    name,
    setName,
    email,
    setEmail,
    logoUrl,
    setLogoUrl,
    saved,
    saving,
    saveError,
    handleSaveProfile,
  } = useProfileForm();

  return (
    <form onSubmit={handleSaveProfile} className="flex flex-col gap-5 max-w-md">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-name">Name</Label>
        <Input
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
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
        <Label htmlFor="profile-logo">Logo URL</Label>
        <Input
          id="profile-logo"
          type="url"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://example.com/logo.png"
        />
        {logoUrl.trim() && (
          <img
            src={logoUrl.trim()}
            alt="Logo preview"
            className="mt-1 max-h-12 max-w-[110px] object-contain rounded border border-border"
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Role</span>
        <Badge variant="secondary" className="w-fit">
          {user?.role}
        </Badge>
      </div>

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
