import { useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
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
  const intl = useIntl();
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [displayText, setDisplayText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, createUrl, loading } = useCreateAttachment(taskId);

  const urlError =
    file === null && url.trim() !== "" && !isValidHttpUrl(url.trim())
      ? intl.formatMessage({
          id: "projects.attachmentList.invalidUrl",
          defaultMessage: "Enter a valid URL.",
        })
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
          <FormattedMessage
            id="projects.attachmentModal.title"
            defaultMessage="Add attachment"
          />
        </DialogTitle>

        <div className="flex flex-col gap-4 mt-1">
          {/* File upload */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">
              <FormattedMessage
                id="projects.attachmentModal.file"
                defaultMessage="File"
              />
            </Label>
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
            <span className="text-xs text-muted-foreground">
              <FormattedMessage
                id="projects.attachmentModal.or"
                defaultMessage="or"
              />
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* URL */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">
              <FormattedMessage
                id="projects.attachmentList.url"
                defaultMessage="URL"
              />
            </Label>
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
                <FormattedMessage
                  id="projects.attachmentList.displayText"
                  defaultMessage="Display text"
                />{" "}
                <span className="text-muted-foreground/60">
                  <FormattedMessage
                    id="projects.attachmentModal.optional"
                    defaultMessage="(optional)"
                  />
                </span>
              </Label>
              <Input
                placeholder={intl.formatMessage({
                  id: "projects.attachmentModal.linkLabelPlaceholder",
                  defaultMessage: "Link label…",
                })}
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
              <FormattedMessage
                id="common.actions.cancel"
                defaultMessage="Cancel"
              />
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs"
              disabled={!canAttach}
              onClick={() => void handleAttach()}
            >
              {loading ? (
                <FormattedMessage
                  id="projects.attachmentModal.attaching"
                  defaultMessage="Attaching…"
                />
              ) : (
                <FormattedMessage
                  id="projects.attachmentModal.attach"
                  defaultMessage="Attach"
                />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
