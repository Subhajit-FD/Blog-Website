import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import { redirect } from "next/navigation";
import SettingsForm from "@/components/settings/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email }).select(
    "+password",
  );

  if (!user) {
    redirect("/login");
  }

  // Convert Mongoose doc to plain object and prepare props
  const userData = {
    name: user.name,
    email: user.email,
    image: user.image,
    hasPassword: !!user.password, // Check if password exists
  };

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        <div className="space-y-0.5 px-8">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        <div className="border-t pt-6">
          <SettingsForm user={userData} />
        </div>
      </div>
    </div>
  );
}
