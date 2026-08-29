"use client";

import { forwardRef, useEffect, useRef } from "react";

/** Act I scene. The blurred courtyard sits behind a sharp character layer
 *  that leans toward the pointer with spring interpolation (not instant),
 *  so KID feels like he's tracking you. Root is forwarded so the parent
 *  can drive the act-break exit. */
const CharacterOne = forwardRef<HTMLDivElement>(function CharacterOne(_, ref) {
  const plateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let raf = 0;
    const start = performance.now();

    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const loop = (now: number) => {
      // spring-ish easing toward the pointer
      cur.x += (target.x - cur.x) * 0.09;
      cur.y += (target.y - cur.y) * 0.09;
      // gentle autonomous "camera" drift so the scene feels alive at rest
      const t = (now - start) / 1000;
      const px = cur.x + Math.sin(t * 0.35) * 0.14;
      const py = cur.y + Math.cos(t * 0.28) * 0.12;
      const push = 1.14 + Math.sin(t * 0.22) * 0.006;

      // single original courtyard layer, but pushed hard: big cursor
      // translate + a real 3D tilt against the scene's perspective, so the
      // whole wall banks toward the pointer. One layer = no ghosting; the
      // extra scale overscan keeps the edges out of frame.
      if (plateRef.current) {
        plateRef.current.style.transform =
          `translate3d(${px * -34}px, ${py * -22}px, 0) ` +
          `rotateY(${px * 5.5}deg) rotateX(${-py * 4}deg) scale(${push})`;
      }
      raf = requestAnimationFrame(loop);
    };

    if (!reduce && fine) {
      window.addEventListener("pointermove", onMove, { passive: true });
      raf = requestAnimationFrame(loop);
    }
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="scene scene-one">
      <div ref={plateRef} className="a1-plate" />
      <div className="a1-scrim" />
      <div className="grain" />
      <div className="vignette" />
    </div>
  );
});

export default CharacterOne;
