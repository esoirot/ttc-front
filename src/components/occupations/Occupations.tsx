import { useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  useMyOccupations,
  useDeleteOccupation,
} from "@/hooks/occupations/useOccupations";
import { Button } from "@/components/ui/button";
import { CreateOccupationForm } from "./CreateOccupationForm";
import { OccupationCard } from "./OccupationCard";
import type { AnyOccupation } from "@/types/occupations.types";

export function Occupations() {
  const { occupations, loading } = useMyOccupations();
  const { deleteOccupation } = useDeleteOccupation();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="w-full px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">
          <FormattedMessage
            id="occupations.list.title"
            defaultMessage="My Occupations"
          />
        </h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <FormattedMessage
              id="occupations.list.newOccupation"
              defaultMessage="New Occupation"
            />
          </Button>
        )}
      </div>

      {showForm && <CreateOccupationForm onCancel={() => setShowForm(false)} />}

      {loading ? (
        <p className="text-sm text-muted-foreground">
          <FormattedMessage
            id="occupations.detail.loading"
            defaultMessage="Loading…"
          />
        </p>
      ) : occupations.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          <FormattedMessage
            id="occupations.list.empty"
            defaultMessage="No occupations yet. Create one to get started."
          />
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {occupations.map((a: AnyOccupation) => (
            <OccupationCard
              key={a.id}
              occupation={a}
              onDelete={(id) => void deleteOccupation(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
