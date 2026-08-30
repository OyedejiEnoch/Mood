import { ACT_ONE, ACT_TWO, ACT_THREE, ACT_FOUR } from "@/data/story";

/* Normalised scroll timeline (0 → 1). Every beat gets the SAME scroll
   distance (BEAT_W) regardless of which act it's in, so the reading pace is
   even everywhere; breaks and intro/outro take fixed slices. */
const ACTS = [ACT_ONE, ACT_TWO, ACT_THREE, ACT_FOUR];
const INTRO = 0.02;
const BREAK = 0.055; // each of the 3 chapter breaks
const OUTRO = 0.01;
const TOTAL_BEATS = ACTS.reduce((n, a) => n + a.beats.length, 0);
const BEAT_W = (1 - INTRO - OUTRO - BREAK * (ACTS.length - 1)) / TOTAL_BEATS;

// lay windows out sequentially: intro · act1 · break1 · act2 · … · act4 · outro
const actWindows: [number, number][][] = [];
const actRange: [number, number][] = [];
const breakRange: [number, number][] = [];
{
  let cur = INTRO;
  ACTS.forEach((a, i) => {
    const start = cur;
    const wins: [number, number][] = [];
    a.beats.forEach(() => {
      wins.push([cur, cur + BEAT_W]);
      cur += BEAT_W;
    });
    actWindows.push(wins);
    actRange.push([start, cur]);
    if (i < ACTS.length - 1) {
      breakRange.push([cur, cur + BREAK]);
      cur += BREAK;
    }
  });
}

export const A1_WINDOWS = actWindows[0];
export const A2_WINDOWS = actWindows[1];
export const A3_WINDOWS = actWindows[2];
export const A4_WINDOWS = actWindows[3];

export const T = {
  introEnd: INTRO,
  a1: actRange[0],
  brk1: breakRange[0],
  a2: actRange[1],
  brk2: breakRange[1],
  a3: actRange[2],
  brk3: breakRange[2],
  a4: actRange[3],
  outroStart: actRange[3][1],
};

export function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
export function mapRange(v: number, a: number, b: number) {
  return clamp01((v - a) / (b - a));
}

export function windowsFor(act: 1 | 2 | 3 | 4) {
  return actWindows[act - 1];
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
