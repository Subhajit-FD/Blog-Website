"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronUp, ChevronDown } from "lucide-react";
import NavDropdown from "./NavDropdown";

interface NavbarProps {
  categories: any[];
  posts: any[];
}

export default function Navbar({ categories, posts }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const onHover = () => {
    setIsOpen(true);
  };
  const onLeave = () => {
    setIsOpen(false);
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(path);
  };

  const getLinkClasses = (path: string) => {
    return ` transition-colors hover:text-primary ${
      isActive(path)
        ? "text-primary font-semibold"
        : "text-muted-foreground font-medium"
    }`;
  };

  return (
    <nav className="relative">
      <ul className="flex items-center gap-6 text-sm">
        <li>
          <Link href="/" className={getLinkClasses("/")}>
            Home
          </Link>
        </li>
        <li
          className="relative group cursor-pointer"
          onMouseEnter={onHover}
          onMouseLeave={onLeave}
        >
          <Link
            href="/category/all"
            className={`flex items-center gap-1 transition-colors hover:text-primary ${
              isActive("/category")
                ? "text-primary font-semibold"
                : "text-muted-foreground font-medium"
            }`}
          >
            Categories{" "}
            {isOpen ? (
              <ChevronUp size={14} className="mt-[2px]" />
            ) : (
              <ChevronDown size={14} className="mt-[2px]" />
            )}
          </Link>
          {isOpen && (
            <NavDropdown
              categories={categories}
              posts={posts}
              onEnter={() => setIsOpen(true)}
              onLeave={onLeave}
            />
          )}
        </li>
        <li>
          <Link href="/about" className={getLinkClasses("/about")}>
            About
          </Link>
        </li>
        <li>
          <Link href="/contact" className={getLinkClasses("/contact")}>
            Contact
          </Link>
        </li>
      </ul>
    </nav>
  );
}
