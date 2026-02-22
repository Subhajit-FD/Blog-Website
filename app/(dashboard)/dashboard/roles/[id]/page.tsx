import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Role from "@/lib/models/Role";
import { PERMISSIONS } from "@/lib/config/permissions";
import RoleForm from "@/components/dashboard/roles/RoleForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

export default async function EditRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const permissions = session?.user?.permissions ?? 0;
  const isAdmin = (permissions & PERMISSIONS.ADMINISTRATOR) !== 0;

  if (!isAdmin) {
    return <div className="p-8">Access Denied.</div>;
  }

  const { id } = await params;

  await connectToDatabase();
  const role = await Role.findById(id).lean();

  if (!role) {
    notFound();
  }

  // Convert _id to string for the client component
  const initialData = {
    ...role,
    _id: role._id.toString(),
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/roles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit Role: {initialData.name}</h1>
      </div>
      <RoleForm initialData={initialData} />
    </div>
  );
}
