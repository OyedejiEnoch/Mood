/* ============================================================
   STORY DATA  —  edit freely, the engine never needs to change.

   • Each ACT is a list of "beats" (one cinematic message at a time).
   • Wrap a word in *asterisks* to accent it (italic in Act I,
     amber in Act II).
   • Use \n for line breaks inside a statement.
   • `choices` render as clickable chips. A choice may `set` a branch
     key; later beats whose `text` is an object pick the line matching
     the current branch (falling back to "_"). This lets the click
     interaction change the dialogue while scroll still paces it.
   • A user who only scrolls (never clicks) still gets a coherent
     story via the "_" default lines.
   ============================================================ */

export type Choice = { id: string; label: string; set?: string };

export type Beat = {
  id: string;
  label?: string; // small mono eyebrow
  /** single line, or a map of branch-key -> line ("_" is the default) */
  text: string | Record<string, string>;
  speaker: "kid" | "marnhon" | "miles" | "night";
  choices?: Choice[];
};

export type Act = {
  id: 1 | 2 | 3 | 4;
  character: "kid" | "marnhon" | "miles" | "night";
  characterSide: "right" | "left";
  textSide: "left" | "right";
  beats: Beat[];
};

export const ACT_ONE: Act = {
  id: 1,
  character: "kid",
  characterSide: "right",
  textSide: "left",
  beats: [
    {
      id: "a1-intro",
      label: "01 · first contact",
      text: "So…\nwhat brought\nyou *here*?",
      speaker: "kid",
      choices: [
        { id: "curious", label: "I'm curious", set: "curious" },
        { id: "looking", label: "I'm looking for something", set: "looking" },
        { id: "lost", label: "I don't know yet", set: "lost" },
      ],
    },
    {
      id: "a1-react",
      label: "he considers you",
      text: {
        curious: "Good.\nCuriosity usually\n*leads* somewhere.",
        looking: "Then you're in\nthe right place.\nEveryone here is *looking*.",
        lost: "Honest.\nMost people\n*pretend* they know.",
        _: "Good.\nCuriosity usually\n*leads* somewhere.",
      },
      speaker: "kid",
    },
    {
      id: "a1-ask",
      text: "But let me ask\nyou *something*.",
      speaker: "kid",
    },
    {
      id: "a1-depth",
      label: "choose",
      text: "How far are you\nwilling to go\nto find *out*?",
      speaker: "kid",
      choices: [
        { id: "all", label: "All the way", set: "all" },
        { id: "peek", label: "Just looking", set: "peek" },
      ],
    },
    {
      id: "a1-close",
      text: {
        all: "*All the way.*\nGood.\nThen keep moving.",
        peek: "Just looking is fine.\nLooking is how\nit *starts*.",
        _: "Alright.\nKeep *moving*.",
      },
      speaker: "kid",
    },
  ],
};

export const ACT_TWO: Act = {
  id: 2,
  character: "marnhon",
  characterSide: "left",
  textSide: "right",
  beats: [
    {
      id: "a2-open",
      label: "02 · the other side",
      text: "Okay.\nEnough *talk*.",
      speaker: "marnhon",
    },
    {
      id: "a2-fun",
      text: "Now let's\nhave some *fun*.",
      speaker: "marnhon",
    },
    {
      id: "a2-ready",
      text: "You\n*ready*?",
      speaker: "marnhon",
      choices: [{ id: "go", label: "Hit it" }],
    },
    {
      id: "a2-mood",
      text: "This is\nthe *mood*.",
      speaker: "marnhon",
    },
    {
      id: "a2-move",
      text: "Move like\nyou *mean* it.",
      speaker: "marnhon",
    },
    {
      id: "a2-cool",
      text: "Okay.\nCatch your *breath*.",
      speaker: "marnhon",
    },
  ],
};

export const ACT_THREE: Act = {
  id: 3,
  character: "miles",
  characterSide: "right",
  textSide: "left",
  beats: [
    {
      id: "a3-open",
      label: "03 · after hours",
      text: "Alright.\nSlow it *down*.",
      speaker: "miles",
    },
    {
      id: "a3-vibe",
      text: "No rush.\nJust let it *ride*.",
      speaker: "miles",
    },
    {
      id: "a3-night",
      text: "The night's\nstill *young*.",
      speaker: "miles",
    },
    {
      id: "a3-walk",
      text: "Come on.\nWalk with *me*.",
      speaker: "miles",
    },
  ],
};

export const ACT_FOUR: Act = {
  id: 4,
  character: "night",
  characterSide: "right",
  textSide: "left",
  beats: [
    {
      id: "a4-open",
      label: "04 · the long way home",
      text: "The night\nkeeps *going*.",
      speaker: "night",
    },
    {
      id: "a4-quiet",
      text: "This was\nthe *mood*.",
      speaker: "night",
    },
    {
      id: "a4-end",
      label: "—",
      text: "See you\n*around*.",
      speaker: "night",
      choices: [{ id: "restart", label: "Run it back" }],
    },
  ],
};

export const STORY: Act[] = [ACT_ONE, ACT_TWO, ACT_THREE, ACT_FOUR];

/** resolve a beat's line for the current branch */
export function resolveText(
  text: Beat["text"],
  branch: Record<string, string>
): string {
  if (typeof text === "string") return text;
  for (const key of Object.values(branch)) {
    if (key && text[key]) return text[key];
  }
  return text["_"] ?? Object.values(text)[0] ?? "";
}
