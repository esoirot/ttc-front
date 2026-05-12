import {
  useInfiniteHubspotCompanies,
  type HubspotCompany,
} from "../../hooks/useHubspot";

function CompanyRow({ company }: { company: HubspotCompany }) {
  const p = company.properties;
  return (
    <tr className="border-b border-zinc-100 dark:border-zinc-800">
      <td className="py-2.5 pr-4 text-sm text-zinc-900 dark:text-white">
        {p.name ?? "—"}
      </td>
      <td className="py-2.5 pr-4 text-sm text-zinc-500 dark:text-zinc-400">
        {p.domain ?? "—"}
      </td>
      <td className="py-2.5 text-sm text-zinc-500 dark:text-zinc-400">
        {p.phone ?? "—"}
      </td>
    </tr>
  );
}

export function CompaniesTab() {
  const infinite = useInfiniteHubspotCompanies();
  const companies = infinite.data?.pages.flatMap((p) => p.results) ?? [];

  return (
    <div className="flex flex-col gap-4">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">
        {companies.length} {companies.length !== 1 ? "companies" : "company"}{" "}
        loaded
      </span>
      {infinite.isLoading ? (
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
                  Domain
                </th>
                <th className="pb-2 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Phone
                </th>
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="py-8 text-center text-sm text-zinc-400"
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
