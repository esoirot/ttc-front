import { useState } from "react";
import { useCurrentUser, useUpdateMe } from "@/hooks/auth/useAuth";

export function useProfileForm() {
  const { user } = useCurrentUser();
  const { updateMe, loading: saving, error: saveError } = useUpdateMe();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [mobilePhone, setMobilePhone] = useState(user?.mobilePhone ?? "");
  const [jobTitle, setJobTitle] = useState(user?.jobTitle ?? "");
  const [logoUrl, setLogoUrl] = useState(user?.logoUrl ?? "");
  const [defaultCurrency, setDefaultCurrency] = useState(
    user?.defaultCurrency ?? "EUR",
  );
  const [interfaceLanguage, setInterfaceLanguage] = useState(
    user?.interfaceLanguage ?? "en",
  );
  const [dateFormat, setDateFormat] = useState(
    user?.dateFormat ?? "DD/MM/YYYY",
  );
  const [hourFormat, setHourFormat] = useState(user?.hourFormat ?? "24h");
  const [numberFormat, setNumberFormat] = useState(
    user?.numberFormat ?? "1,234.56",
  );
  const [saved, setSaved] = useState(false);

  async function handleSaveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const first = firstName.trim() || null;
    const last = lastName.trim() || null;
    await updateMe({
      name: first || last ? [first, last].filter(Boolean).join(" ") : undefined,
      email: email.trim(),
      logoUrl: logoUrl.trim() || undefined,
      defaultCurrency: defaultCurrency || undefined,
      firstName: first,
      lastName: last,
      mobilePhone: mobilePhone.trim() || null,
      jobTitle: jobTitle.trim() || null,
      interfaceLanguage: interfaceLanguage || null,
      dateFormat: dateFormat || null,
      hourFormat: hourFormat || null,
      numberFormat: numberFormat || null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return {
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
    handleSaveProfile,
  };
}
