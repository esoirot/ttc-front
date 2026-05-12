import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiDelete, apiGet, apiPatch, apiPost } from "../lib/api";

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

export function useHubspotStatus() {
  return useQuery<HubspotStatus>({
    queryKey: ["hubspot", "status"],
    queryFn: () => apiGet<HubspotStatus>("/hubspot/status"),
    retry: false,
  });
}

export function useDisconnectHubspot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiDelete("/hubspot/disconnect"),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["hubspot"] }),
  });
}

export function useHubspotContacts(after?: string, limit?: number) {
  const params = new URLSearchParams();
  if (after) params.set("after", after);
  if (limit) params.set("limit", String(limit));
  const qs = params.size > 0 ? `?${params.toString()}` : "";
  return useQuery<HubspotListResponse<HubspotContact>>({
    queryKey: ["hubspot", "contacts", after, limit],
    queryFn: () =>
      apiGet<HubspotListResponse<HubspotContact>>(`/hubspot/contacts${qs}`),
    retry: false,
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateContactInput) =>
      apiPost<HubspotContact>("/hubspot/contacts", input),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: ["hubspot", "contacts"] }),
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateContactInput & { id: string }) =>
      apiPatch<HubspotContact>(`/hubspot/contacts/${id}`, input),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: ["hubspot", "contacts"] }),
  });
}

export function useHubspotCompanies(after?: string, limit?: number) {
  const params = new URLSearchParams();
  if (after) params.set("after", after);
  if (limit) params.set("limit", String(limit));
  const qs = params.size > 0 ? `?${params.toString()}` : "";
  return useQuery<HubspotListResponse<HubspotCompany>>({
    queryKey: ["hubspot", "companies", after, limit],
    queryFn: () =>
      apiGet<HubspotListResponse<HubspotCompany>>(`/hubspot/companies${qs}`),
    retry: false,
  });
}

export function useHubspotDeals(after?: string, limit?: number) {
  const params = new URLSearchParams();
  if (after) params.set("after", after);
  if (limit) params.set("limit", String(limit));
  const qs = params.size > 0 ? `?${params.toString()}` : "";
  return useQuery<HubspotListResponse<HubspotDeal>>({
    queryKey: ["hubspot", "deals", after, limit],
    queryFn: () =>
      apiGet<HubspotListResponse<HubspotDeal>>(`/hubspot/deals${qs}`),
    retry: false,
  });
}

export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDealInput) =>
      apiPost<HubspotDeal>("/hubspot/deals", input),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: ["hubspot", "deals"] }),
  });
}

export function useUpdateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateDealInput & { id: string }) =>
      apiPatch<HubspotDeal>(`/hubspot/deals/${id}`, input),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: ["hubspot", "deals"] }),
  });
}

export function useInfiniteHubspotContacts(limit = 20) {
  return useInfiniteQuery({
    queryKey: ["hubspot", "contacts", "infinite"],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) => {
      const params = new URLSearchParams({ limit: String(limit) });
      if (pageParam) params.set("after", pageParam);
      return apiGet<HubspotListResponse<HubspotContact>>(
        `/hubspot/contacts?${params.toString()}`,
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.paging?.next?.after,
    retry: false,
  });
}

export function useInfiniteHubspotCompanies(limit = 20) {
  return useInfiniteQuery({
    queryKey: ["hubspot", "companies", "infinite"],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) => {
      const params = new URLSearchParams({ limit: String(limit) });
      if (pageParam) params.set("after", pageParam);
      return apiGet<HubspotListResponse<HubspotCompany>>(
        `/hubspot/companies?${params.toString()}`,
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.paging?.next?.after,
    retry: false,
  });
}

export function useInfiniteHubspotDeals(limit = 20) {
  return useInfiniteQuery({
    queryKey: ["hubspot", "deals", "infinite"],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) => {
      const params = new URLSearchParams({ limit: String(limit) });
      if (pageParam) params.set("after", pageParam);
      return apiGet<HubspotListResponse<HubspotDeal>>(
        `/hubspot/deals?${params.toString()}`,
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.paging?.next?.after,
    retry: false,
  });
}

export function useSearchHubspotContacts(query: string) {
  return useQuery<HubspotListResponse<HubspotContact>>({
    queryKey: ["hubspot", "contacts", "search", query],
    queryFn: () =>
      apiPost<HubspotListResponse<HubspotContact>>("/hubspot/contacts/search", {
        filterGroups: [
          {
            filters: [
              {
                propertyName: "email",
                operator: "CONTAINS_TOKEN",
                value: query,
              },
            ],
          },
          {
            filters: [
              {
                propertyName: "firstname",
                operator: "CONTAINS_TOKEN",
                value: query,
              },
            ],
          },
          {
            filters: [
              {
                propertyName: "lastname",
                operator: "CONTAINS_TOKEN",
                value: query,
              },
            ],
          },
        ],
      }),
    enabled: query.trim().length > 0,
    retry: false,
  });
}
