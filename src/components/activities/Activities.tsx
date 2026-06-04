import { useState } from "react";
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
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">My Activities</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>New Activity</Button>
        )}
      </div>

      {showForm && <CreateActivityForm onCancel={() => setShowForm(false)} />}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : activities.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No activities yet. Create one to get started.
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
