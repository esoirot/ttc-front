import { useEffect, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useClients,
  useDeleteClient,
  useUpdateClient,
} from "@/hooks/clients/useClients";
import {
  PROSPECT_COLUMNS,
  STATUS_LABELS,
  ACTIVE_CONTACT_STATUSES,
} from "@/types/clients.types";
import type { Client, ClientStatus } from "@/types/clients.types";
import { NewClientForm } from "../forms/NewClientForm";
import { ProspectCard } from "../sortables/ProspectCard";

const BOARD_LIMIT = 200;

function DroppableColumn({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className="min-h-15"
      data-testid={`prospect-column-${id}`}
    >
      {children}
    </div>
  );
}

export function ProspectsBoard() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const { clients, loading, hasMore, loadMore, total } = useClients(
    debouncedSearch || undefined,
    undefined,
    "CLIENT",
    undefined,
    BOARD_LIMIT,
  );
  const { updateClient } = useUpdateClient();
  const { deleteClient } = useDeleteClient();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );
  const activeClient =
    activeId !== null ? (clients.find((c) => c.id === activeId) ?? null) : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(Number(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const client = clients.find((c) => c.id === Number(active.id));
    if (!client) return;

    const targetStatus: ClientStatus | undefined = (
      PROSPECT_COLUMNS as readonly string[]
    ).includes(String(over.id))
      ? (over.id as ClientStatus)
      : clients.find((c) => c.id === Number(over.id))?.status;

    if (targetStatus && client.status !== targetStatus) {
      void updateClient({
        id: client.id,
        status: targetStatus,
        ...(ACTIVE_CONTACT_STATUSES.has(targetStatus)
          ? { contactedAt: new Date().toISOString().slice(0, 10) }
          : {}),
      });
    }
  }

  const clientsByStatus = PROSPECT_COLUMNS.reduce<Record<string, Client[]>>(
    (acc, s) => ({ ...acc, [s]: clients.filter((c) => c.status === s) }),
    {},
  );

  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Prospects</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? "outline" : "default"}
        >
          {showForm ? "Cancel" : "New prospect"}
        </Button>
      </div>

      <div className="flex flex-col gap-3 pb-4 border-b border-border mb-6 max-w-md">
        <Label htmlFor="prospects-search" className="sr-only">
          Search prospects
        </Label>
        <Input
          id="prospects-search"
          type="search"
          placeholder="Search prospects…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {showForm && (
        <div className="max-w-md">
          <NewClientForm
            onClose={() => setShowForm(false)}
            defaultStatus="TO_CONTACT"
            title="New prospect"
          />
        </div>
      )}

      {loading ? (
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 w-64 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <p className="text-muted-foreground text-xs mb-2">
            {clients.length} of {total}
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4">
              {PROSPECT_COLUMNS.map((status) => (
                <div key={status} className="w-64 shrink-0">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    {STATUS_LABELS[status]} ({clientsByStatus[status].length})
                  </h3>
                  <DroppableColumn id={status}>
                    <SortableContext
                      items={clientsByStatus[status].map((c) => c.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {clientsByStatus[status].map((client) => (
                        <ProspectCard
                          key={client.id}
                          client={client}
                          onDelete={(id) => void deleteClient(id)}
                        />
                      ))}
                    </SortableContext>
                    {clientsByStatus[status].length === 0 && (
                      <p className="text-muted-foreground text-xs text-center py-4">
                        Empty
                      </p>
                    )}
                  </DroppableColumn>
                </div>
              ))}
            </div>
            <DragOverlay dropAnimation={null}>
              {activeClient && (
                <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-sm font-medium opacity-90 cursor-grabbing">
                  {activeClient.name}
                </div>
              )}
            </DragOverlay>
          </DndContext>
          {hasMore && (
            <Button variant="outline" className="mt-4" onClick={loadMore}>
              Load more
            </Button>
          )}
        </>
      )}
    </div>
  );
}
