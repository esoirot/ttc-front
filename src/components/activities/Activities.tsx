import { useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  useMyActivities,
  useDeleteActivity,
} from "@/hooks/activities/useActivities";
import { Button } from "@/components/ui/button";
import { CreateActivityForm } from "./CreateActivityForm";
import { ActivityCard } from "./ActivityCard";
import type { AnyActivity } from "@/types/activities.types";

export function Activities() {
  const { activities, loading } = useMyActivities();
  const { deleteActivity } = useDeleteActivity();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="w-full px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">
          <FormattedMessage
            id="activities.list.title"
            defaultMessage="My Activities"
          />
        </h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <FormattedMessage
              id="activities.list.newActivity"
              defaultMessage="New Activity"
            />
          </Button>
        )}
      </div>

      {showForm && <CreateActivityForm onCancel={() => setShowForm(false)} />}

      {loading ? (
        <p className="text-sm text-muted-foreground">
          <FormattedMessage
            id="activities.detail.loading"
            defaultMessage="Loading…"
          />
        </p>
      ) : activities.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          <FormattedMessage
            id="activities.list.empty"
            defaultMessage="No activities yet. Create one to get started."
          />
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {activities.map((a: AnyActivity) => (
            <ActivityCard
              key={a.id}
              activity={a}
              onDelete={(id) => void deleteActivity(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
