"use client";

import { forwardRef } from "react";
import type { RefObject } from "react";

/** Act I hero. KID's idle nod plays as a clean looping background video
 *  (locked-off camera, composed on the right with the courtyard open on the
 *  left for the conversation). No cursor, no scrub — just the loop. Root is
 *  forwarded so the parent can drive the act-break exit. */
const CharacterOne = forwardRef<
  HTMLDivElement,
  { videoRef: RefObject<HTMLVideoElement | null> }
>(function CharacterOne({ videoRef }, ref) {
  return (
    <div ref={ref} className="scene scene-one">
      <video
        ref={videoRef}
        className="a1-video"
        muted
        loop
        playsInline
        preload="auto"
        poster="/char/char1-scene.jpg"
      >
        <source src="/char/char1.mp4" type="video/mp4" />
      </video>
      <div className="a1-scrim" />
    </div>
  );
});

export default CharacterOne;
