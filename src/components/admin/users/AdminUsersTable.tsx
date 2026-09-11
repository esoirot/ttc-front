import { useState } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import {
  useUsers,
  useUpdateUser,
  useDeleteUser,
} from "@/hooks/account/useUsers";
import { useCurrentUser, useAdminDisableTwoFactor } from "@/hooks/auth/useAuth";
import { useBulkSelection } from "@/hooks/admin/useBulkSelection";
import type {
  User,
  UserRole,
  UserEditForm as EditForm,
} from "@/types/users.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { PermissionsEditor } from "../permissions/PermissionsEditor";
import { ResourceAuditHistory } from "../audits/ResourceAuditHistory";
import { AdminPageHeader } from "../shared/AdminPageHeader";
import { BulkDeleteBar } from "../shared/BulkDeleteBar";
import { RowDeleteButton } from "../shared/RowDeleteButton";
import {
  TableEmptyRow,
  TableLoadingSkeleton,
} from "../shared/AdminTableChrome";

const COMMON = {
  save: { id: "common.actions.save", defaultMessage: "Save" },
  cancel: { id: "common.actions.cancel", defaultMessage: "Cancel" },
};

export function AdminUsersTable() {
  const intl = useIntl();
  const { users, loading } = useUsers();
  const { updateUser, loading: updating } = useUpdateUser();
  const { deleteUser, loading: deleting } = useDeleteUser();
  const { adminDisableTwoFactor, loading: disabling2fa } =
    useAdminDisableTwoFactor();
  const { user: me } = useCurrentUser();

  const [editUser, setEditUser] = useState<EditForm | null>(null);
  const [historyUser, setHistoryUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      !search ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const { selected, toggle, toggleAll, clear, isAllSelected } =
    useBulkSelection(filtered.map((u) => u.id));

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
    <>
      <AdminPageHeader
        title={intl.formatMessage({
          id: "admin.usersTable.title",
          defaultMessage: "Users",
        })}
        total={users.length}
      />

      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder={intl.formatMessage({
            id: "admin.usersTable.searchPlaceholder",
            defaultMessage: "Search email or name...",
          })}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs h-8 text-sm"
        />
      </div>

      <BulkDeleteBar
        selectedIds={selected}
        itemLabel={intl.formatMessage({
          id: "admin.usersTable.bulkItemLabel",
          defaultMessage: "users",
        })}
        onDelete={deleteUser}
        onDone={clear}
        excludeIds={me?.id != null ? new Set([Number(me.id)]) : undefined}
      />

      {loading ? (
        <TableLoadingSkeleton />
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">
                  <Checkbox
                    checked={filtered.length > 0 && isAllSelected}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>
                  <FormattedMessage
                    id="admin.usersTable.column.email"
                    defaultMessage="Email"
                  />
                </TableHead>
                <TableHead>
                  <FormattedMessage
                    id="admin.usersTable.column.name"
                    defaultMessage="Name"
                  />
                </TableHead>
                <TableHead>
                  <FormattedMessage
                    id="admin.usersTable.column.role"
                    defaultMessage="Role"
                  />
                </TableHead>
                <TableHead>
                  <FormattedMessage
                    id="admin.usersTable.column.twoFactor"
                    defaultMessage="2FA"
                  />
                </TableHead>
                <TableHead>
                  <FormattedMessage
                    id="admin.usersTable.column.permissions"
                    defaultMessage="Permissions"
                  />
                </TableHead>
                <TableHead>
                  <FormattedMessage
                    id="admin.usersTable.column.created"
                    defaultMessage="Created"
                  />
                </TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableEmptyRow colSpan={8}>
                  <FormattedMessage
                    id="admin.usersTable.emptyState"
                    defaultMessage="No users found."
                  />
                </TableEmptyRow>
              )}
              {filtered.map((u: User) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(u.id)}
                      onCheckedChange={() => toggle(u.id)}
                      disabled={u.id === Number(me?.id)}
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
                      {u.twoFactorEnabled ? (
                        <FormattedMessage
                          id="admin.usersTable.twoFactorOn"
                          defaultMessage="On"
                        />
                      ) : (
                        <FormattedMessage
                          id="admin.usersTable.twoFactorOff"
                          defaultMessage="Off"
                        />
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground font-mono">
                      {u.adminPermissions?.length ? (
                        <FormattedMessage
                          id="admin.usersTable.permsCount"
                          defaultMessage="{count} perms"
                          values={{ count: u.adminPermissions.length }}
                        />
                      ) : (
                        <FormattedMessage
                          id="admin.usersTable.permsAll"
                          defaultMessage="All"
                        />
                      )}
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
                        aria-label={intl.formatMessage({
                          id: "admin.usersTable.editUserAria",
                          defaultMessage: "Edit user",
                        })}
                      >
                        ✎
                      </Button>
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => setHistoryUser(u)}
                        aria-label={intl.formatMessage({
                          id: "admin.usersTable.viewHistoryAria",
                          defaultMessage: "View history",
                        })}
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
                              disabled={u.id === Number(me?.id) || disabling2fa}
                            >
                              <FormattedMessage
                                id="admin.usersTable.disable2fa"
                                defaultMessage="2FA"
                              />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                <FormattedMessage
                                  id="admin.usersTable.disable2faTitle"
                                  defaultMessage="Disable 2FA?"
                                />
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                <FormattedMessage
                                  id="admin.usersTable.disable2faDescription"
                                  defaultMessage="Remove 2FA from <b>{email}</b>. Use only for locked-out users."
                                  values={{
                                    email: u.email,
                                    b: (chunks: React.ReactNode[]) => (
                                      <strong>{chunks}</strong>
                                    ),
                                  }}
                                />
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                <FormattedMessage {...COMMON.cancel} />
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => void adminDisableTwoFactor(u.id)}
                              >
                                <FormattedMessage
                                  id="admin.usersTable.disable2faConfirm"
                                  defaultMessage="Disable 2FA"
                                />
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      <RowDeleteButton
                        onDelete={() => deleteUser(u.id)}
                        title={intl.formatMessage({
                          id: "admin.usersTable.deleteUserTitle",
                          defaultMessage: "Delete user?",
                        })}
                        description={
                          <FormattedMessage
                            id="admin.usersTable.deleteUserDescription"
                            defaultMessage="Delete <b>{email}</b>? This cannot be undone."
                            values={{
                              email: u.email,
                              b: (chunks: React.ReactNode[]) => (
                                <strong>{chunks}</strong>
                              ),
                            }}
                          />
                        }
                        disabled={u.id === Number(me?.id) || deleting}
                        ariaLabel={intl.formatMessage({
                          id: "admin.usersTable.deleteUserAria",
                          defaultMessage: "Delete user",
                        })}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!editUser} onOpenChange={(v) => !v && setEditUser(null)}>
        <DialogContent className="max-w-sm" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              <FormattedMessage
                id="admin.usersTable.editDialogTitle"
                defaultMessage="Edit User"
              />
            </DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="flex flex-col gap-4">
              <div>
                <Label className="mb-1 block">
                  <FormattedMessage
                    id="admin.usersTable.column.role"
                    defaultMessage="Role"
                  />
                </Label>
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
                <Label className="mb-2 block">
                  <FormattedMessage
                    id="admin.usersTable.adminPermissionsLabel"
                    defaultMessage="Admin Permissions"
                  />
                </Label>
                <PermissionsEditor
                  value={editUser.adminPermissions}
                  onChange={(v) =>
                    setEditUser({ ...editUser, adminPermissions: v })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  <FormattedMessage
                    id="admin.usersTable.permissionsHint"
                    defaultMessage="Empty = full access (superadmin)."
                  />
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditUser(null)}
                >
                  <FormattedMessage {...COMMON.cancel} />
                </Button>
                <Button size="sm" onClick={handleSaveEdit} disabled={updating}>
                  <FormattedMessage {...COMMON.save} />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {historyUser && (
        <ResourceAuditHistory
          open={!!historyUser}
          onClose={() => setHistoryUser(null)}
          resourceName={historyUser.email}
        />
      )}
    </>
  );
}
