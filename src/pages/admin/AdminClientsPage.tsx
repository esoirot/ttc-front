import { useState } from "react";
import {
  useAdminClients,
  useAdminCrudClients,
} from "../../hooks/admin/useAdminData";
import type { AdminClient } from "../../graphql/admin.operations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
import { ResourceAuditHistory } from "../../components/admin/ResourceAuditHistory";

function exportCsv<T extends Record<string, unknown>>(
  rows: T[],
  filename: string,
) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const lines = rows.map((r) =>
    headers.map((h) => JSON.stringify(r[h] ?? "")).join(","),
  );
  const blob = new Blob([[headers.join(","), ...lines].join("\n")], {
    type: "text/csv",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  city: "",
  country: "",
  legalName: "",
  address: "",
  postalCode: "",
  vatNumber: "",
};

export function AdminClientsPage() {
  const [search, setSearch] = useState("");
  const { clients, loading, hasMore, loadMore, total } = useAdminClients(
    search || undefined,
  );
  const { createClient, updateClient, deleteClient } = useAdminCrudClients();

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminClient | null>(null);
  const [historyTarget, setHistoryTarget] = useState<AdminClient | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function openCreate() {
    setForm(EMPTY_FORM);
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
    void createClient({
      userId: 0,
      ...form,
      email: form.email || undefined,
      phone: form.phone || undefined,
    });
    setCreateOpen(false);
  }

  function handleUpdate() {
    if (!editTarget) return;
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
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold flex-1">Clients</h1>
        <span className="text-sm text-muted-foreground">{total} total</span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs h-8 text-sm"
        />
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCsv(csvRows, "clients.csv")}
          >
            Export CSV
          </Button>
          <Button size="sm" onClick={openCreate}>
            + New Client
          </Button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-muted rounded text-sm">
          <span className="text-muted-foreground">
            {selected.size} selected
          </span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive" className="ml-auto h-7">
                Delete selected ({selected.size})
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete {selected.size} clients?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    selected.forEach((id) => void deleteClient(id));
                    setSelected(new Set());
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {loading && clients.length === 0 ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">
                  <Checkbox
                    checked={
                      clients.length > 0 && selected.size === clients.length
                    }
                    onCheckedChange={() =>
                      setSelected(
                        selected.size === clients.length
                          ? new Set()
                          : new Set(clients.map((c) => c.id)),
                      )
                    }
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
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-muted-foreground py-8"
                  >
                    No clients found.
                  </TableCell>
                </TableRow>
              )}
              {clients.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(c.id)}
                      onCheckedChange={() => toggleSelect(c.id)}
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
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            aria-label="Delete"
                          >
                            ✕
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete client?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete <strong>{c.name}</strong>? This cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => void deleteClient(c.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {hasMore && (
        <Button variant="outline" className="mt-4 w-full" onClick={loadMore}>
          Load more
        </Button>
      )}

      {/* Create dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(v) => !v && setCreateOpen(false)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Client</DialogTitle>
          </DialogHeader>
          <ClientForm form={form} onChange={setForm} />
          <div className="flex gap-2 justify-end mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={!form.name}>
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(v) => !v && setEditTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Client — {editTarget?.name}</DialogTitle>
          </DialogHeader>
          <ClientForm form={form} onChange={setForm} />
          <div className="flex gap-2 justify-end mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditTarget(null)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleUpdate}>
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
    </div>
  );
}

function ClientForm({
  form,
  onChange,
}: {
  form: Record<string, string>;
  onChange: (f: Record<string, string>) => void;
}) {
  const f = (k: string) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...form, [k]: e.target.value }),
  });
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2">
        <Label>Name *</Label>
        <Input className="mt-1" placeholder="Acme Corp" {...f("name")} />
      </div>
      <div>
        <Label>Email</Label>
        <Input className="mt-1" type="email" {...f("email")} />
      </div>
      <div>
        <Label>Phone</Label>
        <Input className="mt-1" {...f("phone")} />
      </div>
      <div>
        <Label>Legal name</Label>
        <Input className="mt-1" {...f("legalName")} />
      </div>
      <div>
        <Label>VAT number</Label>
        <Input className="mt-1" {...f("vatNumber")} />
      </div>
      <div>
        <Label>Address</Label>
        <Input className="mt-1" {...f("address")} />
      </div>
      <div>
        <Label>City</Label>
        <Input className="mt-1" {...f("city")} />
      </div>
      <div>
        <Label>Country</Label>
        <Input className="mt-1" {...f("country")} />
      </div>
      <div>
        <Label>Postal code</Label>
        <Input className="mt-1" {...f("postalCode")} />
      </div>
    </div>
  );
}
