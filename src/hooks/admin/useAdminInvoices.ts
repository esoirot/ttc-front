import { useQueryClient } from "@tanstack/react-query";
import type { InvoiceStatus } from "@/types/invoices.types";
import {
  ADMIN_INVOICES_QUERY,
  ADMIN_UPDATE_INVOICE_MUTATION,
  ADMIN_DELETE_INVOICE_MUTATION,
} from "../../graphql/admin.operations";
import type { AdminInvoice } from "@/types/admin.types";
import { useGqlConnectionQuery } from "@/lib/gqlQuery";
import { useGqlMutation } from "@/lib/gqlMutation";
import { patchConnection, removeFromConnection } from "@/lib/cachePatch";

const LIMIT = 20;

export function useAdminInvoices(status?: InvoiceStatus, search?: string) {
  const { items, total, hasMore, loadMore, loading } = useGqlConnectionQuery({
    queryKey: [
      "adminInvoices",
      { status: status ?? null, search: search ?? null },
    ],
    query: ADMIN_INVOICES_QUERY,
    variables: { status, search },
    select: (d) => d.adminInvoices,
    limit: LIMIT,
  });

  return {
    invoices: items,
    loading,
    total,
    hasMore,
    loadMore,
  };
}

export function useAdminCrudInvoices() {
  const queryClient = useQueryClient();

  const { mutateAsync: update } = useGqlMutation({
    mutation: ADMIN_UPDATE_INVOICE_MUTATION,
    unwrap: (d) => d.adminUpdateInvoice,
    onSuccess: (updated) => {
      patchConnection(queryClient, ["adminInvoices"], updated, (inv) => inv.id);
    },
  });

  const { mutateAsync: remove } = useGqlMutation({
    mutation: ADMIN_DELETE_INVOICE_MUTATION,
    unwrap: (d) => d.adminDeleteInvoice,
    onSuccess: (_data, { id }) => {
      removeFromConnection(
        queryClient,
        ["adminInvoices"],
        id,
        (inv: AdminInvoice) => inv.id,
      );
    },
  });

  return {
    updateInvoice: (input: {
      id: number;
      status?: InvoiceStatus;
      notes?: string;
      dueDate?: string;
    }) => update({ input }),
    deleteInvoice: (id: number) => remove({ id }),
  };
}
