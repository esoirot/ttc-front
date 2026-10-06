import { ProjectPicker } from "@/components/projects/pickers/ProjectPicker";
import { useIntl, FormattedMessage } from "react-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { TimeEntriesTabProps as Props } from "@/types/invoices.types";
import { useTimeEntriesTab } from "@/hooks/invoices/useTimeEntriesTab";
import { secsToHms } from "@/components/time/ttcHelpers";
import { isTranslationEntry } from "@/lib/translationPricing";

export function TimeEntriesTab({
  invoiceId,
  alreadyAddedEntryIds,
  onAdd,
  adding,
}: Props) {
  const intl = useIntl();
  const allProjects = intl.formatMessage({
    id: "invoices.timeEntriesTab.allProjects",
    defaultMessage: "All projects",
  });
  const {
    rates,
    selectedProjectId,
    selectedRateId,
    unitPrice,
    selectedEntryIds,
    billableEntries,
    entriesLoading,
    hasMore,
    loadMore,
    handleProjectChange,
    handleRateChange,
    handleUnitPriceChange,
    toggleEntry,
    handleBulkAdd,
  } = useTimeEntriesTab(invoiceId, onAdd);

  const canAdd = selectedEntryIds.size > 0 && unitPrice !== "" && !adding;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Label className="text-xs">
          <FormattedMessage
            id="invoices.timeEntriesTab.project"
            defaultMessage="Project"
          />
        </Label>
        <ProjectPicker
          className="h-8 text-sm"
          aria-label={intl.formatMessage({
            id: "invoices.timeEntriesTab.project",
            defaultMessage: "Project",
          })}
          value={selectedProjectId === "__all__" ? "" : selectedProjectId}
          onChange={(v) => handleProjectChange(v || "__all__")}
          placeholder={allProjects}
          noneLabel={allProjects}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs">
          <FormattedMessage
            id="invoices.timeEntriesTab.rate"
            defaultMessage="Rate"
          />
        </Label>
        <div className="flex items-center gap-2">
          <Select value={selectedRateId} onValueChange={handleRateChange}>
            <SelectTrigger className="h-8 text-sm flex-1">
              <SelectValue
                placeholder={intl.formatMessage({
                  id: "invoices.timeEntriesTab.pickRate",
                  defaultMessage: "Pick a rate…",
                })}
              />
            </SelectTrigger>
            <SelectContent>
              {rates.length === 0 ? (
                <SelectItem value="__none__" disabled>
                  <FormattedMessage
                    id="invoices.timeEntriesTab.noRates"
                    defaultMessage="No rates — add rates first"
                  />
                </SelectItem>
              ) : (
                rates.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {r.name} — {r.amount} {r.currency}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground shrink-0">
            <FormattedMessage
              id="invoices.timeEntriesTab.or"
              defaultMessage="or"
            />
          </span>
          <Input
            type="number"
            min={0}
            step="0.01"
            placeholder={intl.formatMessage({
              id: "invoices.timeEntriesTab.unitPrice",
              defaultMessage: "Unit price",
            })}
            value={unitPrice}
            onChange={(e) => handleUnitPriceChange(e.target.value)}
            className="h-8 text-sm w-28"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs">
          <FormattedMessage
            id="invoices.timeEntriesTab.billableTimeEntries"
            defaultMessage="Billable time entries"
          />
        </Label>
        {entriesLoading ? (
          <p className="text-sm text-muted-foreground py-3 text-center">
            <FormattedMessage
              id="invoices.timeEntriesTab.loading"
              defaultMessage="Loading…"
            />
          </p>
        ) : billableEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3 text-center">
            <FormattedMessage
              id="invoices.timeEntriesTab.noBillableEntries"
              defaultMessage="No billable entries found."
            />
          </p>
        ) : (
          <div className="border border-border rounded-md overflow-y-auto max-h-64">
            {billableEntries.map((entry) => {
              const alreadyAdded = alreadyAddedEntryIds.has(entry.id);
              const checked = selectedEntryIds.has(entry.id);
              return (
                <div
                  key={entry.id}
                  className={[
                    "flex items-center gap-3 px-3 py-2 border-b border-border last:border-0",
                    alreadyAdded
                      ? "opacity-50"
                      : "hover:bg-accent/40 cursor-pointer",
                  ].join(" ")}
                  onClick={() => !alreadyAdded && toggleEntry(entry.id)}
                >
                  <Checkbox
                    checked={alreadyAdded ? true : checked}
                    disabled={alreadyAdded}
                    onCheckedChange={() =>
                      !alreadyAdded && toggleEntry(entry.id)
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">
                      {entry.description ?? (
                        <span className="italic text-muted-foreground">
                          <FormattedMessage
                            id="invoices.timeEntriesTab.noDescription"
                            defaultMessage="No description"
                          />
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.startTime.slice(0, 10)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {alreadyAdded && (
                      <Badge variant="secondary" className="text-xs">
                        <FormattedMessage
                          id="invoices.timeEntriesTab.added"
                          defaultMessage="added"
                        />
                      </Badge>
                    )}
                    <span className="text-xs font-mono text-muted-foreground">
                      {isTranslationEntry(entry) ? (
                        <FormattedMessage
                          id="invoices.timeEntriesTab.wordsCount"
                          defaultMessage="{count} words"
                          values={{ count: entry.wordsProcessed ?? 0 }}
                        />
                      ) : entry.durationSeconds != null ? (
                        secsToHms(entry.durationSeconds)
                      ) : (
                        "—"
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
            {hasMore && (
              <div className="p-2 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={loadMore}
                >
                  <FormattedMessage
                    id="invoices.timeEntriesTab.loadMore"
                    defaultMessage="Load more"
                  />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-muted-foreground">
          {selectedEntryIds.size > 0
            ? intl.formatMessage(
                {
                  id: "invoices.timeEntriesTab.selectedCount",
                  defaultMessage: "{count} selected",
                },
                { count: selectedEntryIds.size },
              )
            : ""}
        </span>
        <Button
          onClick={() => void handleBulkAdd()}
          disabled={!canAdd}
          size="sm"
        >
          {adding ? (
            <FormattedMessage
              id="invoices.timeEntriesTab.addingItems"
              defaultMessage="Adding…"
            />
          ) : selectedEntryIds.size > 0 ? (
            <FormattedMessage
              id="invoices.timeEntriesTab.addItemsCount"
              defaultMessage="Add {count, plural, one {# item} other {# items}}"
              values={{ count: selectedEntryIds.size }}
            />
          ) : (
            <FormattedMessage
              id="invoices.timeEntriesTab.addItems"
              defaultMessage="Add items"
            />
          )}
        </Button>
      </div>
    </div>
  );
}
