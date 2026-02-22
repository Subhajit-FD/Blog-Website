"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import gsap from "gsap";
import { getSettings } from "@/actions/settings.actions";

const PageTransition = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const overlayRef = useRef(null);
  const blockRef = useRef(null);
  const isTransitioning = useRef(false);

  useEffect(() => {
    const createBlocks = () => {
      if (!overlayRef.current) return;
      overlayRef.current.innerHTML = "";
      blockRef.current = [];

      for (let i = 0; i < 20; i++) {
        const block = document.createElement("div");
        block.className =
          "block flex-1 h-full bg-background transform scaleX-0 transform-origin-left";
        overlayRef.current.appendChild(block);
        blockRef.current.push(block);
      }
    };

    createBlocks();

    gsap.set(blockRef.current, { scaleX: 0, transformOrigin: "left" });

    const coverpage = (url) => {
      const tl = gsap.timeline({ onComplete: () => router.push(url) });

      tl.to(blockRef.current, {
        scaleX: 1,
        duration: 0.4,
        stagger: 0.02,
        ease: "power2.out",
        transformOrigin: "left",
      });
    };

    const revealpage = () => {
      gsap.set(blockRef.current, { scaleX: 1, transformOrigin: "right" });

      gsap.to(blockRef.current, {
        scaleX: 0,
        duration: 0.4,
        stagger: 0.02,
        ease: "power2.out",
        transformOrigin: "right",
        onComplete: () => (isTransitioning.current = false),
      });
    };

    revealpage();

    const handelRouteChange = (url) => {
      if (isTransitioning.current) return;
      isTransitioning.current = true;
      coverpage(url);
    };

    const links = document.querySelectorAll('a[href^="/"]');
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const href = e.currentTarget.href;
        const url = new URL(href).pathname;
        if (url !== pathname) handelRouteChange(url);
      });
    });

    return () => {
      links.forEach((link) => {
        link.removeEventListener("click", handelRouteChange);
      });
    };
  }, [router, pathname]);

  return (
    <>
      <div
        ref={overlayRef}
        className="transition-overlay fixed top-0 left-0 w-full h-full flex pointer-events-none z-50"
      ></div>
      {children}
    </>
  );
};

export default PageTransition;
