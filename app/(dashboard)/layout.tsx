import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SearchBar from "@/components/dashboard/GlobalSearch"; // Use GlobalSearch now
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Extra layer of security: Ensure only logged-in users hit the layout
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar user={session.user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger />
          <div className="h-4 w-px bg-border mx-2" />
          <div className="flex-1 flex items-center justify-between">
            <DashboardHeader />
            <div className="w-full max-w-xl md:ml-auto">
              <SearchBar />
            </div>
          </div>
        </header>
        <main className="flex-1 min-w-0 p-4 md:p-6 bg-muted/40">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
