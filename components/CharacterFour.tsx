"use client";

import { forwardRef } from "react";
import type { RefObject } from "react";

/** Act IV — the finale. An empty starlit alley (graffiti wall, bikes,
 *  glowing window) plays as a slow looping video. No character; the text
 *  closes the story on the left. Arrives via a zoom-dissolve in break 3. */
const CharacterFour = forwardRef<
  HTMLDivElement,
  { videoRef: RefObject<HTMLVideoElement | null> }
>(function CharacterFour({ videoRef }, ref) {
  return (
    <div ref={ref} className="scene scene-four">
      <video
        ref={videoRef}
        className="a4-video"
        muted
        loop
        playsInline
        preload="auto"
        poster="/char/char4-scene.jpg"
      >
        <source src="/char/char4.mp4" type="video/mp4" />
      </video>
      <div className="a4-scrim" />
      <div className="grain" />
      <div className="vignette" />
    </div>
  );
});

export default CharacterFour;
