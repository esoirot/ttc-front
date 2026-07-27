import { formatTimestamp } from "@/lib/time";
import { STATUS_LABELS } from "@/constants/clients";
import type { ClientStatus, ClientStatusHistory } from "@/types/clients.types";

function statusLabel(raw: unknown): string {
  const s = String(raw ?? "");
  return STATUS_LABELS[s as ClientStatus] ?? s;
}

function formatDate(iso: unknown): string {
  return new Date(String(iso)).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function describe(entry: ClientStatusHistory): string {
  try {
    const p = entry.payload
      ? (JSON.parse(entry.payload) as Record<string, unknown>)
      : null;
    switch (entry.type) {
      case "STATUS_CHANGED":
        return `changed status from ${statusLabel(p?.from)} to ${statusLabel(p?.to)}`;
      case "CONTACTED_AT_CHANGED":
        if (!p?.to) return "cleared last contacted date";
        return p?.from
          ? `changed last contacted date from ${formatDate(p.from)} to ${formatDate(p.to)}`
          : `set last contacted date to ${formatDate(p.to)}`;
      default:
        return entry.type.toLowerCase().replace(/_/g, " ");
    }
  } catch {
    return entry.type;
  }
}

export function ClientStatusHistoryFeed({
  history,
}: {
  history: ClientStatusHistory[];
}) {
  if (history.length === 0) {
    return (
      <div className="text-xs text-muted-foreground">
        No status history yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {[...history].reverse().map((h) => (
        <div key={h.id} className="flex gap-2 text-xs">
          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0 text-[10px] font-medium text-muted-foreground mt-0.5">
            {(h.user?.name ?? "?")[0]?.toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span>
              <span className="font-medium text-foreground">
                {h.user?.name ?? `User ${h.userId}`}
              </span>{" "}
              <span className="text-muted-foreground">{describe(h)}</span>
            </span>
            <span className="text-muted-foreground">
              {formatTimestamp(h.createdAt)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
