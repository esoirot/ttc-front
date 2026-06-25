import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCreateActivityForm } from "./useCreateActivityForm";

describe("useCreateActivityForm", () => {
  it("starts empty with CUSTOM type", () => {
    const { result } = renderHook(() => useCreateActivityForm());

    expect(result.current.newName).toBe("");
    expect(result.current.activityType).toBe("CUSTOM");
    expect(result.current.languagePairs).toEqual([]);
    expect(result.current.customFields).toEqual([]);
  });

  it("isValid is false without a name", () => {
    const { result } = renderHook(() => useCreateActivityForm());

    expect(result.current.isValid()).toBe(false);
  });

  it("isValid is true for CUSTOM type once named, even with no language pairs", () => {
    const { result } = renderHook(() => useCreateActivityForm());

    act(() => {
      result.current.setNewName("My activity");
    });

    expect(result.current.isValid()).toBe(true);
  });

  it("handleTypeChange switches type and clears pairs/fields", () => {
    const { result } = renderHook(() => useCreateActivityForm());

    act(() => {
      result.current.addLanguagePair();
      result.current.addCustomField();
    });
    act(() => {
      result.current.handleTypeChange("TRANSLATOR");
    });

    expect(result.current.activityType).toBe("TRANSLATOR");
    expect(result.current.languagePairs).toEqual([]);
    expect(result.current.customFields).toEqual([]);
  });

  it("TRANSLATOR type is valid with zero language pairs", () => {
    const { result } = renderHook(() => useCreateActivityForm());

    act(() => {
      result.current.setNewName("Translator");
      result.current.handleTypeChange("TRANSLATOR");
    });

    expect(result.current.isValid()).toBe(true);
  });

  it("TRANSLATOR type is invalid when a pair has matching from/to languages", () => {
    const { result } = renderHook(() => useCreateActivityForm());

    act(() => {
      result.current.setNewName("Translator");
      result.current.handleTypeChange("TRANSLATOR");
    });
    act(() => {
      result.current.addLanguagePair();
    });
    act(() => {
      result.current.updateLanguagePair(0, "fromLanguage", "EN");
      result.current.updateLanguagePair(0, "toLanguage", "EN");
    });

    expect(result.current.isValid()).toBe(false);
  });

  it("TRANSLATOR type is valid when all pairs have distinct languages", () => {
    const { result } = renderHook(() => useCreateActivityForm());

    act(() => {
      result.current.setNewName("Translator");
      result.current.handleTypeChange("TRANSLATOR");
    });
    act(() => {
      result.current.addLanguagePair();
    });
    act(() => {
      result.current.updateLanguagePair(0, "fromLanguage", "EN");
      result.current.updateLanguagePair(0, "toLanguage", "FR");
    });

    expect(result.current.isValid()).toBe(true);
  });

  it("removeLanguagePair removes by index", () => {
    const { result } = renderHook(() => useCreateActivityForm());

    act(() => {
      result.current.addLanguagePair();
      result.current.addLanguagePair();
    });
    act(() => {
      result.current.updateLanguagePair(0, "fromLanguage", "EN");
      result.current.updateLanguagePair(1, "fromLanguage", "FR");
    });
    act(() => {
      result.current.removeLanguagePair(0);
    });

    expect(result.current.languagePairs).toEqual([
      { fromLanguage: "FR", toLanguage: "" },
    ]);
  });

  it("addCustomField/updateCustomField/removeCustomField manage the list", () => {
    const { result } = renderHook(() => useCreateActivityForm());

    act(() => {
      result.current.addCustomField();
    });
    act(() => {
      result.current.updateCustomField(0, "key", "Rate");
      result.current.updateCustomField(0, "value", "0.10");
    });

    expect(result.current.customFields).toEqual([
      { key: "Rate", value: "0.10" },
    ]);

    act(() => {
      result.current.removeCustomField(0);
    });
    expect(result.current.customFields).toEqual([]);
  });

  it("reset clears all fields back to defaults", () => {
    const { result } = renderHook(() => useCreateActivityForm());

    act(() => {
      result.current.setNewName("Something");
      result.current.handleTypeChange("TRANSLATOR");
      result.current.addLanguagePair();
      result.current.addCustomField();
    });
    act(() => {
      result.current.reset();
    });

    expect(result.current.newName).toBe("");
    expect(result.current.activityType).toBe("CUSTOM");
    expect(result.current.languagePairs).toEqual([]);
    expect(result.current.customFields).toEqual([]);
  });
});
