import { useEffect, useState } from "react";
import {
  useInfiniteHubspotCompanies,
  useSearchHubspotCompanies,
  useCreateCompany,
  type HubspotCompany,
} from "../../hooks/integrations/useHubspot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function CompanyRow({ company }: { company: HubspotCompany }) {
  const p = company.properties;
  return (
    <tr className="border-b border-border">
      <td className="py-2.5 pr-4 text-sm">{p.name ?? "—"}</td>
      <td className="py-2.5 pr-4 text-sm text-muted-foreground">
        {p.domain ?? "—"}
      </td>
      <td className="py-2.5 pr-4 text-sm text-muted-foreground">
        {p.phone ?? "—"}
      </td>
      <td className="py-2.5 text-sm text-muted-foreground">
        {[p.city, p.country].filter(Boolean).join(", ") || "—"}
      </td>
    </tr>
  );
}

export function CompaniesTab() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const isSearching = debouncedSearch.length > 0;
  const infinite = useInfiniteHubspotCompanies();
  const searchQuery = useSearchHubspotCompanies(debouncedSearch);
  const createCompany = useCreateCompany();

  const companies = isSearching
    ? (searchQuery.data?.results ?? [])
    : (infinite.data?.pages.flatMap((p) => p.results) ?? []);

  const isLoading = isSearching ? searchQuery.isLoading : infinite.isLoading;

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createCompany.mutateAsync({
      name: name.trim(),
      ...(domain.trim() ? { domain: domain.trim() } : {}),
      ...(phone.trim() ? { phone: phone.trim() } : {}),
      ...(city.trim() ? { city: city.trim() } : {}),
      ...(country.trim() ? { country: country.trim() } : {}),
    });
    setName("");
    setDomain("");
    setPhone("");
    setCity("");
    setCountry("");
    setShowForm(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Input
          type="search"
          placeholder="Search companies…"
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
          {showForm ? "Cancel" : "+ New company"}
        </Button>
      </div>
      <span className="text-sm text-muted-foreground">
        {isSearching
          ? `${companies.length} result${companies.length !== 1 ? "s" : ""} for "${debouncedSearch}"`
          : `${companies.length} ${companies.length !== 1 ? "companies" : "company"} loaded`}
      </span>

      {showForm && (
        <div className="grid grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg border">
          <Input
            type="text"
            placeholder="Company name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="col-span-2"
          />
          <Input
            type="text"
            placeholder="Domain (e.g. acme.com)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
          <Input
            type="tel"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
          <div className="col-span-2 flex justify-end gap-2 items-center">
            {createCompany.error && (
              <span className="text-xs text-destructive">
                {createCompany.error.message}
              </span>
            )}
            <Button
              type="button"
              size="sm"
              onClick={() => void handleCreate()}
              disabled={!name.trim() || createCompany.isPending}
            >
              {createCompany.isPending ? "Saving…" : "Create"}
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
                  Domain
                </th>
                <th className="pb-2 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Phone
                </th>
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Location
                </th>
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    {isSearching ? "No companies found" : "No companies yet"}
                  </td>
                </tr>
              )}
              {companies.map((c) => (
                <CompanyRow key={c.id} company={c} />
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
