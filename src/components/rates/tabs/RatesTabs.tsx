import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRates } from "@/hooks/rates/useRates";
import {
  useRateSheets,
  useCreateRateSheet,
  useUpdateRateSheet,
} from "@/hooks/rate-sheets/useRateSheets";
import { CURRENCY_SYMBOLS } from "@/constants/rates";
import { OverviewSection } from "../sections/OverviewSection";
import { RateList } from "../lists/RateList";
import { RateSheetList } from "../lists/RateSheetList";
import { RateSheetForm } from "../forms/RateSheetForm";

export function RatesTabs() {
  const { rates: allRates, loading } = useRates();
  const { rateSheets } = useRateSheets();
  const { createRateSheet, loading: creating } = useCreateRateSheet();
  const { updateRateSheet, loading: updating } = useUpdateRateSheet();
  const [showSheetForm, setShowSheetForm] = useState(false);
  const [editingSheetId, setEditingSheetId] = useState<number | null>(null);

  const hourly = allRates.filter((r) => r.type === "HOURLY");
  const day = allRates.filter((r) => r.type === "DAY");
  const perWord = allRates.filter((r) => r.type === "PER_WORD");
  const fixed = allRates.filter((r) => r.type === "FIXED");

  return (
    <Tabs defaultValue="overview">
      <div className="pb-4 border-b border-border mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hourly">
            Hourly
            {hourly.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs px-1.5">
                {hourly.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="day">
            Day Rate
            {day.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs px-1.5">
                {day.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="per-word">
            Per Word
            {perWord.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs px-1.5">
                {perWord.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="fixed">
            Fixed Fee
            {fixed.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs px-1.5">
                {fixed.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sheets">
            Rate Sheets
            {rateSheets.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs px-1.5">
                {rateSheets.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview" className="mt-0">
        {loading && allRates.length === 0 && rateSheets.length === 0 ? (
          <div className="flex flex-col gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : allRates.length === 0 &&
          rateSheets.length === 0 &&
          !showSheetForm ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              No rates defined yet. Use the tabs above to add your first rate.
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-6">
            <OverviewSection type="HOURLY" rates={hourly} loading={loading} />
            <OverviewSection type="DAY" rates={day} loading={loading} />
            <OverviewSection
              type="PER_WORD"
              rates={perWord}
              loading={loading}
            />
            <OverviewSection type="FIXED" rates={fixed} loading={loading} />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold">Rate Sheets</h3>
                <Badge variant="secondary" className="text-xs">
                  {rateSheets.length}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto h-6 px-2 text-xs"
                  onClick={() => setShowSheetForm((v) => !v)}
                >
                  {showSheetForm ? "Cancel" : "+ Add"}
                </Button>
              </div>
              {rateSheets.length === 0 && !showSheetForm && (
                <p className="text-xs text-muted-foreground">
                  No rate sheets defined.
                </p>
              )}
              {rateSheets.length > 0 && (
                <div className="flex flex-col gap-1">
                  {rateSheets.map((sheet) =>
                    editingSheetId === sheet.id ? (
                      <div key={sheet.id} className="py-2">
                        <RateSheetForm
                          initial={sheet}
                          onSave={async (data) => {
                            await updateRateSheet({ id: sheet.id, ...data });
                            setEditingSheetId(null);
                          }}
                          onCancel={() => setEditingSheetId(null)}
                          saving={updating}
                        />
                      </div>
                    ) : (
                      <div
                        key={sheet.id}
                        className="flex items-center justify-between text-sm px-3 py-1.5 rounded bg-muted/40"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span className="truncate">{sheet.name}</span>
                          <Badge
                            variant="outline"
                            className="text-xs font-mono shrink-0"
                          >
                            {sheet.sourceLanguage} → {sheet.targetLanguage}
                          </Badge>
                        </span>
                        <div className="flex items-center gap-2 ml-4 shrink-0">
                          <span className="font-mono font-semibold">
                            {sheet.pricePerWord.toFixed(4)}
                            {CURRENCY_SYMBOLS[sheet.currency] ??
                              sheet.currency}{" "}
                            <span className="font-normal text-muted-foreground text-xs">
                              {sheet.currency} /word
                            </span>
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => {
                              setShowSheetForm(false);
                              setEditingSheetId(sheet.id);
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
              {showSheetForm && (
                <div className="mt-3">
                  <RateSheetForm
                    onSave={async (data) => {
                      await createRateSheet(data);
                      setShowSheetForm(false);
                    }}
                    onCancel={() => setShowSheetForm(false)}
                    saving={creating}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="hourly" className="mt-0">
        <RateList type="HOURLY" />
      </TabsContent>

      <TabsContent value="day" className="mt-0">
        <RateList type="DAY" />
      </TabsContent>

      <TabsContent value="per-word" className="mt-0">
        <RateList type="PER_WORD" />
      </TabsContent>

      <TabsContent value="fixed" className="mt-0">
        <RateList type="FIXED" />
      </TabsContent>

      <TabsContent value="sheets" className="mt-0">
        <RateSheetList />
      </TabsContent>
    </Tabs>
  );
}
