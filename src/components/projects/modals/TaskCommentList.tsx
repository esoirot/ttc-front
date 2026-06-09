import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from "@/hooks/tasks/useTasks";
import type { TaskComment } from "@/types/tasks.types";
import { timeAgo } from "@/lib/time";

export function TaskCommentList({
  taskId,
  comments,
  currentUserId,
}: {
  taskId: number;
  comments: TaskComment[];
  currentUserId: number | undefined;
}) {
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBody, setEditBody] = useState("");
  const { createComment, loading: creating } = useCreateComment(taskId);
  const { updateComment } = useUpdateComment(taskId);
  const { deleteComment } = useDeleteComment(taskId);

  async function handleSubmit() {
    const b = body.trim();
    if (!b) return;
    await createComment(b);
    setBody("");
  }

  function startEdit(c: TaskComment) {
    setEditingId(c.id);
    setEditBody(c.body);
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-foreground">Comments</span>
      <div className="flex flex-col gap-2">
        {comments.map((c) => (
          <div key={c.id} className="flex flex-col gap-1 text-sm group">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>User {c.authorId}</span>
              <span>{timeAgo(c.createdAt)}</span>
              {c.authorId === currentUserId && (
                <span className="ml-auto opacity-0 group-hover:opacity-100 flex gap-2">
                  <button
                    onClick={() => startEdit(c)}
                    className="hover:text-foreground transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => void deleteComment(c.id)}
                    className="hover:text-destructive transition-colors"
                  >
                    Delete
                  </button>
                </span>
              )}
            </div>
            {editingId === c.id ? (
              <div className="flex flex-col gap-1">
                <Textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="text-sm min-h-15"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={async () => {
                      await updateComment({ id: c.id, body: editBody.trim() });
                      setEditingId(null);
                    }}
                    disabled={!editBody.trim()}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-foreground whitespace-pre-wrap">{c.body}</p>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <Textarea
          placeholder="Write a comment…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="text-sm min-h-15"
        />
        <Button
          size="sm"
          className="self-end h-7 text-xs"
          onClick={() => void handleSubmit()}
          disabled={creating || !body.trim()}
        >
          Comment
        </Button>
      </div>
    </div>
  );
}
