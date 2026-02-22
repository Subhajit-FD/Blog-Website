import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import PageTransition from "@/components/animations/PageTransition";
import { getSettings } from "@/actions/settings.actions";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const res = await getSettings();
  const settings = res.data;
  const pageTransitionEnabled =
    settings?.animations?.pageTransition !== false &&
    settings?.animations?.global !== false;

  const content = (
    <>
      <Header />
      <main className="flex-1 bg-background">{children}</main>
      <Footer />
    </>
  );

  return (
    // The min-h-screen and flex-col ensures the footer is pushed to the bottom if the page is short!
    <div className="min-h-screen flex flex-col bg-slate-50">
      {pageTransitionEnabled ? (
        <PageTransition>{content}</PageTransition>
      ) : (
        content
      )}
    </div>
  );
}
