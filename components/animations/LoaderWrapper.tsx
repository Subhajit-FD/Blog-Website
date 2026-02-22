"use client";

import { useEffect, useState } from "react";
import { getSettings } from "@/actions/settings.actions";
import Loader from "@/components/animations/Loader";

export default function LoaderWrapper() {
  const [shouldShow, setShouldShow] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      const res = await getSettings();
      if (
        res.success &&
        res.data?.animations?.loader !== false &&
        res.data?.animations?.global !== false
      ) {
        setShouldShow(true);
      }
      setIsLoaded(true);
    }
    fetchSettings();
  }, []);

  if (!isLoaded) return null; // Avoid rendering until settings are fetched
  if (!shouldShow) return null;

  return <Loader />;
}
