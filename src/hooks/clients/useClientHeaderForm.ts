import { useState } from "react";
import { useTags } from "@/hooks/tags/useTags";
import { useMyOccupations } from "@/hooks/occupations/useOccupations";
import { isValidHttpUrl, isValidOptionalEmail } from "@/lib/schemas";
import { NEXT_STATUS_AFTER_CONTACT } from "@/constants/clients";
import type {
  Client,
  ClientHeaderProps,
  ClientHeaderFormState,
  ClientStatus,
} from "@/types/clients.types";

type TouchedField = "website" | "linkedinUrl" | "email";

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
    linkedinUrl: client.linkedinUrl ?? "",
    industry: client.industry ?? null,
    status: client.status,
    contactedAt: client.contactedAt ? client.contactedAt.slice(0, 10) : "",
    toRecontactAt: client.toRecontactAt
      ? client.toRecontactAt.slice(0, 10)
      : "",
    tagIds: client.tags.map((t) => t.id),
    occupationIds: (client.occupations ?? []).map((a) => a.id),
  };
}

export function useClientHeaderForm(
  client: Client,
  onUpdate: ClientHeaderProps["onUpdate"],
) {
  const [editing, setEditing] = useState(false);
  const { tags } = useTags();
  const { occupations } = useMyOccupations();
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

  /** The saved status, stepped when the typed contact date is newer. */
  function statusForContactDate(date: string): ClientStatus {
    const newer =
      !!date &&
      (!client.contactedAt || new Date(date) > new Date(client.contactedAt));
    return (newer && NEXT_STATUS_AFTER_CONTACT[client.status]) || client.status;
  }

  function set(field: keyof ClientHeaderFormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm((prev) => ({
        ...prev,
        [field]: value,
        ...(field === "contactedAt" && {
          status: statusForContactDate(value),
        }),
      }));
    };
  }

  function touch(field: TouchedField) {
    return () => setTouched((prev) => ({ ...prev, [field]: true }));
  }

  const errors = {
    website:
      touched.website && !isValidHttpUrl(form.website)
        ? "Enter a valid URL."
        : "",
    linkedinUrl:
      touched.linkedinUrl && !isValidHttpUrl(form.linkedinUrl)
        ? "Enter a valid URL."
        : "",
    email:
      touched.email && !isValidOptionalEmail(form.email)
        ? "Enter a valid email address."
        : "",
  };

  function handleAddressChange(
    field:
      "address" | "addressLine2" | "city" | "country" | "state" | "postalCode",
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
    if (
      !isValidHttpUrl(form.website) ||
      !isValidHttpUrl(form.linkedinUrl) ||
      !isValidOptionalEmail(form.email)
    ) {
      setTouched({ website: true, linkedinUrl: true, email: true });
      return;
    }
    const isCompany = form.clientType === "COMPANY";
    await onUpdate({
      id: client.id,
      clientType: form.clientType,
      name: form.name || undefined,
      ...(isCompany
        ? {
            legalName: form.legalName || null,
            vatNumber: form.vatNumber || null,
            legalForm: form.legalForm || null,
            firstName: null,
            lastName: null,
          }
        : {
            firstName: form.firstName || null,
            lastName: form.lastName || null,
            legalName: null,
            vatNumber: null,
            legalForm: null,
          }),
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      addressLine2: form.addressLine2 || null,
      city: form.city || null,
      country: form.country || null,
      state: form.state || null,
      postalCode: form.postalCode || null,
      color: form.color || null,
      notes: form.notes || null,
      paymentDelayDays: form.paymentDelayDays
        ? Number(form.paymentDelayDays)
        : null,
      taxRate: form.taxRate ? Number(form.taxRate) : null,
      billingEndOfMonth: form.billingEndOfMonth,
      website: form.website || null,
      linkedinUrl: form.linkedinUrl || null,
      industry: form.industry || null,
      status: form.status,
      contactedAt: form.contactedAt || null,
      toRecontactAt: form.toRecontactAt || null,
      tagIds: form.tagIds,
      occupationIds: form.occupationIds,
    });
    setEditing(false);
  }

  return {
    editing,
    setEditing,
    tags,
    occupations,
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
