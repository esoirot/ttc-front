import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateAttachment } from "@/hooks/tasks/useAttachments";
import { isValidHttpUrl } from "@/lib/schemas";

export function TaskAttachmentModal({
  taskId,
  open,
  onClose,
}: {
  taskId: number;
  open: boolean;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [displayText, setDisplayText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, createUrl, loading } = useCreateAttachment(taskId);

  const urlError =
    file === null && url.trim() !== "" && !isValidHttpUrl(url.trim())
      ? "Enter a valid URL."
      : "";
  const canAttach =
    !loading &&
    (file !== null || (url.trim() !== "" && isValidHttpUrl(url.trim())));

  function reset() {
    setFile(null);
    setUrl("");
    setDisplayText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleAttach() {
    if (!canAttach) return;
    if (file) {
      await uploadFile(file);
    } else {
      await createUrl(url.trim(), displayText.trim() || undefined);
    }
    reset();
    onClose();
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <DialogContent className="max-w-sm w-full" aria-describedby={undefined}>
        <DialogTitle className="text-sm font-medium">
          Add attachment
        </DialogTitle>

        <div className="flex flex-col gap-4 mt-1">
          {/* File upload */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">File</Label>
            <Input
              ref={fileInputRef}
              type="file"
              className="h-8 text-xs cursor-pointer"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                if (e.target.files?.[0]) {
                  setUrl("");
                  setDisplayText("");
                }
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* URL */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">URL</Label>
            <Input
              placeholder="https://…"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (e.target.value) {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }
              }}
              className="h-8 text-xs"
            />
            {urlError && (
              <span className="text-xs text-destructive">{urlError}</span>
            )}
          </div>

          {/* Display text — only shown when URL has content */}
          {url.trim() && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">
                Display text{" "}
                <span className="text-muted-foreground/60">(optional)</span>
              </Label>
              <Input
                placeholder="Link label…"
                value={displayText}
                onChange={(e) => setDisplayText(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs"
              disabled={!canAttach}
              onClick={() => void handleAttach()}
            >
              {loading ? "Attaching…" : "Attach"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
