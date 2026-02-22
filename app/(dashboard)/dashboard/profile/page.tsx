import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import ProfileForm from "@/components/dashboard/ProfileForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User as UserIcon, ShieldAlert } from "lucide-react";
import SecurityForm from "@/components/dashboard/SecurityForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  // Fetch fresh user data from the DB
  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email }).lean();

  if (!user) redirect("/login");

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile details and security preferences.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="general">
            <UserIcon className="w-4 h-4 mr-2" /> General
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldAlert className="w-4 h-4 mr-2" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="general"
          className="bg-card p-6 rounded-xl border shadow-sm"
        >
          <ProfileForm user={JSON.parse(JSON.stringify(user))} />
        </TabsContent>

        <TabsContent
          value="security"
          className="bg-card p-6 rounded-xl border shadow-sm"
        >
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Password Reset</h3>
            <p className="text-sm text-muted-foreground">
              To update your password, we will send a secure 6-digit One Time
              Password (OTP) to your registered email address.
            </p>
            {/* We will drop the SecurityForm component here next! */}
            <SecurityForm email={user.email} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
