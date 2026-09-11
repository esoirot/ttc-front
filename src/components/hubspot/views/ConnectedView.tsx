import { useIntl } from "react-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompaniesTab } from "../tabs/CompaniesTab";
import { ContactsTab } from "../tabs/ContactsTab";
import { DealsTab } from "../tabs/DealsTab";

export function ConnectedView() {
  const intl = useIntl();
  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="contacts">
        <TabsList>
          <TabsTrigger value="contacts">
            {intl.formatMessage({
              id: "hubspot.connectedView.contacts",
              defaultMessage: "Contacts",
            })}
          </TabsTrigger>
          <TabsTrigger value="companies">
            {intl.formatMessage({
              id: "hubspot.connectedView.companies",
              defaultMessage: "Companies",
            })}
          </TabsTrigger>
          <TabsTrigger value="deals">
            {intl.formatMessage({
              id: "hubspot.connectedView.deals",
              defaultMessage: "Deals",
            })}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="contacts" className="mt-4">
          <ContactsTab />
        </TabsContent>
        <TabsContent value="companies" className="mt-4">
          <CompaniesTab />
        </TabsContent>
        <TabsContent value="deals" className="mt-4">
          <DealsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
