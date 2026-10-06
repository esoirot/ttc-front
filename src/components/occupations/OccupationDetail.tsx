import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIntl, FormattedMessage } from "react-intl";
import { useOccupation } from "@/hooks/occupations/useOccupations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChargeRow } from "./ChargeRow";
import { AddChargeForm } from "./AddChargeForm";
import { ObjectivesForm } from "./ObjectivesForm";
import { OccupationInfoForm } from "./OccupationInfoForm";
import { TagsSection } from "./TagsSection";
import { LanguagePairsSection } from "./LanguagePairsSection";
import { CustomFieldsSection } from "./CustomFieldsSection";
import {
  isCustomOccupation,
  isTranslatorOccupation,
} from "@/types/occupations.types";
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
import { useAllClients } from "@/hooks/clients/useClients";
import type {
  TranslationRateFormData,
  TranslationRateType,
  TranslationRate,
} from "@/types/rates.types";
import type { CreateRateSheetInput } from "@/types/rate-sheets.types";
import { TYPE_LABEL_MESSAGES } from "@/constants/rates";

const RATE_TYPES: TranslationRateType[] = [
  "HOURLY",
  "DAY",
  "PER_WORD",
  "FIXED",
];

export function OccupationDetail() {
  const intl = useIntl();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const occupationId = Number(id);
  const { occupation, loading } = useOccupation(occupationId);
  const [showRateForm, setShowRateForm] = useState(false);
  const [newRateType, setNewRateType] = useState<TranslationRateType>("HOURLY");
  const [editingRateId, setEditingRateId] = useState<number | null>(null);
  const { createRate, loading: creatingRate } = useCreateRate();
  const { updateRate, loading: updatingRate } = useUpdateRate();
  const { deleteRate } = useDeleteRate();
  const { rateSheets } = useRateSheets();
  const { updateRateSheet, loading: updatingRateSheet } = useUpdateRateSheet();
  const { deleteRateSheet } = useDeleteRateSheet();
  const { clients } = useAllClients();
  const [editingRateSheetId, setEditingRateSheetId] = useState<number | null>(
    null,
  );
  const occupationRateSheets = rateSheets.filter(
    (rs) => rs.occupationId === occupationId,
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

  if (!loading && !occupation) {
    return (
      <div className="w-full px-8 py-8">
        <p className="text-sm text-muted-foreground">
          <FormattedMessage
            id="occupations.detail.occupationNotFound"
            defaultMessage="Occupation not found."
          />
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => navigate("/occupations")}
        >
          <FormattedMessage
            id="occupations.detail.backToOccupations"
            defaultMessage="← Back to occupations"
          />
        </Button>
      </div>
    );
  }

  const fixedCharges =
    occupation?.charges.filter((c) => c.type === "FIXED") ?? [];
  const variableCharges =
    occupation?.charges.filter((c) => c.type === "VARIABLE") ?? [];

  return (
    <div className="w-full px-8 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 text-muted-foreground"
          onClick={() => navigate("/occupations")}
        >
          <FormattedMessage
            id="occupations.detail.occupationsBreadcrumb"
            defaultMessage="← Occupations"
          />
        </Button>
        {occupation && <span className="text-sm text-muted-foreground">/</span>}
        {occupation && (
          <span className="text-sm font-medium">{occupation.name}</span>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">
          <FormattedMessage
            id="occupations.detail.loading"
            defaultMessage="Loading…"
          />
        </p>
      ) : occupation ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <FormattedMessage
                  id="occupations.detail.objectives"
                  defaultMessage="Objectives"
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ObjectivesForm
                key={`obj-${occupationId}`}
                occupationId={occupationId}
                initial={occupation}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <FormattedMessage
                  id="occupations.detail.charges"
                  defaultMessage="Charges"
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  <FormattedMessage
                    id="occupations.detail.fixed"
                    defaultMessage="Fixed"
                  />
                </p>
                {fixedCharges.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    <FormattedMessage
                      id="occupations.detail.noFixedCharges"
                      defaultMessage="No fixed charges."
                    />
                  </p>
                ) : (
                  <div className="divide-y divide-border">
                    {fixedCharges.map((c) => (
                      <ChargeRow
                        key={c.id}
                        charge={c}
                        occupationId={occupationId}
                      />
                    ))}
                  </div>
                )}
                <AddChargeForm occupationId={occupationId} type="FIXED" />
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  <FormattedMessage
                    id="occupations.detail.variable"
                    defaultMessage="Variable"
                  />
                </p>
                {variableCharges.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    <FormattedMessage
                      id="occupations.detail.noVariableCharges"
                      defaultMessage="No variable charges."
                    />
                  </p>
                ) : (
                  <div className="divide-y divide-border">
                    {variableCharges.map((c) => (
                      <ChargeRow
                        key={c.id}
                        charge={c}
                        occupationId={occupationId}
                      />
                    ))}
                  </div>
                )}
                <AddChargeForm occupationId={occupationId} type="VARIABLE" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                <FormattedMessage
                  id="occupations.detail.rates"
                  defaultMessage="Rates"
                />
              </CardTitle>
              {!showRateForm && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingRateId(null);
                    setShowRateForm(true);
                  }}
                >
                  <FormattedMessage
                    id="occupations.detail.addRate"
                    defaultMessage="+ Add Rate"
                  />
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {showRateForm && (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-muted-foreground">
                      <FormattedMessage
                        id="occupations.detail.type"
                        defaultMessage="Type:"
                      />
                    </span>
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
                    defaultOccupationId={occupationId}
                    onSave={handleCreateRate}
                    onCancel={() => setShowRateForm(false)}
                    saving={creatingRate}
                  />
                </div>
              )}
              {occupation.translationRates.length === 0 && !showRateForm ? (
                <p className="text-sm text-muted-foreground">
                  <FormattedMessage
                    id="occupations.detail.noRatesYet"
                    defaultMessage="No rates yet."
                  />
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {RATE_TYPES.map((rateType) => {
                    const group = occupation.translationRates.filter(
                      (r: TranslationRate) => r.type === rateType,
                    );
                    if (group.length === 0) return null;
                    return (
                      <div key={rateType}>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                          {intl.formatMessage(TYPE_LABEL_MESSAGES[rateType])}
                        </p>
                        <div>
                          {group.map((rate) =>
                            editingRateId === rate.id ? (
                              <RateForm
                                key={rate.id}
                                type={rate.type}
                                initial={rate}
                                defaultOccupationId={occupationId}
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
              {isTranslatorOccupation(occupation) &&
                occupationRateSheets.length > 0 && (
                  <div className="flex flex-col gap-1 pt-3 border-t border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      <FormattedMessage
                        id="occupations.detail.rateSheets"
                        defaultMessage="Rate Sheets"
                      />
                    </p>
                    <div>
                      {occupationRateSheets.map((rs) =>
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

          {isTranslatorOccupation(occupation) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  <FormattedMessage
                    id="occupations.detail.languagePairs"
                    defaultMessage="Language Pairs"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LanguagePairsSection
                  key={`langpairs-${occupationId}`}
                  occupationId={occupationId}
                  initialPairs={occupation.languagePairs}
                />
              </CardContent>
            </Card>
          )}

          {isCustomOccupation(occupation) && (
            <Card>
              <CardContent className="pt-6">
                <CustomFieldsSection
                  key={`customfields-${occupationId}`}
                  occupationId={occupationId}
                  initialFields={occupation.customFields}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <FormattedMessage
                  id="occupations.detail.tags"
                  defaultMessage="Tags"
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TagsSection />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <FormattedMessage
                  id="occupations.detail.occupation"
                  defaultMessage="Occupation"
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OccupationInfoForm
                key={`info-${occupationId}`}
                occupationId={occupationId}
                initial={occupation}
              />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
