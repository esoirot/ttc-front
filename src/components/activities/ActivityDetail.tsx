import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useActivity } from "@/hooks/activities/useActivities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChargeRow } from "./ChargeRow";
import { AddChargeForm } from "./AddChargeForm";
import { ObjectivesForm } from "./ObjectivesForm";
import { ActivityInfoForm } from "./ActivityInfoForm";
import { TagsSection } from "./TagsSection";
import { LanguagePairsSection } from "./LanguagePairsSection";
import { isTranslatorActivity } from "@/types/activities.types";
import { RateForm } from "@/components/rates/forms/RateForm";
import { RateRow } from "@/components/rates/rows/RateRow";
import { RateSheetForm } from "@/components/rates/forms/RateSheetForm";
import { RateSheetRow } from "@/components/rates/rows/RateSheetRow";
import {
  useCreateRate,
  useUpdateRate,
  useDeleteRate,
} from "@/hooks/rates/useRates";
import {
  useRateSheets,
  useUpdateRateSheet,
  useDeleteRateSheet,
} from "@/hooks/rate-sheets/useRateSheets";
import { useClients } from "@/hooks/clients/useClients";
import type {
  TranslationRateFormData,
  TranslationRateType,
  TranslationRate,
} from "@/types/rates.types";
import type { CreateRateSheetInput } from "@/types/rate-sheets.types";

const RATE_TYPE_LABELS: Record<TranslationRateType, string> = {
  HOURLY: "Hourly",
  DAY: "Day",
  PER_WORD: "Per Word",
  FIXED: "Fixed",
};
const RATE_TYPES: TranslationRateType[] = [
  "HOURLY",
  "DAY",
  "PER_WORD",
  "FIXED",
];

export function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const activityId = Number(id);
  const { activity, loading } = useActivity(activityId);
  const [showRateForm, setShowRateForm] = useState(false);
  const [newRateType, setNewRateType] = useState<TranslationRateType>("HOURLY");
  const [editingRateId, setEditingRateId] = useState<number | null>(null);
  const { createRate, loading: creatingRate } = useCreateRate();
  const { updateRate, loading: updatingRate } = useUpdateRate();
  const { deleteRate } = useDeleteRate();
  const { rateSheets } = useRateSheets();
  const { updateRateSheet, loading: updatingRateSheet } = useUpdateRateSheet();
  const { deleteRateSheet } = useDeleteRateSheet();
  const { clients } = useClients();
  const [editingRateSheetId, setEditingRateSheetId] = useState<number | null>(
    null,
  );
  const activityRateSheets = rateSheets.filter(
    (rs) => rs.activityId === activityId,
  );

  function clientName(clientId: number | null): string | undefined {
    if (clientId == null) return undefined;
    return clients.find((c) => c.id === clientId)?.name;
  }

  async function handleCreateRate(data: TranslationRateFormData) {
    await createRate({ type: newRateType, ...data });
    setShowRateForm(false);
  }

  async function handleUpdateRate(
    id: number,
    type: TranslationRateType,
    data: TranslationRateFormData,
  ) {
    await updateRate({ id, type, ...data });
    setEditingRateId(null);
  }

  async function handleUpdateRateSheet(id: number, data: CreateRateSheetInput) {
    await updateRateSheet({ id, ...data });
    setEditingRateSheetId(null);
  }

  if (!loading && !activity) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <p className="text-sm text-muted-foreground">Activity not found.</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => navigate("/activities")}
        >
          ← Back to activities
        </Button>
      </div>
    );
  }

  const fixedCharges =
    activity?.charges.filter((c) => c.type === "FIXED") ?? [];
  const variableCharges =
    activity?.charges.filter((c) => c.type === "VARIABLE") ?? [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/activities")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Activities
        </button>
        {activity && <span className="text-sm text-muted-foreground">/</span>}
        {activity && (
          <span className="text-sm font-medium">{activity.name}</span>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : activity ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Objectives</CardTitle>
            </CardHeader>
            <CardContent>
              <ObjectivesForm
                key={`obj-${activityId}`}
                activityId={activityId}
                initial={activity}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Charges</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Fixed
                </p>
                {fixedCharges.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No fixed charges.
                  </p>
                ) : (
                  <div className="divide-y divide-border">
                    {fixedCharges.map((c) => (
                      <ChargeRow
                        key={c.id}
                        charge={c}
                        activityId={activityId}
                      />
                    ))}
                  </div>
                )}
                <AddChargeForm activityId={activityId} type="FIXED" />
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Variable
                </p>
                {variableCharges.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No variable charges.
                  </p>
                ) : (
                  <div className="divide-y divide-border">
                    {variableCharges.map((c) => (
                      <ChargeRow
                        key={c.id}
                        charge={c}
                        activityId={activityId}
                      />
                    ))}
                  </div>
                )}
                <AddChargeForm activityId={activityId} type="VARIABLE" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Rates</CardTitle>
              {!showRateForm && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingRateId(null);
                    setShowRateForm(true);
                  }}
                >
                  + Add Rate
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {showRateForm && (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    {(
                      [
                        "HOURLY",
                        "DAY",
                        "PER_WORD",
                        "FIXED",
                      ] as TranslationRateType[]
                    ).map((t) => (
                      <Button
                        key={t}
                        size="sm"
                        variant={newRateType === t ? "default" : "outline"}
                        onClick={() => setNewRateType(t)}
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                  <RateForm
                    type={newRateType}
                    defaultActivityId={activityId}
                    onSave={handleCreateRate}
                    onCancel={() => setShowRateForm(false)}
                    saving={creatingRate}
                  />
                </div>
              )}
              {activity.translationRates.length === 0 && !showRateForm ? (
                <p className="text-sm text-muted-foreground">No rates yet.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {RATE_TYPES.map((rateType) => {
                    const group = activity.translationRates.filter(
                      (r: TranslationRate) => r.type === rateType,
                    );
                    if (group.length === 0) return null;
                    return (
                      <div key={rateType}>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                          {RATE_TYPE_LABELS[rateType]}
                        </p>
                        <div>
                          {group.map((rate) =>
                            editingRateId === rate.id ? (
                              <RateForm
                                key={rate.id}
                                type={rate.type}
                                initial={rate}
                                defaultActivityId={activityId}
                                onSave={(data) =>
                                  void handleUpdateRate(
                                    rate.id,
                                    rate.type,
                                    data,
                                  )
                                }
                                onCancel={() => setEditingRateId(null)}
                                saving={updatingRate}
                              />
                            ) : (
                              <RateRow
                                key={rate.id}
                                rate={rate}
                                onEdit={() => {
                                  setShowRateForm(false);
                                  setEditingRateId(rate.id);
                                }}
                                onDelete={() => void deleteRate(rate.id)}
                              />
                            ),
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {isTranslatorActivity(activity) &&
                activityRateSheets.length > 0 && (
                  <div className="flex flex-col gap-1 pt-3 border-t border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Rate Sheets
                    </p>
                    <div>
                      {activityRateSheets.map((rs) =>
                        editingRateSheetId === rs.id ? (
                          <div
                            key={rs.id}
                            className="py-4 border-b border-border"
                          >
                            <RateSheetForm
                              initial={rs}
                              onSave={(data) =>
                                void handleUpdateRateSheet(rs.id, data)
                              }
                              onCancel={() => setEditingRateSheetId(null)}
                              saving={updatingRateSheet}
                            />
                          </div>
                        ) : (
                          <RateSheetRow
                            key={rs.id}
                            sheet={rs}
                            clientName={clientName(rs.clientId)}
                            onEdit={() => setEditingRateSheetId(rs.id)}
                            onDelete={() => void deleteRateSheet(rs.id)}
                          />
                        ),
                      )}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>

          {isTranslatorActivity(activity) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Language Pairs</CardTitle>
              </CardHeader>
              <CardContent>
                <LanguagePairsSection
                  key={`langpairs-${activityId}`}
                  activityId={activityId}
                  initialPairs={activity.languagePairs}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <TagsSection />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityInfoForm
                key={`info-${activityId}`}
                activityId={activityId}
                initial={activity}
              />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
