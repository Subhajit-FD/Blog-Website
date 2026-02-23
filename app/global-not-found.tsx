// Import global styles and fonts
import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/global/ThemeToggle";
import { ThemeProvider } from "@/components/theme-provider";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={inter.className}>
      <body className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Theme Toggle mapped to top right */}

          <main className="m-auto flex flex-col items-center gap-[30px] text-center">
            {/* Animated Eyes */}
            <div className="flex justify-center gap-1">
              <div className="grid h-[80px] w-[80px] place-items-center rounded-full bg-[#faca2e]">
                <div className="h-[30px] w-[30px] animate-[movePupil_2s_infinite_ease-in-out] rounded-full bg-[#050505]"></div>
              </div>
              <div className="grid h-[80px] w-[80px] place-items-center rounded-full bg-[#faca2e]">
                {/* To reverse the animation of the right eye, you can add `animation-direction: reverse` to its specific class or style if needed */}
                <div className="h-[30px] w-[30px] animate-[movePupil_2s_infinite_ease-in-out] rounded-full bg-[#050505]"></div>
              </div>
            </div>

            {/* Heading Section */}
            <div>
              <h1 className="text-[30px] font-medium capitalize text-[#faca2e] sm:text-[36px]">
                Looks like you're lost
              </h1>
              <p className="mt-2.5 text-[22px] font-light sm:text-[26px]">
                404 error
              </p>
            </div>

            {/* Back to Home Button */}
            <Link
              href="/"
              aria-label="back to home"
              title="back to home"
              className="rounded-[15px] border border-[#faca2e] px-[24px] py-[12px] text-[16px] font-light capitalize text-inherit shadow-[0px_7px_0px_-2px_#faca2e] transition-all duration-300 ease-in-out hover:bg-[#faca2e] hover:text-white hover:shadow-none sm:px-[30px] sm:py-[15px] sm:text-[18px]"
            >
              back to home
            </Link>
          </main>

          {/* Custom Keyframes for the Pupil Animation */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @keyframes movePupil {
              0%, 100% { transform: translate(0, 0); }
              25% { transform: translate(-10px, -10px); }
              50% { transform: translate(10px, 10px); }
              75% { transform: translate(-10px, 10px); }
            }
          `,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
