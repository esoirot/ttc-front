import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "./ProfileTab";
import { SecurityTab } from "./SecurityTab";
import { ClockifyTab } from "./ClockifyTab";
import { HubspotTab } from "./HubspotTab";

export function EditProfileTabs() {
  return (
    <Tabs defaultValue="profile">
      <TabsList className="mb-8">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="clockify">Clockify</TabsTrigger>
        <TabsTrigger value="hubspot">HubSpot</TabsTrigger>
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
    </Tabs>
  );
}
