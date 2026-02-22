"use client";

import Link from "next/link";
import {
  User as UserIcon,
  Bookmark,
  LogOut,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { GoogleTranslate } from "@/components/shared/GoogleTranslate";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PERMISSIONS } from "@/lib/config/permissions";
import { signOut } from "next-auth/react";

export default function HeaderActions({ user }: { user: any }) {
  const hasDashboardAccess = user?.permissions
    ? (user.permissions & PERMISSIONS.VIEW_DASHBOARD) !== 0
    : false;

  return (
    <div className="flex items-center gap-4 text-gray-600">
      <div className="hidden lg:block">
        {user ? (
          <div className="flex items-center gap-4">
            <Link
              href="/bookmarks"
              className="hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <Bookmark size={18} />
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <div className="flex items-center gap-2 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer">
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={user.image}
                      alt={user.name || "User Avatar"}
                    />
                    <AvatarFallback>
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium capitalize">
                    {user.name}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {hasDashboardAccess && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard"
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild>
                  <Link
                    href="/settings"
                    className="cursor-pointer flex items-center gap-2"
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-red-600 cursor-pointer flex items-center gap-2 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut size={16} />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Link
            href="/login"
            className="hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <UserIcon size={18} />
          </Link>
        )}
      </div>

      <div className="border-l-2 pl-2 flex items-center gap-4">
        <span className="hidden md:flex">
          <GoogleTranslate />
        </span>
        <ThemeToggle />
      </div>
    </div>
  );
}
