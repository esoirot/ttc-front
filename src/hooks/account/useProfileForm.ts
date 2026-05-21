import { useState } from "react";
import { useCurrentUser, useUpdateMe } from "@/hooks/auth/useAuth";

export function useProfileForm() {
  const { user } = useCurrentUser();
  const { updateMe, loading: saving, error: saveError } = useUpdateMe();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [logoUrl, setLogoUrl] = useState(user?.logoUrl ?? "");
  const [saved, setSaved] = useState(false);

  async function handleSaveProfile(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    await updateMe({
      name: name.trim() || undefined,
      email: email.trim(),
      logoUrl: logoUrl.trim() || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return {
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
  };
}
