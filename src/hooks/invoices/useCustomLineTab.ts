import { useState } from "react";
import { useRates } from "../rates/useRates";
import type { CustomLineAddItemInput } from "@/types/invoices.types";

export function useCustomLineTab(
  invoiceId: number,
  onAdd: (input: CustomLineAddItemInput) => Promise<unknown>,
) {
  const { rates } = useRates();
  const [selectedRateId, setSelectedRateId] = useState<string>("");
  const [desc, setDesc] = useState("");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("0");

  const selectedRate = rates.find((r) => String(r.id) === selectedRateId);

  function handleRateSelect(rateId: string) {
    setSelectedRateId(rateId);
    const rate = rates.find((r) => String(r.id) === rateId);
    if (!rate) return;
    setDesc(rate.name);
    setPrice(String(rate.amount));
    if (rate.type === "FIXED") setQty("1");
  }

  async function handleAdd() {
    const q = parseFloat(qty);
    const p = parseFloat(price);
    if (!desc.trim() || isNaN(q) || isNaN(p)) return;
    await onAdd({
      invoiceId,
      description: desc.trim(),
      quantity: q,
      unitPrice: p,
    });
    setDesc("");
    setQty("1");
    setSelectedRateId("");
    // Keep price for rapid multi-line entry
  }

  return {
    rates,
    selectedRate,
    selectedRateId,
    desc,
    qty,
    price,
    setDesc,
    setQty,
    setPrice,
    handleRateSelect,
    handleAdd,
  };
}
