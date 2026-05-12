import { useEffect, useState } from "react";
import {
  useInfiniteHubspotContacts,
  useSearchHubspotContacts,
  useCreateContact,
  type HubspotContact,
} from "../../hooks/useHubspot";

function ContactRow({ contact }: { contact: HubspotContact }) {
  const p = contact.properties;
  const name = [p.firstname, p.lastname].filter(Boolean).join(" ") || "—";
  return (
    <tr className="border-b border-zinc-100 dark:border-zinc-800">
      <td className="py-2.5 pr-4 text-sm text-zinc-900 dark:text-white">
        {name}
      </td>
      <td className="py-2.5 pr-4 text-sm text-zinc-500 dark:text-zinc-400">
        {p.email ?? "—"}
      </td>
      <td className="py-2.5 pr-4 text-sm text-zinc-500 dark:text-zinc-400">
        {p.company ?? "—"}
      </td>
      <td className="py-2.5 text-sm text-zinc-500 dark:text-zinc-400">
        {p.phone ?? "—"}
      </td>
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
        <input
          type="search"
          placeholder="Search contacts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-1.5 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="shrink-0 px-3 py-1.5 text-xs font-medium border border-zinc-200 dark:border-zinc-700 rounded-md hover:border-violet-500 hover:text-violet-600 transition-colors cursor-pointer"
        >
          {showForm ? "Cancel" : "+ New contact"}
        </button>
      </div>

      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        {isSearching
          ? `${contacts.length} result${contacts.length !== 1 ? "s" : ""} for "${debouncedSearch}"`
          : `${contacts.length} contact${contacts.length !== 1 ? "s" : ""} loaded`}
      </span>

      {showForm && (
        <div className="grid grid-cols-2 gap-3 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="col-span-2 px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <input
            type="text"
            placeholder="First name"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <input
            type="text"
            placeholder="Last name"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <input
            type="text"
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <div className="col-span-2 flex justify-end gap-2">
            {createContact.error && (
              <span className="text-xs text-red-600 self-center">
                {createContact.error.message}
              </span>
            )}
            <button
              type="button"
              onClick={() => void handleCreate()}
              disabled={!email.trim() || createContact.isPending}
              className="px-4 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors cursor-pointer"
            >
              {createContact.isPending ? "Saving…" : "Create"}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-zinc-400 py-4">Loading…</p>
      ) : (
        <>
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="pb-2 pr-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Name
                </th>
                <th className="pb-2 pr-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Email
                </th>
                <th className="pb-2 pr-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Company
                </th>
                <th className="pb-2 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Phone
                </th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-sm text-zinc-400"
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
              <button
                type="button"
                onClick={() => void infinite.fetchNextPage()}
                disabled={infinite.isFetchingNextPage}
                className="px-4 py-2 text-sm font-medium border border-zinc-200 dark:border-zinc-700 rounded-md hover:border-violet-500 hover:text-violet-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                {infinite.isFetchingNextPage ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
