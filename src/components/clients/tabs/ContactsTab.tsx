import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ContactsTabProps } from "@/types/clients.types";
import { ContactRow } from "../rows/ContactRow";
import { ColorField } from "../form-fields/ColorField";
import { EMPTY_CONTACT } from "@/constants/clients";
import { isValidOptionalEmail } from "@/lib/schemas";

export function ContactsTab({
  contacts,
  onDelete,
  onEdit,
  onAdd,
  saving,
  adding,
}: ContactsTabProps) {
  const intl = useIntl();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_CONTACT);
  const [emailTouched, setEmailTouched] = useState(false);

  function setField(key: keyof typeof EMPTY_CONTACT, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const emailError =
    emailTouched && !isValidOptionalEmail(form.email)
      ? intl.formatMessage({
          id: "auth.login.emailError",
          defaultMessage: "Enter a valid email address.",
        })
      : "";

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const { firstName, lastName, email, phone, jobTitle, color } = form;
    if (!firstName && !lastName && !email && !phone && !jobTitle && !color)
      return;
    if (!isValidOptionalEmail(email)) {
      setEmailTouched(true);
      return;
    }
    await onAdd({
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      email: email || undefined,
      phone: phone || undefined,
      jobTitle: jobTitle || undefined,
      color: color || undefined,
    });
    setForm(EMPTY_CONTACT);
    setEmailTouched(false);
    setShowForm(false);
  }

  return (
    <>
      {contacts.length === 0 && !showForm ? (
        <p className="text-muted-foreground text-sm mb-3">
          <FormattedMessage
            id="clients.contactsTab.noContactsYet"
            defaultMessage="No contacts yet."
          />
        </p>
      ) : (
        <div className="flex flex-col mb-4">
          {contacts.map((contact) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              onDelete={() => onDelete(contact.id)}
              onEdit={onEdit}
              saving={saving}
            />
          ))}
        </div>
      )}

      {showForm ? (
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="cfn">
                    <FormattedMessage
                      id="clients.header.field.firstName"
                      defaultMessage="First name"
                    />
                  </Label>
                  <Input
                    id="cfn"
                    value={form.firstName}
                    onChange={(e) => setField("firstName", e.target.value)}
                    placeholder={intl.formatMessage({
                      id: "clients.contactsTab.firstNamePlaceholder",
                      defaultMessage: "Jane",
                    })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="cln">
                    <FormattedMessage
                      id="clients.header.field.lastName"
                      defaultMessage="Last name"
                    />
                  </Label>
                  <Input
                    id="cln"
                    value={form.lastName}
                    onChange={(e) => setField("lastName", e.target.value)}
                    placeholder={intl.formatMessage({
                      id: "clients.contactsTab.lastNamePlaceholder",
                      defaultMessage: "Smith",
                    })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="cem">
                    <FormattedMessage
                      id="clients.header.field.email"
                      defaultMessage="Email"
                    />
                  </Label>
                  <Input
                    id="cem"
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder={intl.formatMessage({
                      id: "clients.contactsTab.emailPlaceholder",
                      defaultMessage: "jane@acme.com",
                    })}
                  />
                  {emailError && (
                    <span className="text-xs text-destructive">
                      {emailError}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="cph">
                    <FormattedMessage
                      id="clients.header.field.phone"
                      defaultMessage="Phone"
                    />
                  </Label>
                  <Input
                    id="cph"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    placeholder={intl.formatMessage({
                      id: "clients.contactsTab.phonePlaceholder",
                      defaultMessage: "+33 1 00 00 00 00",
                    })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="cjt">
                    <FormattedMessage
                      id="clients.contactRow.jobTitle"
                      defaultMessage="Job title"
                    />
                  </Label>
                  <Input
                    id="cjt"
                    value={form.jobTitle}
                    onChange={(e) => setField("jobTitle", e.target.value)}
                    placeholder={intl.formatMessage({
                      id: "clients.contactsTab.jobTitlePlaceholder",
                      defaultMessage: "Project Manager",
                    })}
                  />
                </div>
                <ColorField
                  id="ccol"
                  value={form.color}
                  onChange={(v) => setField("color", v)}
                />
              </div>
              <div className="flex gap-2 self-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    setForm(EMPTY_CONTACT);
                  }}
                >
                  <FormattedMessage
                    id="common.actions.cancel"
                    defaultMessage="Cancel"
                  />
                </Button>
                <Button type="submit" size="sm" disabled={adding}>
                  {adding ? (
                    <FormattedMessage
                      id="clients.contactsTab.adding"
                      defaultMessage="Adding…"
                    />
                  ) : (
                    <FormattedMessage
                      id="clients.contactsTab.addContact"
                      defaultMessage="Add contact"
                    />
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
          <FormattedMessage
            id="clients.contactsTab.addContactCta"
            defaultMessage="+ Add contact"
          />
        </Button>
      )}
    </>
  );
}
