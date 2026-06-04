import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ContactsTabProps } from "@/types/clients.types";
import { ContactRow } from "../rows/ContactRow";
import { EMPTY_CONTACT } from "@/constants/clients";

export function ContactsTab({
  contacts,
  onDelete,
  onEdit,
  onAdd,
  saving,
  adding,
}: ContactsTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_CONTACT);

  function setField(key: keyof typeof EMPTY_CONTACT, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const { firstName, lastName, email, phone } = form;
    if (!firstName && !lastName && !email && !phone) return;
    await onAdd({
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      email: email || undefined,
      phone: phone || undefined,
    });
    setForm(EMPTY_CONTACT);
    setShowForm(false);
  }

  return (
    <>
      {contacts.length === 0 && !showForm ? (
        <p className="text-muted-foreground text-sm mb-3">No contacts yet.</p>
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
                  <Label htmlFor="cfn">First name</Label>
                  <Input
                    id="cfn"
                    value={form.firstName}
                    onChange={(e) => setField("firstName", e.target.value)}
                    placeholder="Jane"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="cln">Last name</Label>
                  <Input
                    id="cln"
                    value={form.lastName}
                    onChange={(e) => setField("lastName", e.target.value)}
                    placeholder="Smith"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="cem">Email</Label>
                  <Input
                    id="cem"
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="jane@acme.com"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="cph">Phone</Label>
                  <Input
                    id="cph"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    placeholder="+33 1 00 00 00 00"
                  />
                </div>
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
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={adding}>
                  {adding ? "Adding…" : "Add contact"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
          + Add contact
        </Button>
      )}
    </>
  );
}
