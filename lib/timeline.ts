import { ACT_ONE, ACT_TWO, ACT_THREE, ACT_FOUR } from "@/data/story";

/* Normalised scroll timeline (0 → 1) for the whole pinned experience.
   Four acts, three breaks:
   intro · Act I (KID) · break1 (horizontal wipe) · Act II (MARNHON) ·
   break2 (vertical rise) · Act III (MILES) · break3 (zoom dissolve) ·
   Act IV (the alley — finale) · outro */
export const T = {
  introEnd: 0.03,
  a1: [0.03, 0.26] as [number, number],
  brk1: [0.26, 0.34] as [number, number],
  a2: [0.34, 0.52] as [number, number],
  brk2: [0.52, 0.6] as [number, number],
  a3: [0.6, 0.8] as [number, number],
  brk3: [0.8, 0.87] as [number, number],
  a4: [0.87, 0.99] as [number, number],
  outroStart: 0.99,
};

export function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
export function mapRange(v: number, a: number, b: number) {
  return clamp01((v - a) / (b - a));
}

/** even [start,end] window for each beat inside an act's window */
function beatWindows(count: number, [s, e]: [number, number]) {
  const w = (e - s) / count;
  return Array.from(
    { length: count },
    (_, i) => [s + i * w, s + (i + 1) * w] as [number, number]
  );
}

export const A1_WINDOWS = beatWindows(ACT_ONE.beats.length, T.a1);
export const A2_WINDOWS = beatWindows(ACT_TWO.beats.length, T.a2);
export const A3_WINDOWS = beatWindows(ACT_THREE.beats.length, T.a3);
export const A4_WINDOWS = beatWindows(ACT_FOUR.beats.length, T.a4);

export function windowsFor(act: 1 | 2 | 3 | 4) {
  return act === 1
    ? A1_WINDOWS
    : act === 2
    ? A2_WINDOWS
    : act === 3
    ? A3_WINDOWS
    : A4_WINDOWS;
}

export type Located =
  | { zone: "intro" }
  | { zone: "break"; index: 1 | 2 | 3; local: number }
  | { zone: "beat"; act: 1 | 2 | 3 | 4; index: number; local: number };

function inBeat(p: number, act: 1 | 2 | 3 | 4): Located {
  const wins = windowsFor(act);
  const i = wins.findIndex(([s, e]) => p >= s && p <= e);
  const idx = i === -1 ? wins.length - 1 : i;
  return { zone: "beat", act, index: idx, local: mapRange(p, wins[idx][0], wins[idx][1]) };
}

/** which beat/zone the current scroll progress is in */
export function locate(p: number): Located {
  if (p < T.introEnd) return { zone: "intro" };
  if (p <= T.a1[1]) return inBeat(p, 1);
  if (p < T.a2[0]) return { zone: "break", index: 1, local: mapRange(p, T.brk1[0], T.brk1[1]) };
  if (p <= T.a2[1]) return inBeat(p, 2);
  if (p < T.a3[0]) return { zone: "break", index: 2, local: mapRange(p, T.brk2[0], T.brk2[1]) };
  if (p <= T.a3[1]) return inBeat(p, 3);
  if (p < T.a4[0]) return { zone: "break", index: 3, local: mapRange(p, T.brk3[0], T.brk3[1]) };
  return inBeat(p, 4);
}
