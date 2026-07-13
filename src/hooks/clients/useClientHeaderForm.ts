import { useState } from "react";
import { useTags } from "@/hooks/tags/useTags";
import { isValidHttpUrl, isValidOptionalEmail } from "@/lib/schemas";
import type {
  Client,
  ClientHeaderProps,
  ClientHeaderFormState,
} from "@/types/clients.types";

type TouchedField = "website" | "email";

function formFromClient(client: Client): ClientHeaderFormState {
  return {
    clientType: client.clientType,
    name: client.name,
    legalName: client.legalName ?? "",
    firstName: client.firstName ?? "",
    lastName: client.lastName ?? "",
    email: client.email ?? "",
    phone: client.phone ?? "",
    address: client.address ?? "",
    addressLine2: client.addressLine2 ?? "",
    city: client.city ?? "",
    country: client.country ?? "",
    state: client.state ?? "",
    postalCode: client.postalCode ?? "",
    vatNumber: client.vatNumber ?? "",
    legalForm: client.legalForm ?? "",
    color: client.color ?? "",
    notes: client.notes ?? "",
    paymentDelayDays: client.paymentDelayDays?.toString() ?? "",
    taxRate: client.taxRate?.toString() ?? "",
    billingEndOfMonth: client.billingEndOfMonth,
    website: client.website ?? "",
    industry: client.industry ?? null,
    status: client.status,
    contactedAt: client.contactedAt ? client.contactedAt.slice(0, 10) : "",
    tagIds: client.tags.map((t) => t.id),
  };
}

export function useClientHeaderForm(
  client: Client,
  onUpdate: ClientHeaderProps["onUpdate"],
) {
  const [editing, setEditing] = useState(false);
  const { tags } = useTags();
  const [form, setForm] = useState<ClientHeaderFormState>(() =>
    formFromClient(client),
  );
  const [touched, setTouched] = useState<
    Partial<Record<TouchedField, boolean>>
  >({});

  function resetForm() {
    setForm(formFromClient(client));
    setTouched({});
  }

  function set(field: keyof ClientHeaderFormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function touch(field: TouchedField) {
    return () => setTouched((prev) => ({ ...prev, [field]: true }));
  }

  const errors = {
    website:
      touched.website && !isValidHttpUrl(form.website)
        ? "Enter a valid URL."
        : "",
    email:
      touched.email && !isValidOptionalEmail(form.email)
        ? "Enter a valid email address."
        : "",
  };

  function handleAddressChange(
    field:
      | "address"
      | "addressLine2"
      | "city"
      | "country"
      | "state"
      | "postalCode",
    value: string,
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleBillingChange(
    field: "paymentDelayDays" | "taxRate" | "billingEndOfMonth",
    value: string | boolean,
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValidHttpUrl(form.website) || !isValidOptionalEmail(form.email)) {
      setTouched({ website: true, email: true });
      return;
    }
    const isCompany = form.clientType === "COMPANY";
    await onUpdate({
      id: client.id,
      clientType: form.clientType,
      name: form.name || undefined,
      ...(isCompany
        ? {
            legalName: form.legalName || undefined,
            vatNumber: form.vatNumber || undefined,
            legalForm: form.legalForm || undefined,
            firstName: undefined,
            lastName: undefined,
          }
        : {
            firstName: form.firstName || undefined,
            lastName: form.lastName || undefined,
            legalName: undefined,
            vatNumber: undefined,
            legalForm: undefined,
          }),
      email: form.email || undefined,
      phone: form.phone || undefined,
      address: form.address || undefined,
      addressLine2: form.addressLine2 || undefined,
      city: form.city || undefined,
      country: form.country || undefined,
      state: form.state || undefined,
      postalCode: form.postalCode || undefined,
      color: form.color || undefined,
      notes: form.notes || undefined,
      paymentDelayDays: form.paymentDelayDays
        ? Number(form.paymentDelayDays)
        : undefined,
      taxRate: form.taxRate ? Number(form.taxRate) : undefined,
      billingEndOfMonth: form.billingEndOfMonth,
      website: form.website || undefined,
      industry: form.industry || undefined,
      status: form.status,
      contactedAt: form.contactedAt ? `${form.contactedAt}T00:00:00` : null,
      tagIds: form.tagIds,
    });
    setEditing(false);
  }

  return {
    editing,
    setEditing,
    tags,
    form,
    setForm,
    resetForm,
    set,
    touch,
    errors,
    handleAddressChange,
    handleBillingChange,
    handleSave,
    isCompany: form.clientType === "COMPANY",
  };
}
