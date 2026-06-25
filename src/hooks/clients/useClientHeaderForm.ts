import { useState } from "react";
import { useTags } from "@/hooks/tags/useTags";
import type {
  Client,
  ClientHeaderProps,
  ClientHeaderFormState,
} from "@/types/clients.types";

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
    city: client.city ?? "",
    country: client.country ?? "",
    postalCode: client.postalCode ?? "",
    vatNumber: client.vatNumber ?? "",
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

  function resetForm() {
    setForm(formFromClient(client));
  }

  function set(field: keyof ClientHeaderFormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleAddressChange(
    field: "address" | "city" | "country" | "postalCode",
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
    const isCompany = form.clientType === "COMPANY";
    await onUpdate({
      id: client.id,
      clientType: form.clientType,
      name: form.name || undefined,
      ...(isCompany
        ? {
            legalName: form.legalName || undefined,
            vatNumber: form.vatNumber || undefined,
            firstName: undefined,
            lastName: undefined,
          }
        : {
            firstName: form.firstName || undefined,
            lastName: form.lastName || undefined,
            legalName: undefined,
            vatNumber: undefined,
          }),
      email: form.email || undefined,
      phone: form.phone || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
      country: form.country || undefined,
      postalCode: form.postalCode || undefined,
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
    handleAddressChange,
    handleBillingChange,
    handleSave,
    isCompany: form.clientType === "COMPANY",
  };
}
