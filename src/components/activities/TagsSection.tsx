import { useState } from "react";
import { useTags, useCreateTag, useDeleteTag } from "@/hooks/tags/useTags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function TagsSection() {
  const { tags } = useTags();
  const { createTag } = useCreateTag();
  const { deleteTag } = useDeleteTag();
  const [newTag, setNewTag] = useState("");

  async function handleCreateTag(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = newTag.trim();
    if (!trimmed) return;
    await createTag(trimmed);
    setNewTag("");
  }

  return (
    <div className="flex flex-col gap-3">
      {tags.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tags yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <AlertDialog key={tag.id}>
              <div className="flex items-center gap-0.5 bg-muted rounded-full px-3 py-1">
                <span className="text-xs">{tag.name}</span>
                <AlertDialogTrigger asChild>
                  <button className="ml-1 text-xs text-muted-foreground hover:text-destructive leading-none">
                    ×
                  </button>
                </AlertDialogTrigger>
              </div>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete tag?</AlertDialogTitle>
                  <AlertDialogDescription>
                    "{tag.name}" will be removed from all entries.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => void deleteTag(tag.id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ))}
        </div>
      )}
      <form onSubmit={handleCreateTag} className="flex gap-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="New tag name"
          className="h-8 text-sm"
        />
        <Button
          type="submit"
          size="sm"
          variant="secondary"
          disabled={!newTag.trim()}
        >
          Add
        </Button>
      </form>
    </div>
  );
}
