import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useInvoices } from "./useInvoices";
import { useAllClients } from "../clients/useClients";
import type { InvoiceStatus } from "@/types/invoices.types";

export function useInvoicesPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<InvoiceStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const { invoices, loading, hasMore, loadMore, total } = useInvoices(
    tab === "ALL" ? undefined : tab,
    undefined,
    debouncedSearch || undefined,
  );
  const { clients } = useAllClients();
  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c.name]));

  function toggleCreate() {
    setShowCreate((v) => !v);
    setShowGenerate(false);
  }

  function toggleGenerate() {
    setShowGenerate((v) => !v);
    setShowCreate(false);
  }

  return {
    navigate,
    tab,
    setTab,
    search,
    setSearch,
    invoices,
    loading,
    hasMore,
    loadMore,
    total,
    clientMap,
    showCreate,
    setShowCreate,
    showGenerate,
    setShowGenerate,
    toggleCreate,
    toggleGenerate,
  };
}
