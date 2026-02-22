"use client";

import { ImageKitProvider as Provider } from "@imagekit/next";

export default function ImageKitProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // This function is automatically called by ImageKit when an upload is requested
  /*
  const authenticator = async () => {
    try {
      const response = await fetch("/api/imagekit/auth");
      if (!response.ok) {
        throw new Error("Failed to authenticate with ImageKit");
      }
      return response.json();
    } catch (error) {
      throw new Error("Authentication request failed");
    }
  };
  */

  return (
    <Provider
      // publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}
      urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
      // authenticator={authenticator}
    >
      {children}
    </Provider>
  );
}
