import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
  useAddInvoiceItem,
  useUpdateInvoiceItem,
  useRemoveInvoiceItem,
} from "./useInvoices";
import { useCurrentUser } from "../auth/useAuth";
import { apiGet } from "../../lib/api";

export function useInvoiceDetail(invoiceId: number) {
  const navigate = useNavigate();
  const { invoice, loading } = useInvoice(invoiceId);
  const { updateInvoice } = useUpdateInvoice(invoiceId);
  const { deleteInvoice } = useDeleteInvoice();
  const { addItem, loading: adding } = useAddInvoiceItem(invoiceId);
  const { updateItem } = useUpdateInvoiceItem(invoiceId);
  const { removeItem } = useRemoveInvoiceItem(invoiceId);
  const { user } = useCurrentUser();
  const [downloading, setDownloading] = useState(false);

  async function handleDownloadPdf() {
    setDownloading(true);
    try {
      const blob = await apiGet<Blob>(`/invoices/${invoiceId}/pdf`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  function handleDelete() {
    void deleteInvoice(invoiceId).then(() => navigate("/invoices"));
  }

  return {
    invoice,
    loading,
    user,
    updateInvoice,
    addItem,
    adding,
    updateItem,
    removeItem,
    downloading,
    handleDownloadPdf,
    handleDelete,
  };
}
