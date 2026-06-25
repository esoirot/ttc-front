import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";
import { exportCsv } from "./csv";

describe("exportCsv", () => {
  let createObjectURL: Mock<(obj: Blob | MediaSource) => string>;
  let revokeObjectURL: Mock<(url: string) => void>;
  let clickSpy: Mock<() => void>;

  beforeEach(() => {
    createObjectURL = vi.fn<(obj: Blob | MediaSource) => string>(
      () => "blob:mock-url",
    );
    revokeObjectURL = vi.fn<(url: string) => void>();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
    clickSpy = vi.fn<() => void>();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(clickSpy);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does nothing for an empty row set", () => {
    exportCsv([], "empty.csv");
    expect(createObjectURL).not.toHaveBeenCalled();
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it("builds a CSV blob from row headers and triggers a download", () => {
    exportCsv([{ name: "Alice", age: 30 }], "out.csv");

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe("text/csv");
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("serializes null/undefined cell values as empty strings", () => {
    const blobSpy = vi.spyOn(globalThis, "Blob");
    exportCsv([{ name: "Bob", note: null }], "out.csv");
    const [parts] = blobSpy.mock.calls[0] as [string[]];
    expect(parts[0]).toBe('name,note\n"Bob",""');
  });
});
