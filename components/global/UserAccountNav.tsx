"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, LayoutDashboard, Bookmark } from "lucide-react";

interface UserAccountNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    permissions?: number;
  };
}

export default function UserAccountNav({ user }: UserAccountNavProps) {
  // Check if they have at least STAFF bits to show the Dashboard link
  const isStaff = user.permissions && (user.permissions & 2) !== 0 || (user.permissions && (user.permissions & 4096) !== 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <Avatar className="w-9 h-9 border-2 border-transparent hover:border-primary transition-all">
          <AvatarImage src={user.image || ""} alt={user.name || "User"} className="object-cover" />
          <AvatarFallback className="bg-primary/10 text-primary font-bold">
            {user.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            {user.email && <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>}
          </div>
        </div>
        <DropdownMenuSeparator />
        
        {isStaff && (
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/dashboard"><LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard</Link>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/bookmarks"><Bookmark className="w-4 h-4 mr-2" /> My Bookmarks</Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/dashboard/profile"><Settings className="w-4 h-4 mr-2" /> Account Settings</Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600" 
          onClick={() => {
            signOut({ callbackUrl: "/login" });
          }}
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}