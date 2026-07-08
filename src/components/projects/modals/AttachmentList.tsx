import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useDeleteAttachment,
  useUpdateAttachment,
} from "@/hooks/tasks/useAttachments";
import { isValidHttpUrl, toSafeHref } from "@/lib/schemas";
import type { TaskAttachment } from "@/types/tasks.types";

const API_BASE = (import.meta.env.VITE_API_URL as string).replace(
  "/graphql",
  "",
);

export function AttachmentList({
  taskId,
  attachments,
  onAdd,
}: {
  taskId: number;
  attachments: TaskAttachment[];
  onAdd: () => void;
}) {
  const { deleteAttachment } = useDeleteAttachment(taskId);
  const { updateAttachment } = useUpdateAttachment(taskId);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editDisplayText, setEditDisplayText] = useState("");

  function startEdit(a: TaskAttachment) {
    setEditingId(a.id);
    setEditUrl(a.url);
    setEditDisplayText(a.displayText ?? "");
  }

  const editUrlError =
    editUrl.trim() !== "" && !isValidHttpUrl(editUrl.trim())
      ? "Enter a valid URL."
      : "";

  async function saveEdit() {
    if (editingId == null || editUrlError) return;
    await updateAttachment(editingId, editUrl, editDisplayText || undefined);
    setEditingId(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          Attachments
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={onAdd}
        >
          + Add
        </Button>
      </div>
      <div className="flex flex-col gap-1">
        {attachments.map((a) => {
          const href =
            a.type === "FILE"
              ? a.url.startsWith("http")
                ? a.url
                : `${API_BASE}${a.url}`
              : toSafeHref(a.url);
          const label =
            a.type === "FILE" ? (a.fileName ?? a.url) : a.displayText || a.url;

          if (editingId === a.id) {
            return (
              <div key={a.id} className="flex flex-col gap-1.5 py-1">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">URL</Label>
                  <Input
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    placeholder="URL"
                    className="h-7 text-xs"
                  />
                  {editUrlError && (
                    <span className="text-xs text-destructive">
                      {editUrlError}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Display text</Label>
                  <Input
                    value={editDisplayText}
                    onChange={(e) => setEditDisplayText(e.target.value)}
                    placeholder="Display text (optional)"
                    className="h-7 text-xs"
                  />
                </div>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => void saveEdit()}
                    disabled={!editUrl.trim() || !!editUrlError}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <div key={a.id} className="flex items-center gap-2 text-xs group">
              <span className="shrink-0">
                {a.type === "FILE" ? "📎" : "🔗"}
              </span>
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-0 truncate text-primary hover:underline"
                >
                  {label}
                </a>
              ) : (
                <span className="flex-1 min-w-0 truncate text-muted-foreground">
                  {label}
                </span>
              )}
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition-opacity">
                {a.type === "URL" && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => startEdit(a)}
                    title="Edit"
                    aria-label="Edit"
                  >
                    ✎
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground hover:text-destructive"
                      title="Delete"
                      aria-label="Delete"
                    >
                      ✕
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete attachment?</AlertDialogTitle>
                      <AlertDialogDescription>
                        &ldquo;{label}&rdquo; will be permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => void deleteAttachment(a.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
