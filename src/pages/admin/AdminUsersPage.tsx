import { useState } from "react";
import {
  useUsers,
  useUpdateUser,
  useDeleteUser,
  type User,
  type UserRole,
} from "@/hooks/account/useUsers";
import { useCurrentUser, useAdminDisableTwoFactor } from "@/hooks/auth/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminPermission } from "../../graphql/admin.operations";
import { ResourceAuditHistory } from "../../components/admin/ResourceAuditHistory";

const ALL_PERMISSIONS: AdminPermission[] = [
  "MANAGE_USERS",
  "MANAGE_CLIENTS",
  "MANAGE_PROJECTS",
  "MANAGE_INVOICES",
  "MANAGE_TIME",
  "MANAGE_RATES",
];

function PermissionsEditor({
  value,
  onChange,
}: {
  value: AdminPermission[];
  onChange: (v: AdminPermission[]) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {ALL_PERMISSIONS.map((p) => (
        <label
          key={p}
          className="flex items-center gap-2 text-sm cursor-pointer"
        >
          <Checkbox
            checked={value.includes(p)}
            onCheckedChange={(checked) =>
              onChange(checked ? [...value, p] : value.filter((x) => x !== p))
            }
          />
          <span className="font-mono text-xs">{p}</span>
        </label>
      ))}
    </div>
  );
}

interface EditForm {
  id: number;
  role: UserRole;
  adminPermissions: AdminPermission[];
}

export function AdminUsersPage() {
  const { users, loading } = useUsers();
  const { updateUser, loading: updating } = useUpdateUser();
  const { deleteUser, loading: deleting } = useDeleteUser();
  const { adminDisableTwoFactor, loading: disabling2fa } =
    useAdminDisableTwoFactor();
  const { user: me } = useCurrentUser();

  const [editUser, setEditUser] = useState<EditForm | null>(null);
  const [historyUser, setHistoryUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const filtered = users.filter(
    (u) =>
      !search ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(
      selected.size === filtered.length
        ? new Set()
        : new Set(filtered.map((u) => u.id)),
    );
  }

  function handleSaveEdit() {
    if (!editUser) return;
    void updateUser({
      id: editUser.id,
      role: editUser.role,
      adminPermissions: editUser.adminPermissions,
    });
    setEditUser(null);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold flex-1">Users</h1>
        <span className="text-sm text-muted-foreground">
          {users.length} total
        </span>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="Search email or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs h-8 text-sm"
        />
      </div>

      {/* Bulk action bar */}
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
                  Delete {selected.size} users?
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
                    selected.forEach((id) => {
                      if (id !== me?.id) void deleteUser(id);
                    });
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

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
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
                      filtered.length > 0 && selected.size === filtered.length
                    }
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>2FA</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Created</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground py-8"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((u: User) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(u.id)}
                      onCheckedChange={() => toggleSelect(u.id)}
                      disabled={u.id === me?.id}
                    />
                  </TableCell>
                  <TableCell className="text-sm">{u.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      onValueChange={(val) =>
                        void updateUser({ id: u.id, role: val as UserRole })
                      }
                      disabled={updating}
                    >
                      <SelectTrigger size="sm" className="w-fit">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">USER</SelectItem>
                        <SelectItem value="MANAGER">MANAGER</SelectItem>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={u.twoFactorEnabled ? "default" : "secondary"}
                    >
                      {u.twoFactorEnabled ? "On" : "Off"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground font-mono">
                      {u.adminPermissions?.length
                        ? `${u.adminPermissions.length} perms`
                        : "All"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {u.createdAt.slice(0, 10)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() =>
                          setEditUser({
                            id: u.id,
                            role: u.role,
                            adminPermissions: u.adminPermissions ?? [],
                          })
                        }
                        aria-label="Edit user"
                      >
                        ✎
                      </Button>
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => setHistoryUser(u)}
                        aria-label="View history"
                      >
                        🕐
                      </Button>
                      {u.twoFactorEnabled && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive h-6 px-2 text-xs"
                              disabled={u.id === me?.id || disabling2fa}
                            >
                              2FA
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Disable 2FA?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Remove 2FA from <strong>{u.email}</strong>. Use
                                only for locked-out users.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => void adminDisableTwoFactor(u.id)}
                              >
                                Disable 2FA
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            disabled={u.id === me?.id || deleting}
                            aria-label="Delete user"
                          >
                            ✕
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete user?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete <strong>{u.email}</strong>? This cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => void deleteUser(u.id)}
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

      {/* Edit permissions dialog */}
      <Dialog open={!!editUser} onOpenChange={(v) => !v && setEditUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="flex flex-col gap-4">
              <div>
                <Label className="mb-1 block">Role</Label>
                <Select
                  value={editUser.role}
                  onValueChange={(v) =>
                    setEditUser({ ...editUser, role: v as UserRole })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">USER</SelectItem>
                    <SelectItem value="MANAGER">MANAGER</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">Admin Permissions</Label>
                <PermissionsEditor
                  value={editUser.adminPermissions}
                  onChange={(v) =>
                    setEditUser({ ...editUser, adminPermissions: v })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Empty = full access (superadmin).
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditUser(null)}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit} disabled={updating}>
                  Save
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* History dialog */}
      {historyUser && (
        <ResourceAuditHistory
          open={!!historyUser}
          onClose={() => setHistoryUser(null)}
          resourceName={historyUser.email}
        />
      )}
    </div>
  );
}
