import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import SessionProvider from "@/components/shared/SessionProvider";
import ImageKitProvider from "@/components/shared/ImageKitProvider";
import { ThemeProvider } from "@/components/theme-provider";
import GoogleAnalytics from "@/components/shared/GoogleAnalytics";
import Loader from "@/components/animations/Loader";
import { getSettings } from "@/actions/settings.actions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const { data: settings } = await getSettings();

  const siteName = settings?.siteName || "BlogZenx";
  const title = settings?.seoTitle || siteName;
  const description =
    settings?.siteDescription || "Modern Blog Platform built with Next.js";

  return {
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: settings?.keywords || "blog, nextjs, react, technology",
    icons: {
      icon: settings?.faviconUrl || "/favicon.ico",
      apple: settings?.appleTouchIconUrl || "/apple-touch-icon.png",
    },
    openGraph: {
      title,
      description,
      siteName,
      type: "website",
      images: settings?.seoImage ? [{ url: settings.seoImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: settings?.twitterHandle || "@blogzenx",
      creator: settings?.twitterHandle || "@blogzenx",
      images: settings?.seoImage ? [settings.seoImage] : [],
    },
  };
}

import NextTopLoader from "nextjs-toploader";

// ---------------------------------------------------------------------------
// Custom tag injection helper
// ---------------------------------------------------------------------------
function renderCustomTag(tag: any, idx: number) {
  const attrs: Record<string, string> = tag.attributes
    ? Object.fromEntries(
        Object.entries(tag.attributes).map(([k, v]) => [k, String(v)]),
      )
    : {};

  switch (tag.tagType) {
    case "link":
      return <link key={idx} {...attrs} />;
    case "script":
      return tag.content ? (
        // eslint-disable-next-line @next/next/no-sync-scripts
        <script
          key={idx}
          {...attrs}
          dangerouslySetInnerHTML={{ __html: tag.content }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-sync-scripts
        <script key={idx} {...attrs} />
      );
    case "meta":
    default:
      return <meta key={idx} {...attrs} />;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settingsRes = await getSettings();
  const settings = settingsRes.success ? settingsRes.data : null;

  const headTags: any[] = (settings?.customTags ?? []).filter(
    (t: any) => t.placement !== "body",
  );
  const bodyTags: any[] = (settings?.customTags ?? []).filter(
    (t: any) => t.placement === "body",
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <head>{headTags.map((tag, i) => renderCustomTag(tag, i))}</head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {settings?.animations?.loader !== false &&
          settings?.animations?.global !== false && <Loader />}
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NextTopLoader color="#7C5DFA" showSpinner={false} />
            <ImageKitProvider>
              {children}
              <GoogleAnalytics
                measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
              />
              <Toaster richColors position="top-center" />
            </ImageKitProvider>
          </ThemeProvider>
        </SessionProvider>
        {bodyTags.map((tag, i) => renderCustomTag(tag, i))}
      </body>
    </html>
  );
}
