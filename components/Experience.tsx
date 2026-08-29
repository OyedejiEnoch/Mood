"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/lib/useLenis";
import { ACT_ONE, ACT_TWO, ACT_THREE, ACT_FOUR, resolveText, type Choice } from "@/data/story";
import { A1_WINDOWS, T, clamp01, locate, mapRange, windowsFor } from "@/lib/timeline";
import CharacterOne from "./CharacterOne";
import CharacterTwo from "./CharacterTwo";
import CharacterThree from "./CharacterThree";
import CharacterFour from "./CharacterFour";
import StoryDeck, { type DeckBeat } from "./StoryDeck";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const TOTAL_VH = 1320;

export default function Experience() {
  const lenisRef = useLenis(true);
  const [ready, setReady] = useState(false);

  // dom refs
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sceneOneRef = useRef<HTMLDivElement>(null);
  const sceneTwoRef = useRef<HTMLDivElement>(null);
  const sceneThreeRef = useRef<HTMLDivElement>(null);
  const sceneFourRef = useRef<HTMLDivElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const video3Ref = useRef<HTMLVideoElement>(null);
  const video4Ref = useRef<HTMLVideoElement>(null);
  const railFillRef = useRef<HTMLDivElement>(null);
  const railCountRef = useRef<HTMLSpanElement>(null);
  const break1Ref = useRef<HTMLDivElement>(null);
  const break2Ref = useRef<HTMLDivElement>(null);
  const break3Ref = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  // engine state (imperative, not React)
  const branchRef = useRef<Record<string, string>>({});
  const lastDeckKeyRef = useRef<string>("");
  const currentBeatIdRef = useRef<string>("a1-intro");
  const lastProgressRef = useRef(0);
  const renderRef = useRef<(p: number) => void>(() => {});
  const stRef = useRef<ScrollTrigger | null>(null);

  const [deckBeat, setDeckBeat] = useState<DeckBeat | null>(null);

  // choice beats gate the scroll: you can't pass one until you pick.
  // GATES = ordered {beat id, gate progress} for every beat with choices.
  const GATES = useMemo(() => {
    const arr: { id: string; gateP: number }[] = [];
    for (const a of [ACT_ONE, ACT_TWO, ACT_THREE, ACT_FOUR]) {
      const wins = windowsFor(a.id);
      a.beats.forEach((b, i) => {
        if (b.choices && b.choices.length) {
          const [s, e] = wins[i];
          arr.push({ id: b.id, gateP: s + (e - s) * 0.42 });
        }
      });
    }
    return arr;
  }, []);
  const answeredRef = useRef<Set<string>>(new Set());
  const gateCeil = useCallback(() => {
    for (const g of GATES) if (!answeredRef.current.has(g.id)) return g.gateP;
    return 1;
  }, [GATES]);

  // ---- build the deck payload for a given progress ----
  const buildDeck = useCallback((p: number): DeckBeat | null => {
    const loc = locate(p);
    if (loc.zone === "break") return null;
    const act = loc.zone === "intro" ? 1 : loc.act;
    const index = loc.zone === "intro" ? 0 : loc.index;
    const a =
      act === 1 ? ACT_ONE : act === 2 ? ACT_TWO : act === 3 ? ACT_THREE : ACT_FOUR;
    const b = a.beats[index];
    currentBeatIdRef.current = b.id;
    const branchSig = Object.values(branchRef.current).join(",");
    return {
      key: `${a.id}-${index}-${branchSig}`,
      label: b.label,
      text: resolveText(b.text, branchRef.current),
      choices: b.choices,
      act: a.id,
      side: a.textSide,
    };
  }, []);

  // ---- master render, driven by scroll progress ----
  const render = useCallback(
    (pIn: number) => {
      let p = pIn;

      // ---- scroll gate: hold at an unanswered choice beat ----
      const ceil = gateCeil();
      if (p > ceil) {
        const st = stRef.current;
        const lenis = lenisRef.current;
        if (st && lenis) {
          lenis.scrollTo(st.start + ceil * (st.end - st.start), {
            immediate: true,
            force: true,
          });
        }
        p = ceil;
      }
      lastProgressRef.current = p;

      // Act I exits through break 1 (horizontal wipe)
      const exit1 = mapRange(p, T.brk1[0], T.brk1[1]);
      if (sceneOneRef.current) {
        sceneOneRef.current.style.opacity = `${1 - exit1}`;
        sceneOneRef.current.style.transform = `translate3d(${exit1 * 11}vw,0,0) scale(${1 - exit1 * 0.05})`;
        sceneOneRef.current.style.filter = `blur(${exit1 * 9}px)`;
      }

      // Act II rises in during break 1, lifts away up during break 2
      const enter2 = mapRange(p, T.brk1[0] + 0.01, T.brk1[1]);
      const exit2 = mapRange(p, T.brk2[0], T.brk2[1]);
      if (sceneTwoRef.current) {
        sceneTwoRef.current.style.opacity = `${enter2 * (1 - exit2)}`;
        sceneTwoRef.current.style.transform = `translate3d(0, ${-exit2 * 16}vh, 0) scale(${1.06 - enter2 * 0.06})`;
      }

      // Act III slides UP through break 2, then fades/pushes back in break 3
      const rise3 = mapRange(p, T.brk2[0], T.brk2[1]);
      const exit3 = mapRange(p, T.brk3[0], T.brk3[1]);
      if (sceneThreeRef.current) {
        sceneThreeRef.current.style.transform = `translate3d(0, ${(1 - rise3) * 100}%, 0) scale(${1 + exit3 * 0.06})`;
        sceneThreeRef.current.style.opacity = `${1 - exit3}`;
      }

      // Act IV zoom-dissolves in through break 3 (the finale arrives)
      const enter4 = mapRange(p, T.brk3[0], T.brk3[1]);
      if (sceneFourRef.current) {
        sceneFourRef.current.style.opacity = `${enter4}`;
        sceneFourRef.current.style.transform = `scale(${1.28 - enter4 * 0.28})`;
      }

      // videos play on their own; scroll only gates play/pause
      const v2 = video2Ref.current;
      if (v2) {
        if (p > 0.32 && p < 0.6 && v2.paused) v2.play().catch(() => {});
        else if ((p <= 0.3 || p >= 0.62) && !v2.paused) v2.pause();
      }
      const v3 = video3Ref.current;
      if (v3) {
        if (p > 0.56 && p < 0.86 && v3.paused) v3.play().catch(() => {});
        else if ((p <= 0.54 || p >= 0.88) && !v3.paused) v3.pause();
      }
      const v4 = video4Ref.current;
      if (v4) {
        if (p > 0.79 && v4.paused) v4.play().catch(() => {});
        else if (p < 0.77 && !v4.paused) v4.pause();
      }

      // break word 1 — "MOOD" sweeps horizontally
      if (break1Ref.current) {
        const mid = mapRange(p, T.brk1[0] - 0.02, T.brk1[1] + 0.02);
        const tri = Math.max(0, 1 - Math.abs(mid - 0.5) * 2);
        break1Ref.current.style.opacity = `${tri}`;
        break1Ref.current.style.transform = `translate3d(${(mid - 0.5) * -26}vw,0,0) scale(${0.86 + tri * 0.22})`;
      }
      // break word 2 — "EASE" sweeps vertically (matches the upward slide)
      if (break2Ref.current) {
        const mid = mapRange(p, T.brk2[0] - 0.02, T.brk2[1] + 0.02);
        const tri = Math.max(0, 1 - Math.abs(mid - 0.5) * 2);
        break2Ref.current.style.opacity = `${tri}`;
        break2Ref.current.style.transform = `translate3d(0, ${(mid - 0.5) * 34}vh, 0) scale(${0.86 + tri * 0.22})`;
      }
      // break word 3 — "NIGHT" zooms through (matches the depth dissolve)
      if (break3Ref.current) {
        const mid = mapRange(p, T.brk3[0] - 0.015, T.brk3[1] + 0.015);
        const tri = Math.max(0, 1 - Math.abs(mid - 0.5) * 2);
        break3Ref.current.style.opacity = `${tri}`;
        break3Ref.current.style.transform = `scale(${0.7 + mid * 0.9})`;
      }

      // progress rail
      if (railFillRef.current) {
        railFillRef.current.style.height = `${p * 100}%`;
        railFillRef.current.style.background =
          p > 0.85
            ? "var(--a4-accent)"
            : p > 0.58
            ? "var(--a3-accent)"
            : p > 0.32
            ? "var(--a2-accent)"
            : "var(--a1-accent)";
      }
      if (railCountRef.current)
        railCountRef.current.textContent = String(Math.round(p * 100)).padStart(2, "0");

      // scroll hint
      if (hintRef.current) hintRef.current.style.opacity = p > 0.015 ? "0" : "1";

      // deck (only push to React when the beat actually changes)
      const deck = buildDeck(p);
      const key = deck?.key ?? "null";
      if (key !== lastDeckKeyRef.current) {
        lastDeckKeyRef.current = key;
        setDeckBeat(deck);
      }
    },
    [buildDeck, gateCeil]
  );
  renderRef.current = render;

  // ---- scroll trigger (stage is CSS-fixed, so no pin needed) ----
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: wrapperRef.current!,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => renderRef.current(self.progress),
    });
    stRef.current = st;
    renderRef.current(0);
    return () => {
      st.kill();
      stRef.current = null;
    };
  }, []);

  // ---- readiness: wait for the first Act II video to buffer (+ a hard cap) ----
  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setReady(true);
      ScrollTrigger.refresh();
    };
    const v = video2Ref.current;
    if (v) {
      if (v.readyState >= 3) finish();
      else v.addEventListener("canplay", finish, { once: true });
      v.play().catch(() => {});
    }
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    const t = window.setTimeout(finish, 2500);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // ---- choice handling: clicks scroll the timeline forward ----
  const onChoose = useCallback((c: Choice) => {
    const lenis = lenisRef.current;
    const st = stRef.current;
    if (c.id === "restart") {
      answeredRef.current.clear();
      branchRef.current = {};
      lenis ? lenis.scrollTo(0, { duration: 1.4 }) : window.scrollTo({ top: 0 });
      return;
    }
    // this choice beat is now answered — the scroll gate opens past it
    answeredRef.current.add(currentBeatIdRef.current);
    if (c.set) {
      branchRef.current = { ...branchRef.current, [currentBeatIdRef.current]: c.set };
    }
    if (st) {
      const p = lastProgressRef.current;
      const loc = locate(p);
      let nextP = clamp01(p + 0.06);
      if (loc.zone === "beat") {
        const wins = windowsFor(loc.act);
        nextP = Math.min(0.999, wins[loc.index][1] + 0.006);
      } else if (loc.zone === "intro") {
        nextP = A1_WINDOWS[0][1] + 0.006;
      }
      const y = st.start + nextP * (st.end - st.start);
      lenis ? lenis.scrollTo(y, { duration: 1.1 }) : window.scrollTo({ top: y });
    }
    // reflect any branch change immediately
    renderRef.current(lastProgressRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main>
      {/* fixed cinematic stage */}
      <div className="stage">
        <CharacterOne ref={sceneOneRef} />
        <CharacterTwo ref={sceneTwoRef} videoRef={video2Ref} />
        <CharacterThree ref={sceneThreeRef} videoRef={video3Ref} />
        <CharacterFour ref={sceneFourRef} videoRef={video4Ref} />

        <div ref={break1Ref} className="breakword" aria-hidden>
          <span>Mood</span>
        </div>
        <div ref={break2Ref} className="breakword" aria-hidden>
          <span>Ease</span>
        </div>
        <div ref={break3Ref} className="breakword" aria-hidden>
          <span>Night</span>
        </div>

        <StoryDeck beat={deckBeat} onChoose={onChoose} />
      </div>

      {/* scroll length driver */}
      <div ref={wrapperRef} style={{ height: `${TOTAL_VH}vh` }} aria-hidden />

      {/* progress rail */}
      <div className="rail" aria-hidden>
        <div ref={railFillRef} className="rail-fill" />
      </div>
      <span ref={railCountRef} className="rail-count label" aria-hidden>
        00
      </span>

      {/* scroll hint */}
      <div ref={hintRef} className="scroll-hint label" aria-hidden>
        scroll <span className="dot" />
      </div>

      <Loader ready={ready} />
    </main>
  );
}

function Loader({ ready }: { ready: boolean }) {
  const [hide, setHide] = useState(false);
  useEffect(() => {
    if (ready) {
      const t = setTimeout(() => setHide(true), 400);
      return () => clearTimeout(t);
    }
  }, [ready]);
  return (
    <div className="loader" data-hide={hide}>
      <div className="loader-inner">
        <div className="loader-num">MOOD</div>
        <div className="label" style={{ opacity: 0.6, marginTop: "0.8rem" }}>
          entering the mood
        </div>
      </div>
    </div>
  );
}
