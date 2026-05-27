import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiDelete, apiGet, apiPatch, apiPost } from "../../lib/api";
import type {
  HubspotStatus,
  HubspotContact,
  HubspotCompany,
  HubspotDeal,
  HubspotListResponse,
  CreateContactInput,
  UpdateContactInput,
  CreateDealInput,
  UpdateDealInput,
  CreateCompanyInput,
  UpdateCompanyInput,
  AuditPage,
  HubspotConnection,
  ImportedClient,
} from "@/types/hubspot.types";

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

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCompanyInput) =>
      apiPost<HubspotCompany>("/hubspot/companies", input),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: ["hubspot", "companies"] }),
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateCompanyInput & { id: string }) =>
      apiPatch<HubspotCompany>(`/hubspot/companies/${id}`, input),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: ["hubspot", "companies"] }),
  });
}

export function useAuditLog(userId?: number, limit = 50) {
  return useInfiniteQuery<AuditPage>({
    queryKey: ["admin", "audit", userId],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams();
      if (userId !== undefined) params.set("userId", String(userId));
      params.set("limit", String(limit));
      if (typeof pageParam === "number")
        params.set("cursor", String(pageParam));
      return apiGet<AuditPage>(`/admin/audit?${params.toString()}`);
    },
    initialPageParam: undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    retry: false,
  });
}

export function useHubspotAdminConnections() {
  return useQuery<HubspotConnection[]>({
    queryKey: ["admin", "hubspot", "connections"],
    queryFn: () => apiGet<HubspotConnection[]>("/hubspot/admin/connections"),
    retry: false,
  });
}

export function useForceDisconnectHubspot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      apiDelete(`/hubspot/admin/connections/${userId}`),
    onSuccess: () =>
      void qc.invalidateQueries({
        queryKey: ["admin", "hubspot", "connections"],
      }),
  });
}

export function useImportHubspotContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contactId: string) =>
      apiPost<ImportedClient>(`/hubspot/contacts/${contactId}/import-client`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useSearchHubspotCompanies(query: string) {
  return useQuery<HubspotListResponse<HubspotCompany>>({
    queryKey: ["hubspot", "companies", "search", query],
    queryFn: () =>
      apiPost<HubspotListResponse<HubspotCompany>>(
        "/hubspot/companies/search",
        {
          filterGroups: [
            {
              filters: [
                {
                  propertyName: "name",
                  operator: "CONTAINS_TOKEN",
                  value: query,
                },
              ],
            },
          ],
        },
      ),
    enabled: query.trim().length > 0,
    retry: false,
  });
}

export function useSearchHubspotDeals(query: string) {
  return useQuery<HubspotListResponse<HubspotDeal>>({
    queryKey: ["hubspot", "deals", "search", query],
    queryFn: () =>
      apiPost<HubspotListResponse<HubspotDeal>>("/hubspot/deals/search", {
        filterGroups: [
          {
            filters: [
              {
                propertyName: "dealname",
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
