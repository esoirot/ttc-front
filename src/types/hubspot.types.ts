export type HubspotStatus = {
  connected: boolean;
  portalId: string | null;
};

export type HubspotContactProperties = {
  email?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  company?: string;
  createdate?: string;
  lastmodifieddate?: string;
};

export type HubspotContact = {
  id: string;
  properties: HubspotContactProperties;
  createdAt: string;
  updatedAt: string;
};

export type HubspotCompanyProperties = {
  name?: string;
  domain?: string;
  phone?: string;
  city?: string;
  country?: string;
};

export type HubspotCompany = {
  id: string;
  properties: HubspotCompanyProperties;
  createdAt: string;
  updatedAt: string;
};

export type HubspotDealProperties = {
  dealname?: string;
  amount?: string;
  dealstage?: string;
  pipeline?: string;
  closedate?: string;
};

export type HubspotDeal = {
  id: string;
  properties: HubspotDealProperties;
  createdAt: string;
  updatedAt: string;
};

export type HubspotListResponse<T> = {
  results: T[];
  paging?: { next?: { after: string } };
};

export type CreateContactInput = {
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  company?: string;
};

export type UpdateContactInput = Partial<CreateContactInput>;

export type CreateDealInput = {
  dealname: string;
  amount?: string;
  dealstage?: string;
  pipeline?: string;
  closedate?: string;
};

export type UpdateDealInput = Partial<CreateDealInput>;

export type CreateCompanyInput = {
  name: string;
  domain?: string;
  phone?: string;
  city?: string;
  country?: string;
};

export type UpdateCompanyInput = Partial<CreateCompanyInput>;

export type AuditLogEntry = {
  id: number;
  userId: number;
  action: string;
  resource: string;
  payload: unknown;
  createdAt: string;
  user: { email: string };
};

export type AuditPage = {
  items: AuditLogEntry[];
  nextCursor: number | null;
};

export type HubspotConnection = {
  userId: number;
  email: string;
  connected: boolean;
  portalId: string | null;
  expiresAt: string | null;
};

export type ImportedClient = {
  id: number;
  name: string;
  email: string | null;
  company: string | null;
};
