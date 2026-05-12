import {
  useInfiniteHubspotCompanies,
  type HubspotCompany,
} from "../../hooks/useHubspot";
import { Button } from "@/components/ui/button";

function CompanyRow({ company }: { company: HubspotCompany }) {
  const p = company.properties;
  return (
    <tr className="border-b border-border">
      <td className="py-2.5 pr-4 text-sm">{p.name ?? "—"}</td>
      <td className="py-2.5 pr-4 text-sm text-muted-foreground">
        {p.domain ?? "—"}
      </td>
      <td className="py-2.5 text-sm text-muted-foreground">{p.phone ?? "—"}</td>
    </tr>
  );
}

export function CompaniesTab() {
  const infinite = useInfiniteHubspotCompanies();
  const companies = infinite.data?.pages.flatMap((p) => p.results) ?? [];

  return (
    <div className="flex flex-col gap-4">
      <span className="text-sm text-muted-foreground">
        {companies.length} {companies.length !== 1 ? "companies" : "company"}{" "}
        loaded
      </span>
      {infinite.isLoading ? (
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
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Phone
                </th>
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No companies yet
                  </td>
                </tr>
              )}
              {companies.map((c) => (
                <CompanyRow key={c.id} company={c} />
              ))}
            </tbody>
          </table>
          {infinite.hasNextPage && (
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
