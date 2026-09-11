import { FormattedMessage } from "react-intl";
import { EditProfileTabs } from "@/components/account/EditProfileTabs";

export function EditProfilePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
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
