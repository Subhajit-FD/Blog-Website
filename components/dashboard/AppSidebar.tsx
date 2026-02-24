"use client";

import {
  Home,
  Settings,
  User,
  FileText,
  Users,
  Mail,
  LogOut,
  Plus,
  List,
  Layers,
  ChevronUp,
  Shield,
  Moon,
  Sun,
  MessageSquare,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PERMISSIONS } from "@/lib/config/permissions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "./ModeToggle";

export function AppSidebar({ user: serverUser }: { user: any }) {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();

  // Hook into local session to reflect instant client updates from ProfileForm
  const { data: session } = useSession();
  const user = session?.user || serverUser;

  const perms = (user?.permissions as number) || 0;

  const isAdmin = (perms & PERMISSIONS.ADMINISTRATOR) !== 0;
  const canManageUsers = isAdmin || (perms & PERMISSIONS.READ_USER) !== 0;
  const canViewEmails = isAdmin || (perms & PERMISSIONS.READ_EMAIL) !== 0;

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild onClick={handleLinkClick}>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Layers className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">CMS 3.0</span>
                  <span className="">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Dashboard"
                  isActive={pathname === "/dashboard"}
                  onClick={handleLinkClick}
                >
                  <Link href="/dashboard">
                    <Home />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="All Posts"
                  isActive={pathname.startsWith("/dashboard/posts")}
                  onClick={handleLinkClick}
                >
                  <Link href="/dashboard/posts">
                    <FileText />
                    <span>Posts</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Categories"
                  isActive={pathname.startsWith("/dashboard/categories")}
                  onClick={handleLinkClick}
                >
                  <Link href="/dashboard/categories">
                    <List />
                    <span>Categories</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Global Settings"
                  isActive={pathname.startsWith("/dashboard/settings")}
                  onClick={handleLinkClick}
                >
                  <Link href="/dashboard/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Comments"
                  isActive={pathname.startsWith("/dashboard/comments")}
                  onClick={handleLinkClick}
                >
                  <Link href="/dashboard/comments">
                    <MessageSquare />
                    <span>Comments</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {(canManageUsers || canViewEmails) && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {canManageUsers && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      tooltip="Users"
                      isActive={pathname.startsWith("/dashboard/users")}
                      onClick={handleLinkClick}
                    >
                      <Link href="/dashboard/users">
                        <Users />
                        <span>User Management</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {canViewEmails && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      tooltip="Emails"
                      isActive={pathname.startsWith("/dashboard/emails")}
                      onClick={handleLinkClick}
                    >
                      <Link href="/dashboard/emails">
                        <Mail />
                        <span>Communication</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {isAdmin && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      tooltip="Teams"
                      isActive={pathname.startsWith("/dashboard/teams")}
                      onClick={handleLinkClick}
                    >
                      <Link href="/dashboard/teams">
                        <Users />
                        <span>Team Management</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {isAdmin && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      tooltip="Roles"
                      isActive={pathname.startsWith("/dashboard/roles")}
                      onClick={handleLinkClick}
                    >
                      <Link href="/dashboard/roles">
                        <Shield />
                        <span>Roles & Permissions</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Write Post"
                  onClick={handleLinkClick}
                >
                  <Link href="/dashboard/posts/write">
                    <Plus />
                    <span>Write New Post</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user?.image || ""}
                      alt={user?.name || ""}
                    />
                    <AvatarFallback className="rounded-lg">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              >
                <DropdownMenuItem asChild onClick={handleLinkClick}>
                  <Link href="/dashboard/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground px-2 py-1.5">
                    <span>Theme</span>
                    <ModeToggle />
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
