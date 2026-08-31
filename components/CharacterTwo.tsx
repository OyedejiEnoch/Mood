"use client";

import { forwardRef } from "react";
import type { RefObject } from "react";

/** Act II scene. MARNHON's clean bounce plays as a looping background video
 *  (locked-off camera → only he dances). Scroll drives the text, not the
 *  playback. Root forwarded for the break fade-in. */
const CharacterTwo = forwardRef<
  HTMLDivElement,
  { videoRef: RefObject<HTMLVideoElement | null> }
>(function CharacterTwo({ videoRef }, ref) {
  return (
    <div ref={ref} className="scene scene-two">
      <video
        ref={videoRef}
        className="a2-video"
        muted
        loop
        playsInline
        preload="auto"
        poster="/char/char2-scene.jpg"
      >
        <source src="/char/char2.mp4" type="video/mp4" />
      </video>
      <div className="a2-scrim" />
    </div>
  );
});

export default CharacterTwo;
