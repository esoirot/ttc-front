import type { IntlShape } from "react-intl";
import { FormattedMessage, useIntl } from "react-intl";
import { formatTimestamp } from "@/lib/time";
import {
  RETIRED_STATUS_LABEL_MESSAGES,
  STATUS_LABEL_MESSAGES,
} from "@/constants/clients";
import type { ClientStatus, ClientStatusHistory } from "@/types/clients.types";

function statusLabel(intl: IntlShape, raw: unknown): string {
  const s = String(raw ?? "");
  const message =
    STATUS_LABEL_MESSAGES[s as ClientStatus] ??
    RETIRED_STATUS_LABEL_MESSAGES[s];
  return message ? intl.formatMessage(message) : s;
}

function formatDate(intl: IntlShape, iso: unknown): string {
  return intl.formatDate(new Date(String(iso)), {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function describe(intl: IntlShape, entry: ClientStatusHistory): string {
  try {
    const p = entry.payload
      ? (JSON.parse(entry.payload) as Record<string, unknown>)
      : null;
    switch (entry.type) {
      case "STATUS_CHANGED":
        return intl.formatMessage(
          {
            id: "clients.statusHistory.statusChanged",
            defaultMessage: "changed status from {from} to {to}",
          },
          {
            from: statusLabel(intl, p?.from),
            to: statusLabel(intl, p?.to),
          },
        );
      case "CONTACTED_AT_CHANGED":
        if (!p?.to)
          return intl.formatMessage({
            id: "clients.statusHistory.clearedContactedAt",
            defaultMessage: "cleared last contacted date",
          });
        return p?.from
          ? intl.formatMessage(
              {
                id: "clients.statusHistory.changedContactedAt",
                defaultMessage:
                  "changed last contacted date from {from} to {to}",
              },
              {
                from: formatDate(intl, p.from),
                to: formatDate(intl, p.to),
              },
            )
          : intl.formatMessage(
              {
                id: "clients.statusHistory.setContactedAt",
                defaultMessage: "set last contacted date to {to}",
              },
              { to: formatDate(intl, p.to) },
            );
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
  const intl = useIntl();
  if (history.length === 0) {
    return (
      <div className="text-xs text-muted-foreground">
        <FormattedMessage
          id="clients.statusHistory.empty"
          defaultMessage="No status history yet."
        />
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
                {h.user?.name ??
                  intl.formatMessage(
                    {
                      id: "clients.statusHistory.userFallback",
                      defaultMessage: "User {id}",
                    },
                    { id: h.userId },
                  )}
              </span>{" "}
              <span className="text-muted-foreground">{describe(intl, h)}</span>
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
