import {
  useUsers,
  useUpdateUser,
  useDeleteUser,
} from "@/hooks/account/useUsers";
import { useCurrentUser, useAdminDisableTwoFactor } from "@/hooks/auth/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import type { User, UserRole } from "@/types/users.types";

export function UsersTable() {
  const { users, loading } = useUsers();
  const { updateUser, loading: updating } = useUpdateUser();
  const { deleteUser, loading: deleting } = useDeleteUser();
  const { adminDisableTwoFactor, loading: disabling2fa } =
    useAdminDisableTwoFactor();
  const { user: me } = useCurrentUser();

  if (loading)
    return (
      <div className="flex flex-col gap-2 mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    );

  return (
    <table className="w-full mt-4">
      <thead>
        <tr className="border-b border-border">
          <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Email
          </th>
          <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Name
          </th>
          <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Role
          </th>
          <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
            2FA
          </th>
          <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Created
          </th>
          <th className="pb-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide" />
        </tr>
      </thead>
      <tbody>
        {users.length === 0 && (
          <tr>
            <td
              colSpan={6}
              className="py-8 text-center text-sm text-muted-foreground"
            >
              No users
            </td>
          </tr>
        )}
        {users.map((u: User) => (
          <tr key={u.id} className="border-b border-border">
            <td className="py-2.5 pr-4 text-sm">{u.email}</td>
            <td className="py-2.5 pr-4 text-sm text-muted-foreground">
              {u.name ?? "—"}
            </td>
            <td className="py-2.5 pr-4">
              <Select
                value={u.role}
                onValueChange={(val) =>
                  void updateUser({ id: u.id, role: val as UserRole })
                }
                disabled={updating}
              >
                <SelectTrigger
                  size="sm"
                  className="w-fit"
                  aria-label={`Role for ${u.email}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">USER</SelectItem>
                  <SelectItem value="MANAGER">MANAGER</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </td>
            <td className="py-2.5 pr-4">
              <Badge variant={u.twoFactorEnabled ? "default" : "secondary"}>
                {u.twoFactorEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </td>
            <td className="py-2.5 pr-4 text-xs text-muted-foreground">
              {u.createdAt.slice(0, 10)}
            </td>
            <td className="py-2.5 text-right">
              <div className="flex justify-end gap-2">
                {u.twoFactorEnabled && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        disabled={u.id === Number(me?.id) || disabling2fa}
                      >
                        Disable 2FA
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Disable 2FA?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove 2FA protection from{" "}
                          <strong>{u.email}</strong>&apos;s account. Use only
                          for locked-out users.
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
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={u.id === Number(me?.id) || deleting}
                    >
                      Delete
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
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
