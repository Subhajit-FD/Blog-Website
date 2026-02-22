"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const Loader = () => {
  const [showLoader, setShowLoader] = useState(true);
  const containerRef = useRef(null);
  const topHalfRef = useRef(null);
  const bottomHalfRef = useRef(null);
  const contentRef = useRef(null);
  const textRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const counter = { val: 0 };

      const tl = gsap.timeline({
        onComplete: () => {
          setShowLoader(false);
        },
      });

      // 1. Progress count and bar to 100% in 2 seconds
      tl.to(counter, {
        val: 100,
        duration: 2,
        ease: "power2.inOut",
        onUpdate: () => {
          if (textRef.current) {
            textRef.current.innerText = Math.round(counter.val) + "%";
          }
          if (progressRef.current) {
            progressRef.current.style.width = Math.round(counter.val) + "%";
          }
        },
      })
        // 2. Fade out the text and progress bar
        .to(contentRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        })
        // 3. Split the background and move the halves up and down
        .to(
          topHalfRef.current,
          {
            y: "-100%",
            duration: 0.8,
            ease: "power4.inOut",
          },
          "split",
        )
        .to(
          bottomHalfRef.current,
          {
            y: "100%",
            duration: 0.8,
            ease: "power4.inOut",
          },
          "split",
        );
    });

    return () => ctx.revert();
  }, []);

  if (!showLoader) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-9999 pointer-events-none flex flex-col"
    >
      {/* Top Half */}
      <div
        ref={topHalfRef}
        className="w-full h-1/2 bg-background will-change-transform"
      ></div>
      {/* Bottom Half */}
      <div
        ref={bottomHalfRef}
        className="w-full h-1/2 bg-background will-change-transform"
      ></div>

      {/* Content (Text + Progress Bar) overlay placed in the center */}
      <div
        ref={contentRef}
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto"
      >
        <p
          ref={textRef}
          className="text-6xl font-black text-primary mb-4 tracking-tighter"
        >
          0%
        </p>
        <div className="w-64 max-w-[80vw] h-1 bg-muted rounded-full overflow-hidden">
          <div ref={progressRef} className="h-full bg-primary w-0"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
