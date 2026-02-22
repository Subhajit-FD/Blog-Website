"use client";

import { usePathname } from "next/navigation";

const ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/posts": "All Posts",
  "/dashboard/posts/write": "Write New Post",
  "/dashboard/categories": "Categories",
  "/dashboard/settings": "Global Settings",
  "/dashboard/users": "User Management",
  "/dashboard/emails": "Communication",
  "/dashboard/roles": "Roles & Permissions",
};

export default function DashboardHeader() {
  const pathname = usePathname();

  // Simple lookups first
  let title = ROUTE_TITLES[pathname];

  // If not found, try to match sub-paths
  if (!title) {
    if (pathname.startsWith("/dashboard/posts/edit")) title = "Edit Post";
    else if (pathname.startsWith("/dashboard/users")) title = "User Management";
    else if (pathname.startsWith("/dashboard/settings"))
      title = "Global Settings";
    else title = "Dashboard";
  }

  return (
    <h1 className="text-sm font-medium text-muted-foreground hidden md:block">
      {title}
    </h1>
  );
}
