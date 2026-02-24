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

  const siteName = settings?.siteName || "CMS 3.0";
  const title = settings?.seoTitle || siteName;
  const description = settings?.siteDescription || "Modern Blog Platform";

  return {
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description,
    icons: {
      icon: settings?.faviconUrl || "/favicon.ico",
      apple: settings?.appleTouchIconUrl,
    },
    openGraph: {
      title,
      description,
      siteName,
      images: settings?.seoImage ? [{ url: settings.seoImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: settings?.seoImage ? [settings.seoImage] : [],
    },
  };
}

import NextTopLoader from "nextjs-toploader";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settingsRes = await getSettings();
  const settings = settingsRes.success ? settingsRes.data : null;

  return (
    <html lang="en" suppressHydrationWarning>
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
      </body>
    </html>
  );
}
