import { useState } from "react";
import {
  useAdminProjects,
  useAdminCrudProjects,
} from "@/hooks/admin/useAdminProjects";
import { useBulkSelection } from "@/hooks/admin/useBulkSelection";
import type { AdminProject } from "@/types/admin.types";
import type { ProjectStatus } from "@/types/projects.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ADMIN_PROJECT_STATUS_BADGE,
  PROJECT_STATUSES,
} from "@/constants/admin";
import { ResourceAuditHistory } from "../audits/ResourceAuditHistory";
import { AdminPageHeader } from "../shared/AdminPageHeader";
import { BulkDeleteBar } from "../shared/BulkDeleteBar";
import { RowDeleteButton } from "../shared/RowDeleteButton";
import { ExportCsvButton } from "../shared/ExportCsvButton";
import {
  LoadMoreButton,
  TableEmptyRow,
  TableLoadingSkeleton,
} from "../shared/AdminTableChrome";

export function AdminProjectsTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "ALL">(
    "ALL",
  );
  const { projects, loading, hasMore, loadMore, total } = useAdminProjects(
    statusFilter !== "ALL" ? statusFilter : undefined,
    search || undefined,
  );
  const { createProject, updateProject, deleteProject } =
    useAdminCrudProjects();

  const { selected, toggle, toggleAll, clear, isAllSelected } =
    useBulkSelection(projects.map((p) => p.id));
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminProject | null>(null);
  const [historyTarget, setHistoryTarget] = useState<AdminProject | null>(null);
  const [form, setForm] = useState({
    title: "",
    status: "DRAFT" as ProjectStatus,
    description: "",
    deadline: "",
    wordCount: "",
    unitPrice: "",
  });

  function openCreate() {
    setForm({
      title: "",
      status: "DRAFT",
      description: "",
      deadline: "",
      wordCount: "",
      unitPrice: "",
    });
    setCreateOpen(true);
  }

  function openEdit(p: AdminProject) {
    setForm({
      title: p.title,
      status: p.status,
      description: p.description ?? "",
      deadline: p.deadline ?? "",
      wordCount: p.wordCount?.toString() ?? "",
      unitPrice: p.unitPrice?.toString() ?? "",
    });
    setEditTarget(p);
  }

  function f(k: string) {
    return {
      value: form[k as keyof typeof form],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm({ ...form, [k]: e.target.value }),
    };
  }

  const csvRows = projects.map((p) => ({
    id: p.id,
    owner: p.owner.email,
    title: p.title,
    status: p.status,
    deadline: p.deadline ?? "",
    created: p.createdAt.slice(0, 10),
  }));

  return (
    <>
      <AdminPageHeader title="Projects" total={total} />

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Input
          placeholder="Search title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs h-8 text-sm"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as ProjectStatus | "ALL")}
        >
          <SelectTrigger className="w-36 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {PROJECT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-2">
          <ExportCsvButton rows={csvRows} filename="projects.csv" />
          <Button size="sm" onClick={openCreate}>
            + New Project
          </Button>
        </div>
      </div>

      <BulkDeleteBar
        selectedIds={selected}
        itemLabel="projects"
        onDelete={deleteProject}
        onDone={clear}
      />

      {loading && projects.length === 0 ? (
        <TableLoadingSkeleton rows={4} />
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">
                  <Checkbox
                    checked={projects.length > 0 && isAllSelected}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Words</TableHead>
                <TableHead>Created</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 && (
                <TableEmptyRow colSpan={9}>No projects found.</TableEmptyRow>
              )}
              {projects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(p.id)}
                      onCheckedChange={() => toggle(p.id)}
                    />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {p.id}
                  </TableCell>
                  <TableCell className="text-sm font-medium max-w-[180px] truncate">
                    {p.title}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.owner.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={ADMIN_PROJECT_STATUS_BADGE[p.status]}
                      className="text-xs"
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.deadline?.slice(0, 10) ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.wordCount ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.createdAt.slice(0, 10)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => openEdit(p)}
                        aria-label="Edit"
                      >
                        ✎
                      </Button>
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => setHistoryTarget(p)}
                        aria-label="History"
                      >
                        🕐
                      </Button>
                      <RowDeleteButton
                        onDelete={() => deleteProject(p.id)}
                        title="Delete project?"
                        description={
                          <>
                            Delete <strong>{p.title}</strong>? This cannot be
                            undone.
                          </>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {hasMore && <LoadMoreButton onClick={loadMore} />}

      <Dialog
        open={createOpen}
        onOpenChange={(v) => !v && setCreateOpen(false)}
      >
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Title *</Label>
              <Input className="mt-1" {...f("title")} />
            </div>
            <div className="col-span-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm({ ...form, status: v as ProjectStatus })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Deadline</Label>
              <Input className="mt-1" type="date" {...f("deadline")} />
            </div>
            <div>
              <Label>Word count</Label>
              <Input className="mt-1" type="number" {...f("wordCount")} />
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                void createProject({
                  userId: 0,
                  title: form.title,
                  status: form.status,
                });
                setCreateOpen(false);
              }}
              disabled={!form.title}
            >
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editTarget}
        onOpenChange={(v) => !v && setEditTarget(null)}
      >
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Edit Project — {editTarget?.title}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Title</Label>
              <Input className="mt-1" {...f("title")} />
            </div>
            <div className="col-span-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm({ ...form, status: v as ProjectStatus })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Deadline</Label>
              <Input className="mt-1" type="date" {...f("deadline")} />
            </div>
            <div>
              <Label>Word count</Label>
              <Input className="mt-1" type="number" {...f("wordCount")} />
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditTarget(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (editTarget)
                  void updateProject({
                    id: editTarget.id,
                    title: form.title,
                    status: form.status,
                    deadline: form.deadline || undefined,
                    wordCount: form.wordCount
                      ? Number(form.wordCount)
                      : undefined,
                  });
                setEditTarget(null);
              }}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {historyTarget && (
        <ResourceAuditHistory
          open={!!historyTarget}
          onClose={() => setHistoryTarget(null)}
          resourceName={historyTarget.title}
        />
      )}
    </>
  );
}
