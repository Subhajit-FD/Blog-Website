import Link from "next/link";
import Image from "next/image";
import { getSettings } from "@/actions/settings.actions";
import { getPopularTags } from "@/actions/tag.actions";
import { Mail } from "lucide-react";

export default async function Footer() {
  const [settingsRes, tagsRes] = await Promise.all([
    getSettings(),
    getPopularTags(8),
  ]);

  const siteData = settingsRes.success ? settingsRes.data : null;
  const popularTags = tagsRes.success ? tagsRes.data : [];

  return (
    <footer className="bg-background border-t mt-auto text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* 1. Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              {siteData?.logoUrl ? (
                <div className="relative w-32 h-10">
                  <Image
                    src={siteData.logoUrl}
                    alt="Brand Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <h3 className="font-bold text-xl">
                  {siteData?.siteName || "CMS 3.0"}
                </h3>
              )}
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              {siteData?.siteDescription ||
                "Delivering high-quality insights, stories, and tutorials straight to your screen."}
            </p>
          </div>

          {/* 2. Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-primary transition-colors"
                >
                  Articles
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary transition-colors"
                >
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Popular Searches */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Popular Searches</h4>
            {popularTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag: any) => (
                  <Link
                    key={tag.name}
                    href={`/search?q=${encodeURIComponent(tag.name)}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No trending tags available.
              </p>
            )}
          </div>

          {/* 4. Connect */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Connect</h4>
            <div className="flex flex-wrap gap-3">
              {siteData?.shareOptions && siteData.shareOptions.length > 0 ? (
                siteData.shareOptions.map((social: any) => (
                  <a
                    key={social.platform || social.name}
                    href={social.baseUrl || social.urlBase || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center justify-center w-9 h-9 rounded-full bg-muted shadow-sm hover:shadow-md hover:bg-primary/10"
                    title={social.platform || social.name}
                  >
                    {social.icon &&
                    (social.icon.startsWith("<svg") ||
                      social.icon.startsWith("path")) ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                        dangerouslySetInnerHTML={{
                          __html: social.icon.startsWith("<svg")
                            ? social.icon.replace(/<svg[^>]*>|<\/svg>/g, "")
                            : `<path d="${social.icon.replace(/^path\s*d=["']|["']$/g, "")}" />`,
                        }}
                      />
                    ) : (
                      <span className="text-xs font-bold w-5 h-5 flex items-center justify-center">
                        ?
                      </span>
                    )}
                  </a>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No connections available.
                </p>
              )}
            </div>

            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                Reach out to us
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {siteData?.siteName || "CMS 3.0"}. All
            rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Link
              href="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
