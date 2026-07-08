import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "./tabs/ProfileTab";
import { SecurityTab } from "./tabs/security/SecurityTab";
import { ClockifyTab } from "./tabs/clockify/ClockifyTab";
import { HubspotTab } from "./tabs/hubspot/HubspotTab";
import { GoogleCalendarTab } from "./tabs/googleCalendar/GoogleCalendarTab";

export function EditProfileTabs() {
  return (
    <Tabs defaultValue="profile">
      <TabsList className="mb-8">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="clockify">Clockify</TabsTrigger>
        <TabsTrigger value="hubspot">HubSpot</TabsTrigger>
        <TabsTrigger value="google-calendar">Google Calendar</TabsTrigger>
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
