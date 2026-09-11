import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
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
import type { CreateProjectFormProps } from "@/types/projects.types";
import { useCreateProject } from "@/hooks/projects/useProjects";
import { LANGUAGES } from "@/constants/languages";

export function CreateProjectForm({
  clients,
  onClose,
}: CreateProjectFormProps) {
  const intl = useIntl();
  const { createProject, loading: creating } = useCreateProject();
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [srcLang, setSrcLang] = useState("");
  const [tgtLang, setTgtLang] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  async function handleCreate(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) {
      setFormError(
        intl.formatMessage({
          id: "projects.createForm.titleRequired",
          defaultMessage: "Title is required",
        }),
      );
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
              <Label htmlFor="title">
                <FormattedMessage
                  id="admin.projectsTable.fieldTitleRequired"
                  defaultMessage="Title *"
                />
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={intl.formatMessage({
                  id: "projects.createForm.titlePlaceholder",
                  defaultMessage: "Project title",
                })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="cpf-client">
                <FormattedMessage
                  id="projects.createForm.client"
                  defaultMessage="Client"
                />
              </Label>
              <Select
                value={clientId || "__none__"}
                onValueChange={(val) =>
                  setClientId(val === "__none__" ? "" : val)
                }
              >
                <SelectTrigger id="cpf-client" className="w-full">
                  <SelectValue
                    placeholder={intl.formatMessage({
                      id: "projects.header.field.noClient",
                      defaultMessage: "No client",
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">
                    <FormattedMessage
                      id="projects.header.field.noClient"
                      defaultMessage="No client"
                    />
                  </SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="srcLang">
                <FormattedMessage
                  id="projects.createForm.sourceLanguage"
                  defaultMessage="Source language"
                />
              </Label>
              <Select
                value={srcLang || "__none__"}
                onValueChange={(val) =>
                  setSrcLang(val === "__none__" ? "" : val)
                }
              >
                <SelectTrigger id="srcLang" className="w-full">
                  <SelectValue
                    placeholder={intl.formatMessage({
                      id: "projects.header.field.languagePlaceholder",
                      defaultMessage: "Select…",
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">—</SelectItem>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.code} value={l.code}>
                      {l.code} — {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="tgtLang">
                <FormattedMessage
                  id="projects.createForm.targetLanguage"
                  defaultMessage="Target language"
                />
              </Label>
              <Select
                value={tgtLang || "__none__"}
                onValueChange={(val) =>
                  setTgtLang(val === "__none__" ? "" : val)
                }
              >
                <SelectTrigger id="tgtLang" className="w-full">
                  <SelectValue
                    placeholder={intl.formatMessage({
                      id: "projects.header.field.languagePlaceholder",
                      defaultMessage: "Select…",
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">—</SelectItem>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.code} value={l.code}>
                      {l.code} — {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {formError && <p className="text-destructive text-sm">{formError}</p>}
          <Button type="submit" disabled={creating} className="self-end">
            {creating ? (
              <FormattedMessage
                id="projects.createForm.creating"
                defaultMessage="Creating…"
              />
            ) : (
              <FormattedMessage
                id="projects.createForm.submit"
                defaultMessage="Create project"
              />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
