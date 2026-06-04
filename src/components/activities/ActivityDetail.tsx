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

export function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const activityId = Number(id);
  const { activity, loading } = useActivity(activityId);

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
