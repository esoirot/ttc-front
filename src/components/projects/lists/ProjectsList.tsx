import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useProjects, useDeleteProject } from "@/hooks/projects/useProjects";
import { useAllClients } from "@/hooks/clients/useClients";
import type { ProjectStatus } from "@/types/projects.types";
import { PROJECT_STATUS_TABS } from "@/constants/projects";
import { CreateProjectForm } from "../forms/CreateProjectForm";
import { ProjectCard } from "../cards/ProjectCard";
import { ProjectsOverviewCharts } from "../charts/ProjectsOverviewCharts";
import { MonthSelector } from "../filters/MonthSelector";
import { useFirstTimeEntryStart } from "@/hooks/time/useTimeEntries";

export function ProjectsList() {
  const intl = useIntl();
  const navigate = useNavigate();
  const [view, setView] = useState<"projects" | "dashboard">("projects");
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [chartMonth, setChartMonth] = useState(currentMonth);
  const { firstStart } = useFirstTimeEntryStart({
    enabled: view === "dashboard",
  });
  const firstMonth = firstStart
    ? new Date(firstStart.getFullYear(), firstStart.getMonth(), 1)
    : currentMonth;
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
  const { clients } = useAllClients();
  const { deleteProject } = useDeleteProject();

  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c.name]));

  return (
    <div className="w-full px-8 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          <FormattedMessage
            id="projects.list.title"
            defaultMessage="Projects"
          />
        </h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? "outline" : "default"}
        >
          {showForm ? (
            <FormattedMessage
              id="common.actions.cancel"
              defaultMessage="Cancel"
            />
          ) : (
            <FormattedMessage
              id="projects.list.newProject"
              defaultMessage="New project"
            />
          )}
        </Button>
      </div>

      {showForm && <CreateProjectForm onClose={() => setShowForm(false)} />}

      <Tabs
        value={view}
        onValueChange={(v) => setView(v as "projects" | "dashboard")}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="projects">
            <FormattedMessage
              id="projects.list.tabProjects"
              defaultMessage="Projects"
            />
          </TabsTrigger>
          <TabsTrigger value="dashboard">
            <FormattedMessage
              id="projects.list.tabDashboard"
              defaultMessage="Dashboard"
            />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-0 flex flex-col gap-4">
          <MonthSelector
            month={chartMonth}
            onChange={setChartMonth}
            min={firstMonth}
            max={currentMonth}
          />
          <ProjectsOverviewCharts month={chartMonth} />
        </TabsContent>

        <TabsContent value="projects" className="mt-0">
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as ProjectStatus | "ALL")}
          >
            <div className="flex flex-col gap-3 pb-4 border-b border-border mb-6">
              <Label htmlFor="projects-search" className="sr-only">
                <FormattedMessage
                  id="projects.list.searchLabel"
                  defaultMessage="Search projects"
                />
              </Label>
              <Input
                id="projects-search"
                type="search"
                placeholder={intl.formatMessage({
                  id: "projects.list.searchPlaceholder",
                  defaultMessage: "Search projects…",
                })}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <TabsList>
                {PROJECT_STATUS_TABS.map((t) => (
                  <TabsTrigger key={t.value} value={t.value}>
                    {intl.formatMessage(t.labelMessage)}
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
                  <p className="text-muted-foreground text-sm">
                    <FormattedMessage
                      id="projects.list.empty"
                      defaultMessage="No projects."
                    />
                  </p>
                ) : (
                  <>
                    <p className="text-muted-foreground text-xs mb-2">
                      <FormattedMessage
                        id="clients.list.countOfTotal"
                        defaultMessage="{count} of {total}"
                        values={{ count: projects.length, total }}
                      />
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
                        <FormattedMessage
                          id="clients.list.loadMore"
                          defaultMessage="Load more"
                        />
                      </Button>
                    )}
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
