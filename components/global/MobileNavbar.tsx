"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown, ChevronUp, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Search from "./Search";
import { ThemeToggle } from "./ThemeToggle";
import { GoogleTranslate } from "@/components/shared/GoogleTranslate";

interface MobileNavbarProps {
  categories: any[];
}

export default function MobileNavbar({ categories }: MobileNavbarProps) {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    // Specific check for /category/all so it doesn't highlight when on a specific category unless intended
    if (path === "/category/all") {
      return pathname === "/category/all";
    }
    return pathname?.startsWith(path);
  };

  const getLinkClasses = (path: string) => {
    return `text-lg transition-colors hover:text-primary ${
      isActive(path)
        ? "text-primary font-semibold"
        : "text-muted-foreground font-medium"
    }`;
  };

  const getSubLinkClasses = (path: string) => {
    return `text-base transition-colors hover:text-foreground capitalize ${
      isActive(path) ? "text-primary font-semibold" : "text-muted-foreground"
    }`;
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[300px] sm:w-[400px] flex flex-col h-full"
      >
        <SheetHeader>
          <SheetTitle className="text-left">Blog</SheetTitle>
        </SheetHeader>

        <div className="py-2 px-4">
          <Search />
        </div>

        <div className="flex flex-col gap-4 p-4 flex-1 overflow-y-auto">
          <SheetClose asChild>
            <Link href="/" className={getLinkClasses("/")}>
              Home
            </Link>
          </SheetClose>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              className={`flex items-center justify-between transition-colors hover:text-primary ${
                isActive("/category")
                  ? "text-primary font-semibold text-lg"
                  : "text-muted-foreground font-medium text-lg"
              }`}
            >
              Categories
              {isCategoriesOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {isCategoriesOpen && (
              <div className="flex flex-col gap-2 pl-4 border-l-2 border-muted ml-2">
                <SheetClose asChild>
                  <Link
                    href="/category/all"
                    className={getSubLinkClasses("/category/all")}
                  >
                    All
                  </Link>
                </SheetClose>
                {categories.map((category) => (
                  <SheetClose asChild key={category._id}>
                    <Link
                      href={`/category/${category.slug}`}
                      className={getSubLinkClasses(
                        `/category/${category.slug}`,
                      )}
                    >
                      {category.title}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            )}
          </div>

          <SheetClose asChild>
            <Link href="/about" className={getLinkClasses("/about")}>
              About
            </Link>
          </SheetClose>

          <SheetClose asChild>
            <Link href="/contact" className={getLinkClasses("/contact")}>
              Contact
            </Link>
          </SheetClose>

          <div className="pt-4 mt-2 border-t flex flex-col gap-2">
            <span className="text-sm font-medium text-muted-foreground mb-1">
              Translate
            </span>
            <GoogleTranslate />
          </div>
        </div>

        <div className="border-t p-4 mt-auto flex items-center justify-between">
          <SheetClose asChild>
            <Link
              href="/login"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">Login / Profile</span>
            </Link>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
