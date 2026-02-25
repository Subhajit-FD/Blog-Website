import { auth } from "@/auth";
import { getSettings } from "@/actions/settings.actions";
import { PERMISSIONS } from "@/lib/config/permissions";
import { redirect } from "next/navigation";
import SiteSettingsForm from "@/components/settings/SiteSettingsForm";

export default async function SettingsPage() {
  const session = await auth();

  // Must have at least MANAGE_SETTINGS bits to see this page
  const permissions = session?.user?.permissions ?? 0;
  const canAccess =
    (permissions & PERMISSIONS.MANAGE_SETTINGS) !== 0 ||
    (permissions & PERMISSIONS.ADMINISTRATOR) !== 0;

  if (!canAccess) redirect("/");

  const response = await getSettings();
  const settingsData = response.success ? response.data : null;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Global Settings
          </h1>
          <p className="text-muted-foreground">
            Manage site configuration, branding, and global variables.
          </p>
        </div>
      </div>

      {settingsData && (
        <SiteSettingsForm
          initialData={settingsData}
          userPermissions={permissions}
        />
      )}
    </div>
  );
}
