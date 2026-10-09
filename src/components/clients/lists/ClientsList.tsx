import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClients, useDeleteClient } from "@/hooks/clients/useClients";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CLIENT_SORT_FIELD_LABELS,
  COMPANY_SORT_FIELDS,
  INDUSTRY_LABEL_MESSAGES,
  PERSON_SORT_FIELDS,
} from "@/constants/clients";
import {
  SortControls,
  type SortDirection,
} from "@/components/sort/SortControls";
import type {
  ClientIndustry,
  ClientSortField,
  ClientType,
} from "@/types/clients.types";
import { NewClientForm } from "../forms/NewClientForm";
import { ClientCard } from "../cards/ClientCard";

const NO_NAMES = { companyName: "", lastName: "", firstName: "" };

export function ClientsList() {
  const intl = useIntl();
  // All / Companies tabs filter by company name, Individuals by last and
  // first name; switching tab starts from empty fields.
  const [names, setNames] = useState(NO_NAMES);
  const [debouncedNames, setDebouncedNames] = useState(NO_NAMES);
  const [typeFilter, setTypeFilter] = useState<ClientType | "ALL">("ALL");
  const [industry, setIndustry] = useState<ClientIndustry | "ALL">("ALL");
  const [showForm, setShowForm] = useState(false);
  const isPeople = typeFilter === "INDIVIDUAL";
  const sortFields = isPeople ? PERSON_SORT_FIELDS : COMPANY_SORT_FIELDS;
  const [sortField, setSortField] = useState<ClientSortField>("NAME");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    const id = setTimeout(
      () =>
        setDebouncedNames({
          companyName: names.companyName.trim(),
          lastName: names.lastName.trim(),
          firstName: names.firstName.trim(),
        }),
      300,
    );
    return () => clearTimeout(id);
  }, [names]);

  const nameField = (field: keyof typeof NO_NAMES) => ({
    value: names[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setNames((prev) => ({ ...prev, [field]: e.target.value })),
  });

  const { clients, loading, hasMore, loadMore, total } = useClients({
    companyName: debouncedNames.companyName || undefined,
    lastName: debouncedNames.lastName || undefined,
    firstName: debouncedNames.firstName || undefined,
    clientType: typeFilter === "ALL" ? undefined : typeFilter,
    industry: industry === "ALL" ? undefined : industry,
    sort: {
      field: sortField,
      direction: sortDirection === "asc" ? "ASC" : "DESC",
    },
    status: "CLIENT",
  });
  const { deleteClient } = useDeleteClient();

  return (
    <div className="w-full px-8 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          <FormattedMessage id="clients.list.title" defaultMessage="Clients" />
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
              id="clients.list.newClient"
              defaultMessage="New client"
            />
          )}
        </Button>
      </div>

      <div className="flex flex-col gap-3 pb-4 border-b border-border mb-6">
        {isPeople ? (
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="search"
              aria-label={intl.formatMessage({
                id: "clients.list.lastName",
                defaultMessage: "Last name",
              })}
              placeholder={intl.formatMessage({
                id: "clients.list.lastNamePlaceholder",
                defaultMessage: "Last name…",
              })}
              {...nameField("lastName")}
            />
            <Input
              type="search"
              aria-label={intl.formatMessage({
                id: "clients.list.firstName",
                defaultMessage: "First name",
              })}
              placeholder={intl.formatMessage({
                id: "clients.list.firstNamePlaceholder",
                defaultMessage: "First name…",
              })}
              {...nameField("firstName")}
            />
          </div>
        ) : (
          <Input
            type="search"
            aria-label={intl.formatMessage({
              id: "clients.list.companyName",
              defaultMessage: "Company name",
            })}
            placeholder={intl.formatMessage({
              id: "clients.list.companyNamePlaceholder",
              defaultMessage: "Company name…",
            })}
            {...nameField("companyName")}
          />
        )}
        <Tabs
          value={typeFilter}
          onValueChange={(v) => {
            const type = v as ClientType | "ALL";
            setTypeFilter(type);
            setNames(NO_NAMES);
            setDebouncedNames(NO_NAMES);
            setSortField(
              (type === "INDIVIDUAL"
                ? PERSON_SORT_FIELDS
                : COMPANY_SORT_FIELDS)[0],
            );
            setSortDirection("asc");
          }}
        >
          <TabsList>
            <TabsTrigger value="ALL">
              <FormattedMessage id="clients.list.all" defaultMessage="All" />
            </TabsTrigger>
            <TabsTrigger value="COMPANY">
              <FormattedMessage
                id="clients.list.companies"
                defaultMessage="Companies"
              />
            </TabsTrigger>
            <TabsTrigger value="INDIVIDUAL">
              <FormattedMessage
                id="clients.list.individuals"
                defaultMessage="Individuals"
              />
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-wrap items-end gap-3">
          <Select
            value={industry}
            onValueChange={(v) => setIndustry(v as ClientIndustry | "ALL")}
          >
            <SelectTrigger
              className="w-56"
              aria-label={intl.formatMessage({
                id: "clients.list.industryFilter",
                defaultMessage: "Industry",
              })}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                <FormattedMessage
                  id="clients.list.allIndustries"
                  defaultMessage="All industries"
                />
              </SelectItem>
              {(Object.keys(INDUSTRY_LABEL_MESSAGES) as ClientIndustry[]).map(
                (val) => (
                  <SelectItem key={val} value={val}>
                    {intl.formatMessage(INDUSTRY_LABEL_MESSAGES[val])}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
          <SortControls
            idPrefix="clients"
            fields={sortFields}
            fieldLabels={CLIENT_SORT_FIELD_LABELS}
            field={sortField}
            direction={sortDirection}
            onFieldChange={setSortField}
            onDirectionChange={setSortDirection}
          />
        </div>
      </div>

      {showForm && <NewClientForm onClose={() => setShowForm(false)} />}

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          <FormattedMessage
            id="clients.list.empty"
            defaultMessage="No clients yet. Create one above."
          />
        </p>
      ) : (
        <>
          <p className="text-muted-foreground text-xs mb-2">
            <FormattedMessage
              id="clients.list.countOfTotal"
              defaultMessage="{count} of {total}"
              values={{ count: clients.length, total }}
            />
          </p>
          <div className="flex flex-col gap-2">
            {clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onDelete={(id) => void deleteClient(id)}
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
    </div>
  );
}
