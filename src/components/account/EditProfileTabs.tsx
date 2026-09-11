import { useIntl } from "react-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "./tabs/ProfileTab";
import { SecurityTab } from "./tabs/security/SecurityTab";
import { ClockifyTab } from "./tabs/clockify/ClockifyTab";
import { HubspotTab } from "./tabs/hubspot/HubspotTab";
import { GoogleCalendarTab } from "./tabs/googleCalendar/GoogleCalendarTab";

export function EditProfileTabs() {
  const intl = useIntl();
  return (
    <Tabs defaultValue="profile">
      <TabsList className="mb-8">
        <TabsTrigger value="profile">
          {intl.formatMessage({
            id: "account.editProfileTabs.profile",
            defaultMessage: "Profile",
          })}
        </TabsTrigger>
        <TabsTrigger value="security">
          {intl.formatMessage({
            id: "account.editProfileTabs.security",
            defaultMessage: "Security",
          })}
        </TabsTrigger>
        <TabsTrigger value="clockify">
          {intl.formatMessage({
            id: "account.editProfileTabs.clockify",
            defaultMessage: "Clockify",
          })}
        </TabsTrigger>
        <TabsTrigger value="hubspot">
          {intl.formatMessage({
            id: "account.editProfileTabs.hubspot",
            defaultMessage: "HubSpot",
          })}
        </TabsTrigger>
        <TabsTrigger value="google-calendar">
          {intl.formatMessage({
            id: "account.editProfileTabs.googleCalendar",
            defaultMessage: "Google Calendar",
          })}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileTab />
      </TabsContent>

      <TabsContent value="security">
        <SecurityTab />
      </TabsContent>

      <TabsContent value="clockify">
        <ClockifyTab />
      </TabsContent>

      <TabsContent value="hubspot">
        <HubspotTab />
      </TabsContent>

      <TabsContent value="google-calendar">
        <GoogleCalendarTab />
      </TabsContent>
    </Tabs>
  );
}
