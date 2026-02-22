"use client";

import { useEffect, useState } from "react";
import LivePreviewTemplate from "@/components/preview/LivePreviewTemplate";
import { Loader2 } from "lucide-react";

export default function LivePreviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Poll for changes in localStorage to update preview in real-time if desired,
    // or just load once. For now, let's load once on mount.
    const loadData = () => {
      try {
        const storedData = localStorage.getItem("blog-live-preview");
        if (storedData) {
          setData(JSON.parse(storedData));
        }
      } catch (e) {
        console.error("Failed to load preview data", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Optional: Listen for storage events to update if multiple tabs are open (bonus)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "blog-live-preview") {
        loadData();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg text-muted-foreground">
          Loading Preview...
        </span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">No Preview Data Found</h1>
        <p className="text-muted-foreground">
          Go back to the editor and click "Live Preview".
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <LivePreviewTemplate data={data} />
    </div>
  );
}
