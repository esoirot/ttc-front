import { useState } from "react";
import { useCreateClient } from "@/hooks/clients/useClients";
import { useTags } from "@/hooks/tags/useTags";
import { isValidHttpUrl, isValidOptionalEmail } from "@/lib/schemas";
import { EMPTY_CLIENT_FORM } from "@/constants/clients";
import type {
  ClientType,
  ClientIndustry,
  ClientStatus,
} from "@/types/clients.types";

type FormState = typeof EMPTY_CLIENT_FORM;

export function useNewClientForm(
  onClose: () => void,
  defaultStatus?: ClientStatus,
) {
  const { createClient, loading } = useCreateClient();
  const { tags } = useTags();
  const [form, setForm] = useState<FormState>(EMPTY_CLIENT_FORM);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  function setField(
    key: keyof FormState,
    value: string | boolean | ClientType | ClientIndustry | null,
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

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
    setField(field, value);
  }

  function handleBillingChange(
    field: "paymentDelayDays" | "taxRate" | "billingEndOfMonth",
    value: string | boolean,
  ) {
    setField(field, value);
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const isCompany = form.clientType === "COMPANY";
    if (isCompany && !form.name.trim()) {
      setError("Company name is required");
      return;
    }
    if (!isCompany && !form.firstName.trim()) {
      setError("First name is required");
      return;
    }
    if (!isValidHttpUrl(form.website)) {
      setError("Enter a valid website URL");
      return;
    }
    if (!isValidOptionalEmail(form.email)) {
      setError("Enter a valid email address");
      return;
    }
    setError(null);

    const name = isCompany
      ? form.name.trim()
      : [form.firstName.trim(), form.lastName.trim()].filter(Boolean).join(" ");

    await createClient({
      clientType: form.clientType,
      name,
      ...(isCompany
        ? {
            legalName: form.legalName || undefined,
            vatNumber: form.vatNumber || undefined,
            legalForm: form.legalForm || undefined,
          }
        : {
            firstName: form.firstName || undefined,
            lastName: form.lastName || undefined,
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
      billingEndOfMonth: form.billingEndOfMonth || undefined,
      website: form.website || undefined,
      industry: form.industry || undefined,
      status: defaultStatus,
      tagIds,
    });
    setForm(EMPTY_CLIENT_FORM);
    setTagIds([]);
    onClose();
  }

  return {
    form,
    setField,
    tagIds,
    setTagIds,
    error,
    loading,
    tags,
    handleAddressChange,
    handleBillingChange,
    handleSubmit,
    isCompany: form.clientType === "COMPANY",
  };
}
