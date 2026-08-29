"use client";

import { forwardRef } from "react";
import type { RefObject } from "react";

/** Act III scene. MILES grooves outside the barbershop as a looping video
 *  (locked-off camera). Character sits right, text lives left. This scene
 *  slides UP from below during break 2 — the parent drives its transform. */
const CharacterThree = forwardRef<
  HTMLDivElement,
  { videoRef: RefObject<HTMLVideoElement | null> }
>(function CharacterThree({ videoRef }, ref) {
  return (
    <div ref={ref} className="scene scene-three">
      <video
        ref={videoRef}
        className="a3-video"
        muted
        loop
        playsInline
        preload="auto"
        poster="/char/char3-scene.jpg"
      >
        <source src="/char/char3.mp4" type="video/mp4" />
      </video>
      <div className="a3-scrim" />
      <div className="grain" />
      <div className="vignette" />
    </div>
  );
});

export default CharacterThree;
