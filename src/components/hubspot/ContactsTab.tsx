import { useEffect, useState } from "react";
import {
  useInfiniteHubspotContacts,
  useSearchHubspotContacts,
  useCreateContact,
  type HubspotContact,
} from "../../hooks/useHubspot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <td className="py-2.5 text-sm text-muted-foreground">{p.phone ?? "—"}</td>
    </tr>
  );
}

export function ContactsTab() {
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
          placeholder="Search contacts…"
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
          {showForm ? "Cancel" : "+ New contact"}
        </Button>
      </div>

      <span className="text-sm text-muted-foreground">
        {isSearching
          ? `${contacts.length} result${contacts.length !== 1 ? "s" : ""} for "${debouncedSearch}"`
          : `${contacts.length} contact${contacts.length !== 1 ? "s" : ""} loaded`}
      </span>

      {showForm && (
        <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg border">
          <Input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="col-span-2"
          />
          <Input
            type="text"
            placeholder="First name"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Last name"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          <Input
            type="tel"
            placeholder="Phone"
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
              {createContact.isPending ? "Saving…" : "Create"}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground py-4">Loading…</p>
      ) : (
        <>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Name
                </th>
                <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Email
                </th>
                <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Company
                </th>
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Phone
                </th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    {isSearching ? "No contacts found" : "No contacts yet"}
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
                {infinite.isFetchingNextPage ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
