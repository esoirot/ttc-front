import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateProject } from "../../hooks/projects/useProjects";
import type { CreateProjectFormProps } from "@/types/projects.types";

export function CreateProjectForm({
  clients,
  onClose,
}: CreateProjectFormProps) {
  const { createProject, loading: creating } = useCreateProject();
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [srcLang, setSrcLang] = useState("");
  const [tgtLang, setTgtLang] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  async function handleCreate(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Title is required");
      return;
    }
    setFormError(null);
    await createProject({
      title: title.trim(),
      clientId: clientId ? Number(clientId) : undefined,
      sourceLanguage: srcLang || undefined,
      targetLanguage: tgtLang || undefined,
    });
    setTitle("");
    setClientId("");
    setSrcLang("");
    setTgtLang("");
    onClose();
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-5">
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex flex-col gap-1">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Project title"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="cpf-client">Client</Label>
              <Select
                value={clientId || "__none__"}
                onValueChange={(val) =>
                  setClientId(val === "__none__" ? "" : val)
                }
              >
                <SelectTrigger id="cpf-client" className="w-full">
                  <SelectValue placeholder="No client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No client</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="srcLang">Source language</Label>
              <Input
                id="srcLang"
                value={srcLang}
                onChange={(e) => setSrcLang(e.target.value)}
                placeholder="EN"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="tgtLang">Target language</Label>
              <Input
                id="tgtLang"
                value={tgtLang}
                onChange={(e) => setTgtLang(e.target.value)}
                placeholder="FR"
              />
            </div>
          </div>
          {formError && <p className="text-destructive text-sm">{formError}</p>}
          <Button type="submit" disabled={creating} className="self-end">
            {creating ? "Creating…" : "Create project"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
