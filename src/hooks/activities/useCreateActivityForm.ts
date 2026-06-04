import { useState } from "react";
import type {
  ActivityType,
  LanguagePairDraft,
  CustomFieldDraft,
} from "@/types/activities.types";

export function useCreateActivityForm() {
  const [newName, setNewName] = useState("");
  const [activityType, setActivityType] = useState<ActivityType>("CUSTOM");
  const [languagePairs, setLanguagePairs] = useState<LanguagePairDraft[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDraft[]>([]);

  function reset() {
    setNewName("");
    setActivityType("CUSTOM");
    setLanguagePairs([]);
    setCustomFields([]);
  }

  function handleTypeChange(value: string) {
    setActivityType(value as ActivityType);
    setLanguagePairs([]);
    setCustomFields([]);
  }

  function addLanguagePair() {
    setLanguagePairs((prev) => [...prev, { fromLanguage: "", toLanguage: "" }]);
  }

  function updateLanguagePair(
    index: number,
    field: keyof LanguagePairDraft,
    value: string,
  ) {
    setLanguagePairs((prev) =>
      prev.map((pair, i) => (i === index ? { ...pair, [field]: value } : pair)),
    );
  }

  function removeLanguagePair(index: number) {
    setLanguagePairs((prev) => prev.filter((_, i) => i !== index));
  }

  function addCustomField() {
    setCustomFields((prev) => [...prev, { key: "", value: "" }]);
  }

  function updateCustomField(
    index: number,
    field: keyof CustomFieldDraft,
    value: string,
  ) {
    setCustomFields((prev) =>
      prev.map((cf, i) => (i === index ? { ...cf, [field]: value } : cf)),
    );
  }

  function removeCustomField(index: number) {
    setCustomFields((prev) => prev.filter((_, i) => i !== index));
  }

  function isValid(): boolean {
    if (!newName.trim()) return false;
    if (activityType === "TRANSLATOR") {
      if (languagePairs.length === 0) return true;
      return languagePairs.every(
        (p) =>
          p.fromLanguage && p.toLanguage && p.fromLanguage !== p.toLanguage,
      );
    }
    return true;
  }

  return {
    newName,
    setNewName,
    activityType,
    languagePairs,
    customFields,
    reset,
    handleTypeChange,
    addLanguagePair,
    updateLanguagePair,
    removeLanguagePair,
    addCustomField,
    updateCustomField,
    removeCustomField,
    isValid,
  };
}
