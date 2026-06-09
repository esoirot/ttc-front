import { useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = (import.meta.env.VITE_API_URL as string).replace(
  "/graphql",
  "",
);

export function useCreateAttachment(taskId: number) {
  const queryClient = useQueryClient();

  const { mutateAsync: uploadFile, isPending: uploadPending } = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_BASE}/tasks/${taskId}/attachments/file`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json() as Promise<unknown>;
    },
    onSuccess: () => {
      void queryClient.refetchQueries({ queryKey: ["task", taskId] });
    },
  });

  const { mutateAsync: createUrl, isPending: urlPending } = useMutation({
    mutationFn: async (input: { url: string; displayText?: string }) => {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/attachments/url`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to add link");
      return res.json() as Promise<unknown>;
    },
    onSuccess: () => {
      void queryClient.refetchQueries({ queryKey: ["task", taskId] });
    },
  });

  return {
    uploadFile: (file: File) => uploadFile(file),
    createUrl: (url: string, displayText?: string) =>
      createUrl({ url, displayText }),
    loading: uploadPending || urlPending,
  };
}

export function useDeleteAttachment(taskId: number) {
  const queryClient = useQueryClient();

  const { mutateAsync } = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/attachments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      void queryClient.refetchQueries({ queryKey: ["task", taskId] });
    },
  });

  return { deleteAttachment: (id: number) => mutateAsync(id) };
}
