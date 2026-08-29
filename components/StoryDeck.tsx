"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import type { Choice } from "@/data/story";

export type DeckBeat = {
  key: string; // change triggers a transition
  label?: string;
  text: string; // resolved line, may contain *accents* and \n
  choices?: Choice[];
  act: 1 | 2 | 3 | 4;
  side: "left" | "right";
};

type Phase = "idle" | "in" | "out";

function renderAccents(line: string, keyPrefix: string) {
  return line.split("*").map((seg, i) =>
    i % 2 === 1 ? (
      <em className="accent" key={`${keyPrefix}-${i}`}>
        {seg}
      </em>
    ) : (
      <Fragment key={`${keyPrefix}-${i}`}>{seg}</Fragment>
    )
  );
}

export default function StoryDeck({
  beat,
  onChoose,
}: {
  beat: DeckBeat | null;
  onChoose: (c: Choice) => void;
}) {
  const [shown, setShown] = useState<DeckBeat | null>(beat);
  const [phase, setPhase] = useState<Phase>("in");
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => {
    const targetKey = beat?.key ?? null;
    const shownKey = shown?.key ?? null;
    if (targetKey === shownKey) return;
    clearTimers();

    const settleIn = () => {
      setPhase("in");
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setPhase("idle"))
      );
    };

    if (!shown) {
      setShown(beat);
      settleIn();
      return;
    }
    // fade the current line out, then swap in the target
    setPhase("out");
    timers.current.push(
      window.setTimeout(() => {
        setShown(beat);
        if (beat) settleIn();
      }, 300)
    );
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beat?.key]);

  if (!shown) return null;

  return (
    <div
      className="deck"
      data-side={shown.side}
      data-act={shown.act}
      data-phase={phase}
      aria-live="polite"
    >
      {shown.label && <div className="deck-label label">{shown.label}</div>}

      <div
        className={`deck-body ${
          shown.act === 2 ? "statement-display" : "statement-serif"
        }`}
      >
        {shown.text.split("\n").map((line, i) => (
          <span className="deck-line" key={i}>
            <span
              style={{ transitionDelay: phase === "in" ? `${i * 55}ms` : "0ms" }}
            >
              {renderAccents(line, `l${i}`)}
            </span>
          </span>
        ))}
      </div>

      {phase === "idle" && shown.choices && (
        <>
          <div className="choices">
            {shown.choices.map((c) => (
              <button
                key={c.id}
                className="chip"
                type="button"
                onClick={() => onChoose(c)}
              >
                {c.label}
              </button>
            ))}
          </div>
          {shown.choices.length > 1 && (
            <div className="choice-hint label">pick one to continue</div>
          )}
        </>
      )}
    </div>
  );
}
