import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "@/components/account/ProfileTab";
import { SecurityTab } from "@/components/account/SecurityTab";
import { ClockifyTab } from "@/components/account/ClockifyTab";
import { HubspotTab } from "@/components/account/HubspotTab";

export function EditProfilePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">
        Edit Profile
      </h1>

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
    </div>
  );
}
