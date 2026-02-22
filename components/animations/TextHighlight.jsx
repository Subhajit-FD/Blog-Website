"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getSettings } from "@/actions/settings.actions";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export default function TextHighlight({ children, className }) {
  const containerRef = useRef(null);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    async function checkSettings() {
      const res = await getSettings();
      if (
        res.success &&
        (res.data?.animations?.textHighlight === false ||
          res.data?.animations?.global === false)
      ) {
        setIsEnabled(false);
      }
    }
    checkSettings();
  }, []);

  useEffect(() => {
    if (!isEnabled || !containerRef.current) return;

    const element = containerRef.current;

    // Helper function to wrap words in spans
    const wrapWords = (node) => {
      // If validation for 'word' class prevents double wrapping on re-renders
      if (node.nodeType === 1 && node.classList.contains("word")) return;

      if (node.nodeType === 3) {
        // Text node
        const text = node.nodeValue;
        // If it's just whitespace, leave it alone
        if (!text.trim()) return;

        // Split by whitespace but keep the whitespace
        const parts = text.split(/(\s+)/);
        const fragment = document.createDocumentFragment();

        parts.forEach((part) => {
          if (part.trim() === "") {
            // It's whitespace, just append as text node
            fragment.appendChild(document.createTextNode(part));
          } else {
            // It's a word, wrap it
            const span = document.createElement("span");
            span.textContent = part;
            span.className = "word inline-block opacity-30 transition-colors"; // Initial state
            // Inline-block might mess up flow slightly if not careful, but usually fine for words.
            fragment.appendChild(span);
          }
        });

        node.parentNode.replaceChild(fragment, node);
      } else if (node.nodeType === 1) {
        // Element node, traverse children
        // Use Array.from to create a static copy, as traversing live childNodes while modifying them matches nothing good
        Array.from(node.childNodes).forEach(wrapWords);
      }
    };

    // 1. Wrap words in the DOM
    // We run this every time children changes.
    // Since we use dangerouslySetInnerHTML in the render,
    // the DOM is fresh from React's perspective on each prop change.
    wrapWords(element);

    // 2. Setup Animation
    const words = element.querySelectorAll(".word");

    if (words.length > 0) {
      const ctx = gsap.context(() => {
        gsap.to(words, {
          opacity: 1,
          color: "inherit",
          stagger: 0.01, // Faster stagger for long text
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            end: "bottom 30%", // Adjusted end for better reading flow
            scrub: 1, // Smooth scrub
          },
        });
      }, containerRef);

      return () => ctx.revert();
    }
  }, [children, isEnabled]);

  if (!isEnabled) {
    return (
      <div
        className={cn("text-highlight-container-static", className)}
        dangerouslySetInnerHTML={{ __html: children }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("text-highlight-container", className)}
      // Render HTML content safely
      dangerouslySetInnerHTML={{ __html: children }}
    />
  );
}
