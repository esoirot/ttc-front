import { useState } from "react";
import {
  useAdminClients,
  useAdminCrudClients,
} from "@/hooks/admin/useAdminClients";
import { useBulkSelection } from "@/hooks/admin/useBulkSelection";
import type { AdminClient } from "@/types/admin.types";
import { isValidOptionalEmail } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ClientForm } from "./ClientForm";
import { ADMIN_EMPTY_CLIENT_FORM } from "@/constants/admin";
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

export function AdminClientsTable() {
  const [search, setSearch] = useState("");
  const { clients, loading, hasMore, loadMore, total } = useAdminClients(
    search || undefined,
  );
  const { createClient, updateClient, deleteClient } = useAdminCrudClients();

  const { selected, toggle, toggleAll, clear, isAllSelected } =
    useBulkSelection(clients.map((c) => c.id));
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminClient | null>(null);
  const [historyTarget, setHistoryTarget] = useState<AdminClient | null>(null);
  const [form, setForm] = useState(ADMIN_EMPTY_CLIENT_FORM);
  const emailValid = isValidOptionalEmail(form.email);

  function openCreate() {
    setForm(ADMIN_EMPTY_CLIENT_FORM);
    setCreateOpen(true);
  }

  function openEdit(c: AdminClient) {
    setForm({
      name: c.name,
      email: c.email ?? "",
      phone: c.phone ?? "",
      city: c.city ?? "",
      country: c.country ?? "",
      legalName: c.legalName ?? "",
      address: c.address ?? "",
      postalCode: c.postalCode ?? "",
      vatNumber: c.vatNumber ?? "",
    });
    setEditTarget(c);
  }

  function handleCreate() {
    if (!emailValid) return;
    void createClient({
      userId: 0,
      ...form,
      email: form.email || undefined,
      phone: form.phone || undefined,
    });
    setCreateOpen(false);
  }

  function handleUpdate() {
    if (!editTarget || !emailValid) return;
    void updateClient({ id: editTarget.id, ...form });
    setEditTarget(null);
  }

  const csvRows = clients.map((c) => ({
    id: c.id,
    owner: c.owner.email,
    name: c.name,
    email: c.email ?? "",
    phone: c.phone ?? "",
    city: c.city ?? "",
    country: c.country ?? "",
    created: c.createdAt.slice(0, 10),
  }));

  return (
    <>
      <AdminPageHeader title="Clients" total={total} />

      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs h-8 text-sm"
        />
        <div className="ml-auto flex gap-2">
          <ExportCsvButton rows={csvRows} filename="clients.csv" />
          <Button size="sm" onClick={openCreate}>
            + New Client
          </Button>
        </div>
      </div>

      <BulkDeleteBar
        selectedIds={selected}
        itemLabel="clients"
        onDelete={deleteClient}
        onDone={clear}
      />

      {loading && clients.length === 0 ? (
        <TableLoadingSkeleton rows={4} />
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">
                  <Checkbox
                    checked={clients.length > 0 && isAllSelected}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Created</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 && (
                <TableEmptyRow colSpan={9}>No clients found.</TableEmptyRow>
              )}
              {clients.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(c.id)}
                      onCheckedChange={() => toggle(c.id)}
                    />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {c.id}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {c.name}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.owner.email}
                  </TableCell>
                  <TableCell className="text-sm">{c.email ?? "—"}</TableCell>
                  <TableCell className="text-sm">{c.city ?? "—"}</TableCell>
                  <TableCell className="text-sm">{c.country ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.createdAt.slice(0, 10)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => openEdit(c)}
                        aria-label="Edit"
                      >
                        ✎
                      </Button>
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => setHistoryTarget(c)}
                        aria-label="History"
                      >
                        🕐
                      </Button>
                      <RowDeleteButton
                        onDelete={() => deleteClient(c.id)}
                        title="Delete client?"
                        description={
                          <>
                            Delete <strong>{c.name}</strong>? This cannot be
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
            <DialogTitle>New Client</DialogTitle>
          </DialogHeader>
          <ClientForm form={form} onChange={(f) => setForm(f as typeof form)} />
          {!emailValid && (
            <p className="text-xs text-destructive">
              Enter a valid email address.
            </p>
          )}
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
              onClick={handleCreate}
              disabled={!form.name || !emailValid}
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
            <DialogTitle>Edit Client — {editTarget?.name}</DialogTitle>
          </DialogHeader>
          <ClientForm form={form} onChange={(f) => setForm(f as typeof form)} />
          {!emailValid && (
            <p className="text-xs text-destructive">
              Enter a valid email address.
            </p>
          )}
          <div className="flex gap-2 justify-end mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditTarget(null)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleUpdate} disabled={!emailValid}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {historyTarget && (
        <ResourceAuditHistory
          open={!!historyTarget}
          onClose={() => setHistoryTarget(null)}
          resourceName={historyTarget.name}
        />
      )}
    </>
  );
}
