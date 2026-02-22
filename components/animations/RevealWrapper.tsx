"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function RevealWrapper({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".reveal-item", {
      y: 30,
      opacity: 0,
      stagger: 0.15,
      duration: 1,
      ease: "expo.out",
    });
  }, { scope: container });

  return <div ref={container}>{children}</div>;
}