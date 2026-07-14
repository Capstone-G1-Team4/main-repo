"use client";

import { useEffect, useRef, useState } from "react";

/**
 * AnimateOnScroll — wraps children and triggers a CSS animation when
 * the element scrolls into view. Uses IntersectionObserver for
 * performance (no scroll event listeners).
 *
 * Props:
 *   animation  — "up" | "left" | "right" | "scale" | "fade" (default: "up")
 *   delay      — delay in ms before animation starts (default: 0)
 *   threshold  — IntersectionObserver threshold (default: 0.15)
 *   className  — additional classes on the wrapper div
 *   once       — if true, animation fires only once (default: true)
 */
export default function AnimateOnScroll({
  children,
  animation = "up",
  delay = 0,
  threshold = 0.15,
  className = "",
  once = true,
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  const animClass = {
    up: isVisible ? "scroll-visible" : "scroll-hidden",
    left: isVisible ? "scroll-visible-left" : "scroll-hidden-left",
    right: isVisible ? "scroll-visible-right" : "scroll-hidden-right",
    scale: isVisible ? "scroll-visible-scale" : "scroll-hidden-scale",
    fade: isVisible ? "scroll-visible" : "scroll-hidden",
  }[animation];

  return (
    <div
      ref={ref}
      className={`${animClass} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
