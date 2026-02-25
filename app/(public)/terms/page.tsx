import { getSettings } from "@/actions/settings.actions";
import { redirect } from "next/navigation";

export default async function TermsPage() {
  const response = await getSettings();
  const settings = response.success ? response.data : null;

  if (!settings?.termsContent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4 font-serif italic text-primary">
          Terms of Service
        </h1>
        <p className="text-muted-foreground">
          Terms and conditions are coming soon. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
      <div className="mb-12">
        <h1 className="text-5xl font-bold tracking-tight font-serif italic text-primary mb-4">
          Terms of Service
        </h1>
        <p className="text-muted-foreground">
          Last updated: {new Date(settings.updatedAt).toLocaleDateString()}
        </p>
      </div>
      <div
        className="prose prose-slate dark:prose-invert max-w-none 
          prose-headings:font-serif prose-headings:italic prose-p:leading-relaxed"
        dangerouslySetInnerHTML={{
          __html: settings.termsContent.replace(/\n/g, "<br/>"),
        }}
      />
    </div>
  );
}
