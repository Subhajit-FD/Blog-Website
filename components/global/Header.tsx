import Link from "next/link";
import { auth } from "@/auth";
import { getSettings } from "@/actions/settings.actions";
import { getPublicCategories } from "@/actions/category.actions";
import { getPublicPosts } from "@/actions/post.actions";

import Navbar from "./Navbar";
import MobileNavbar from "./MobileNavbar";
import HeaderActions from "./HeaderActions";
import Search from "./Search";

export default async function Header() {
  const session = await auth();

  const [settingsRes, categoriesRes, postsRes] = await Promise.all([
    getSettings(),
    getPublicCategories(),
    getPublicPosts(),
  ]);

  const siteData = settingsRes.success ? settingsRes.data : null;
  const categories = categoriesRes.success ? categoriesRes.data : [];
  const posts = postsRes.success ? postsRes.data : [];

  return (
    <header className="w-full border-b bg-white dark:bg-zinc-950 sticky top-0 z-50">
      <div className="container h-16 flex items-center justify-between px-4 md:px-8">
        {/* Mobile Navigation Trigger */}
        <div className="lg:hidden">
          <MobileNavbar categories={categories} />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-5">
          <Link href="/" className="font-bold text-2xl tracking-wide uppercase">
            {siteData?.siteName || "Blog"}
          </Link>
          <div className="hidden lg:block">
            <Search />
          </div>
        </div>

        {/* Desktop Navigation Menu */}
        <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2">
          <Navbar categories={categories} posts={posts} />
        </div>

        {/* Right Side Actions */}
        <HeaderActions user={session?.user} />
      </div>
    </header>
  );
}
