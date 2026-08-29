"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

/** Boots Lenis, drives it from the GSAP ticker, and keeps ScrollTrigger
 *  in sync. Returns a ref to the Lenis instance for programmatic scrollTo. */
export function useLenis(enabled = true) {
  const ref = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3), // ease-out cubic
      smoothWheel: !reduce,
      syncTouch: false,
      wheelMultiplier: 1,
    });
    ref.current = lenis;
    if (process.env.NODE_ENV !== "production")
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      ref.current = null;
    };
  }, [enabled]);

  return ref;
}
