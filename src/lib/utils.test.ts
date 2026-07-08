import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";
import { cn, downloadBlob } from "./utils";

describe("cn", () => {
  it("joins plain class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });

  it("merges conflicting tailwind classes, keeping the last", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("applies conditional object syntax", () => {
    expect(cn("a", { b: true, c: false })).toBe("a b");
  });
});

describe("downloadBlob", () => {
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

  it("creates an object URL from the blob and clicks an anchor with it", () => {
    const blob = new Blob(["data"], { type: "text/plain" });
    downloadBlob(blob, "out.txt");

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("sets the anchor's download attribute to the given filename", () => {
    let capturedAnchor: HTMLAnchorElement | undefined;
    const realCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = realCreateElement(tag);
      if (tag === "a") capturedAnchor = el as HTMLAnchorElement;
      return el;
    });

    downloadBlob(new Blob(["data"]), "report.pdf");

    expect(capturedAnchor?.download).toBe("report.pdf");
  });

  it("revokes the object URL after clicking", () => {
    downloadBlob(new Blob(["data"]), "out.txt");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });
});
