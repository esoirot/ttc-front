import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { CompanyContact, EditInput } from "@/types/clients.types";
import { EMPTY_EDIT } from "@/constants/clients";

export function ContactRow({
  contact,
  onDelete,
  onEdit,
  saving,
}: {
  contact: CompanyContact;
  onDelete: () => void;
  onEdit: (input: EditInput) => Promise<unknown>;
  saving?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);

  function startEdit() {
    setEditForm({
      firstName: contact.firstName ?? "",
      lastName: contact.lastName ?? "",
      email: contact.email ?? "",
      phone: contact.phone ?? "",
    });
    setEditing(true);
  }

  async function handleSave(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    await onEdit({
      id: contact.id,
      firstName: editForm.firstName || undefined,
      lastName: editForm.lastName || undefined,
      email: editForm.email || undefined,
      phone: editForm.phone || undefined,
    });
    setEditing(false);
  }

  const displayName = [contact.firstName, contact.lastName]
    .filter(Boolean)
    .join(" ");

  if (editing) {
    return (
      <Card className="mb-2">
        <CardContent className="pt-4">
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor={`efn-${contact.id}`}>First name</Label>
                <Input
                  id={`efn-${contact.id}`}
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, firstName: e.target.value }))
                  }
                  placeholder="Jane"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor={`eln-${contact.id}`}>Last name</Label>
                <Input
                  id={`eln-${contact.id}`}
                  value={editForm.lastName}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, lastName: e.target.value }))
                  }
                  placeholder="Smith"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor={`eem-${contact.id}`}>Email</Label>
                <Input
                  id={`eem-${contact.id}`}
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="jane@acme.com"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor={`eph-${contact.id}`}>Phone</Label>
                <Input
                  id={`eph-${contact.id}`}
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="+33 1 00 00 00 00"
                />
              </div>
            </div>
            <div className="flex gap-2 self-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex items-center justify-between py-2 border-b border-border text-sm">
      <div className="flex flex-col gap-0.5">
        {displayName && <span className="font-medium">{displayName}</span>}
        <div className="flex gap-3 text-muted-foreground text-xs">
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>{contact.phone}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground h-7 px-2"
          onClick={startEdit}
        >
          ✎
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive h-7 px-2"
            >
              ✕
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete contact?</AlertDialogTitle>
              <AlertDialogDescription>
                Remove{" "}
                <strong>
                  {displayName || contact.email || "this contact"}
                </strong>
                ? This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={onDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
