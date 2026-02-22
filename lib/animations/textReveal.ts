import gsap from "gsap";

export const animateTextReveal = (
  containerRef: React.RefObject<HTMLElement | null>, 
  targetClass: string
) => {
  // GSAP context automatically cleans up animations on unmount!
  let ctx = gsap.context(() => {
    gsap.from(targetClass, {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out",
    });
  }, containerRef);

  return () => ctx.revert(); // Cleanup function
};