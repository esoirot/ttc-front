import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useProjects, useDeleteProject } from "@/hooks/projects/useProjects";
import { useClients } from "@/hooks/clients/useClients";
import type { ProjectStatus } from "@/types/projects.types";
import { PROJECT_STATUS_TABS } from "@/constants/projects";
import { CreateProjectForm } from "../forms/CreateProjectForm";
import { ProjectCard } from "../cards/ProjectCard";

export function ProjectsList() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ProjectStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const { projects, loading, hasMore, loadMore, total } = useProjects(
    tab === "ALL" ? undefined : tab,
    debouncedSearch || undefined,
  );
  const { clients } = useClients();
  const { deleteProject } = useDeleteProject();

  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c.name]));

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? "outline" : "default"}
        >
          {showForm ? "Cancel" : "New project"}
        </Button>
      </div>

      {showForm && (
        <CreateProjectForm
          clients={clients}
          onClose={() => setShowForm(false)}
        />
      )}

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as ProjectStatus | "ALL")}
      >
        <div className="flex flex-col gap-3 pb-4 border-b border-border mb-6">
          <Label htmlFor="projects-search" className="sr-only">
            Search projects
          </Label>
          <Input
            id="projects-search"
            type="search"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <TabsList>
            {PROJECT_STATUS_TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {PROJECT_STATUS_TABS.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            {loading ? (
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <p className="text-muted-foreground text-sm">No projects.</p>
            ) : (
              <>
                <p className="text-muted-foreground text-xs mb-2">
                  {projects.length} of {total}
                </p>
                <div className="flex flex-col gap-2">
                  {projects.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      clientName={
                        p.clientId ? clientMap[p.clientId] : undefined
                      }
                      onDelete={(id) => void deleteProject(id)}
                      onClick={() => navigate(`/projects/${p.id}`)}
                    />
                  ))}
                </div>
                {hasMore && (
                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={loadMore}
                    disabled={loading}
                  >
                    Load more
                  </Button>
                )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
