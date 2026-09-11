import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useCreateContact,
  useImportHubspotContact,
  useInfiniteHubspotContacts,
  useSearchHubspotContacts,
} from "@/hooks/integrations/useHubspot";
import type { HubspotContact } from "@/types/hubspot.types";

function ImportButton({ contactId }: { contactId: string }) {
  const intl = useIntl();
  const [done, setDone] = useState(false);
  const importContact = useImportHubspotContact();

  if (done) {
    return (
      <Badge variant="secondary" className="text-xs">
        <FormattedMessage
          id="hubspot.contactsTab.imported"
          defaultMessage="Imported"
        />
      </Badge>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="text-xs h-7"
      disabled={importContact.isPending}
      onClick={() =>
        void importContact
          .mutateAsync(contactId)
          .then(() => setDone(true))
          .catch(() => undefined)
      }
    >
      {importContact.isPending
        ? intl.formatMessage({
            id: "hubspot.contactsTab.importing",
            defaultMessage: "Importing…",
          })
        : intl.formatMessage({
            id: "hubspot.contactsTab.importAsClient",
            defaultMessage: "Import as client",
          })}
    </Button>
  );
}

function ContactRow({ contact }: { contact: HubspotContact }) {
  const p = contact.properties;
  const name = [p.firstname, p.lastname].filter(Boolean).join(" ") || "—";
  return (
    <tr className="border-b border-border">
      <td className="py-2.5 pr-4 text-sm">{name}</td>
      <td className="py-2.5 pr-4 text-sm text-muted-foreground">
        {p.email ?? "—"}
      </td>
      <td className="py-2.5 pr-4 text-sm text-muted-foreground">
        {p.company ?? "—"}
      </td>
      <td className="py-2.5 pr-4 text-sm text-muted-foreground">
        {p.phone ?? "—"}
      </td>
      <td className="py-2.5">
        <ImportButton contactId={contact.id} />
      </td>
    </tr>
  );
}

export function ContactsTab() {
  const intl = useIntl();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const isSearching = debouncedSearch.length > 0;
  const infinite = useInfiniteHubspotContacts();
  const searchQuery = useSearchHubspotContacts(debouncedSearch);
  const createContact = useCreateContact();

  const contacts = isSearching
    ? (searchQuery.data?.results ?? [])
    : (infinite.data?.pages.flatMap((p) => p.results) ?? []);

  const isLoading = isSearching ? searchQuery.isLoading : infinite.isLoading;

  const handleCreate = async () => {
    if (!email.trim()) return;
    await createContact.mutateAsync({
      email: email.trim(),
      ...(firstname.trim() ? { firstname: firstname.trim() } : {}),
      ...(lastname.trim() ? { lastname: lastname.trim() } : {}),
      ...(phone.trim() ? { phone: phone.trim() } : {}),
      ...(company.trim() ? { company: company.trim() } : {}),
    });
    setEmail("");
    setFirstname("");
    setLastname("");
    setPhone("");
    setCompany("");
    setShowForm(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Input
          type="search"
          placeholder={intl.formatMessage({
            id: "hubspot.contactsTab.searchPlaceholder",
            defaultMessage: "Search contacts…",
          })}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? (
            <FormattedMessage
              id="common.actions.cancel"
              defaultMessage="Cancel"
            />
          ) : (
            <FormattedMessage
              id="hubspot.contactsTab.newContact"
              defaultMessage="+ New contact"
            />
          )}
        </Button>
      </div>

      <span className="text-sm text-muted-foreground">
        {isSearching
          ? intl.formatMessage(
              {
                id: "hubspot.tab.resultCount",
                defaultMessage:
                  '{count, plural, one {# result} other {# results}} for "{query}"',
              },
              { count: contacts.length, query: debouncedSearch },
            )
          : intl.formatMessage(
              {
                id: "hubspot.contactsTab.loadedCount",
                defaultMessage:
                  "{count, plural, one {# contact loaded} other {# contacts loaded}}",
              },
              { count: contacts.length },
            )}
      </span>

      {showForm && (
        <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg border">
          <Input
            type="email"
            placeholder={intl.formatMessage({
              id: "hubspot.contactsTab.emailPlaceholder",
              defaultMessage: "Email *",
            })}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="col-span-2"
          />
          <Input
            type="text"
            placeholder={intl.formatMessage({
              id: "hubspot.contactsTab.firstNamePlaceholder",
              defaultMessage: "First name",
            })}
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
          />
          <Input
            type="text"
            placeholder={intl.formatMessage({
              id: "hubspot.contactsTab.lastNamePlaceholder",
              defaultMessage: "Last name",
            })}
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
          />
          <Input
            type="text"
            placeholder={intl.formatMessage({
              id: "hubspot.contactsTab.companyPlaceholder",
              defaultMessage: "Company",
            })}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          <Input
            type="tel"
            placeholder={intl.formatMessage({
              id: "hubspot.contactsTab.phonePlaceholder",
              defaultMessage: "Phone",
            })}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <div className="col-span-2 flex justify-end gap-2 items-center">
            {createContact.error && (
              <span className="text-xs text-destructive">
                {createContact.error.message}
              </span>
            )}
            <Button
              type="button"
              size="sm"
              onClick={() => void handleCreate()}
              disabled={!email.trim() || createContact.isPending}
            >
              {createContact.isPending ? (
                <FormattedMessage
                  id="hubspot.tab.saving"
                  defaultMessage="Saving…"
                />
              ) : (
                <FormattedMessage
                  id="hubspot.tab.create"
                  defaultMessage="Create"
                />
              )}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground py-4">
          <FormattedMessage
            id="hubspot.tab.loading"
            defaultMessage="Loading…"
          />
        </p>
      ) : (
        <>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <FormattedMessage
                    id="hubspot.contactsTab.colName"
                    defaultMessage="Name"
                  />
                </th>
                <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <FormattedMessage
                    id="hubspot.contactsTab.colEmail"
                    defaultMessage="Email"
                  />
                </th>
                <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <FormattedMessage
                    id="hubspot.contactsTab.colCompany"
                    defaultMessage="Company"
                  />
                </th>
                <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <FormattedMessage
                    id="hubspot.contactsTab.colPhone"
                    defaultMessage="Phone"
                  />
                </th>
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <FormattedMessage
                    id="hubspot.contactsTab.colActions"
                    defaultMessage="Actions"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    {isSearching ? (
                      <FormattedMessage
                        id="hubspot.contactsTab.noResults"
                        defaultMessage="No contacts found"
                      />
                    ) : (
                      <FormattedMessage
                        id="hubspot.contactsTab.noContacts"
                        defaultMessage="No contacts yet"
                      />
                    )}
                  </td>
                </tr>
              )}
              {contacts.map((c) => (
                <ContactRow key={c.id} contact={c} />
              ))}
            </tbody>
          </table>
          {!isSearching && infinite.hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void infinite.fetchNextPage()}
                disabled={infinite.isFetchingNextPage}
              >
                {infinite.isFetchingNextPage ? (
                  <FormattedMessage
                    id="hubspot.tab.loading"
                    defaultMessage="Loading…"
                  />
                ) : (
                  <FormattedMessage
                    id="hubspot.tab.loadMore"
                    defaultMessage="Load more"
                  />
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
