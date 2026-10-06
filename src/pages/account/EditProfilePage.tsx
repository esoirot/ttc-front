import { FormattedMessage } from "react-intl";
import { EditProfileTabs } from "@/components/account/EditProfileTabs";

export function EditProfilePage() {
  return (
    <div className="w-full px-8 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">
        <FormattedMessage
          id="account.editProfilePage.title"
          defaultMessage="Edit Profile"
        />
      </h1>
      <EditProfileTabs />
    </div>
  );
}
