import { EditProfileTabs } from "@/components/account/EditProfileTabs";

export function EditProfilePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">
        Edit Profile
      </h1>
      <EditProfileTabs />
    </div>
  );
}
