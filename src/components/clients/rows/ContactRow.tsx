import { useState } from "react";
import { useIntl, FormattedMessage } from "react-intl";
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
import { ColorField } from "../form-fields/ColorField";
import { EMPTY_EDIT } from "@/constants/clients";
import { isValidOptionalEmail } from "@/lib/schemas";

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
  const intl = useIntl();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [emailTouched, setEmailTouched] = useState(false);

  function startEdit() {
    setEditForm({
      firstName: contact.firstName ?? "",
      lastName: contact.lastName ?? "",
      email: contact.email ?? "",
      phone: contact.phone ?? "",
      jobTitle: contact.jobTitle ?? "",
      color: contact.color ?? "",
    });
    setEmailTouched(false);
    setEditing(true);
  }

  const emailError =
    emailTouched && !isValidOptionalEmail(editForm.email)
      ? intl.formatMessage({
          id: "auth.login.emailError",
          defaultMessage: "Enter a valid email address.",
        })
      : "";

  async function handleSave(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValidOptionalEmail(editForm.email)) {
      setEmailTouched(true);
      return;
    }
    await onEdit({
      id: contact.id,
      firstName: editForm.firstName || null,
      lastName: editForm.lastName || null,
      email: editForm.email || null,
      phone: editForm.phone || null,
      jobTitle: editForm.jobTitle || null,
      color: editForm.color || null,
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
                <Label htmlFor={`efn-${contact.id}`}>
                  <FormattedMessage
                    id="clients.header.field.firstName"
                    defaultMessage="First name"
                  />
                </Label>
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
                <Label htmlFor={`eln-${contact.id}`}>
                  <FormattedMessage
                    id="clients.header.field.lastName"
                    defaultMessage="Last name"
                  />
                </Label>
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
                <Label htmlFor={`eem-${contact.id}`}>
                  <FormattedMessage
                    id="clients.header.field.email"
                    defaultMessage="Email"
                  />
                </Label>
                <Input
                  id={`eem-${contact.id}`}
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, email: e.target.value }))
                  }
                  onBlur={() => setEmailTouched(true)}
                  placeholder="jane@acme.com"
                />
                {emailError && (
                  <span className="text-xs text-destructive">{emailError}</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor={`eph-${contact.id}`}>
                  <FormattedMessage
                    id="clients.header.field.phone"
                    defaultMessage="Phone"
                  />
                </Label>
                <Input
                  id={`eph-${contact.id}`}
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="+33 1 00 00 00 00"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor={`ejt-${contact.id}`}>
                  <FormattedMessage
                    id="clients.contactRow.jobTitle"
                    defaultMessage="Job title"
                  />
                </Label>
                <Input
                  id={`ejt-${contact.id}`}
                  value={editForm.jobTitle}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, jobTitle: e.target.value }))
                  }
                  placeholder="Project Manager"
                />
              </div>
              <ColorField
                id={`ecol-${contact.id}`}
                value={editForm.color}
                onChange={(v) => setEditForm((f) => ({ ...f, color: v }))}
              />
            </div>
            <div className="flex gap-2 self-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditing(false)}
              >
                <FormattedMessage
                  id="common.actions.cancel"
                  defaultMessage="Cancel"
                />
              </Button>
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? (
                  <FormattedMessage
                    id="clients.header.saving"
                    defaultMessage="Saving…"
                  />
                ) : (
                  <FormattedMessage
                    id="common.actions.save"
                    defaultMessage="Save"
                  />
                )}
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
        <div className="flex items-center gap-2">
          {contact.color && (
            <span
              className="h-3 w-3 shrink-0 rounded-sm border border-border"
              style={{ backgroundColor: contact.color }}
            />
          )}
          {displayName && <span className="font-medium">{displayName}</span>}
        </div>
        {contact.jobTitle && (
          <span className="text-muted-foreground text-xs">
            {contact.jobTitle}
          </span>
        )}
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
              <AlertDialogTitle>
                <FormattedMessage
                  id="clients.contactRow.deleteConfirmTitle"
                  defaultMessage="Delete contact?"
                />
              </AlertDialogTitle>
              <AlertDialogDescription>
                <FormattedMessage
                  id="clients.contactRow.deleteConfirmDescription"
                  defaultMessage="Remove <b>{name}</b>? This cannot be undone."
                  values={{
                    name:
                      displayName ||
                      contact.email ||
                      intl.formatMessage({
                        id: "clients.contactRow.thisContact",
                        defaultMessage: "this contact",
                      }),
                    b: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
                  }}
                />
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                <FormattedMessage
                  id="common.actions.cancel"
                  defaultMessage="Cancel"
                />
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={onDelete}
              >
                <FormattedMessage
                  id="common.actions.delete"
                  defaultMessage="Delete"
                />
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
