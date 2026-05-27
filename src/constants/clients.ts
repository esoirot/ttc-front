import type { ClientType, ClientIndustry } from "@/types/clients.types";

export const EMPTY_CLIENT_FORM = {
  clientType: "COMPANY" as ClientType,
  name: "",
  legalName: "",
  vatNumber: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  postalCode: "",
  paymentDelayDays: "",
  taxRate: "",
  billingEndOfMonth: false,
  website: "",
  industry: null as ClientIndustry | null,
};
