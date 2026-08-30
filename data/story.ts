/* ============================================================
   STORY DATA  —  edit freely, the engine never needs to change.

   One calm story of a good block: you show up, its people show you the
   mood — watchful, hyped, easy — and the block itself walks you home.

   • Wrap a word in *asterisks* to accent it (italic serif in the calm
     acts, amber in the loud one).
   • Use \n for line breaks inside a statement.
   • `choices` render as clickable chips and GATE the scroll — you can't
     pass a choice beat until you pick. A choice may `set` a branch key;
     later beats whose `text` is an object pick the line matching the
     current branch (falling back to "_").
   • A user who only clicks through still gets a coherent story via "_".
   ============================================================ */

export type Choice = { id: string; label: string; set?: string };

export type Beat = {
  id: string;
  label?: string; // small eyebrow
  /** single line, or a map of branch-key -> line ("_" is the default) */
  text: string | Record<string, string>;
  speaker: "kid" | "marnhon" | "miles" | "block";
  choices?: Choice[];
};

export type Act = {
  id: 1 | 2 | 3 | 4;
  character: "kid" | "marnhon" | "miles" | "block";
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
      label: "01 · the block",
      text: "So…\nwhat brings you\nto the *block*?",
      speaker: "kid",
      choices: [
        { id: "curious", label: "I'm curious", set: "curious" },
        { id: "looking", label: "Just passing through", set: "looking" },
        { id: "lost", label: "I don't know yet", set: "lost" },
      ],
    },
    {
      id: "a1-react",
      label: "he clocks you",
      text: {
        curious: "Good.\nThe block rewards\nthe *curious*.",
        looking: "Nobody just\npasses through.\nNot *really*.",
        lost: "That's alright.\nThe block\ndon't *rush* you.",
        _: "Good.\nThe block rewards\nthe *curious*.",
      },
      speaker: "kid",
    },
    {
      id: "a1-ask",
      text: "Let me show you\nhow we *move*.",
      speaker: "kid",
    },
    {
      id: "a1-depth",
      text: "How deep you\ntryna *get*?",
      speaker: "kid",
      choices: [
        { id: "all", label: "All in", set: "all" },
        { id: "peek", label: "Just watching", set: "peek" },
      ],
    },
    {
      id: "a1-close",
      text: {
        all: "*All in.*\nRespect.\nKeep up.",
        peek: "Watch then.\nThe block\nputs on a *show*.",
        _: "Aight.\nStay *close*.",
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
      label: "02 · when it's up",
      text: "This the block\nwhen it's *up*.",
      speaker: "marnhon",
    },
    {
      id: "a2-fun",
      text: "Fresh fits.\nLoud *summers*.",
      speaker: "marnhon",
    },
    {
      id: "a2-ready",
      text: "You feeling\nit *yet*?",
      speaker: "marnhon",
      choices: [{ id: "go", label: "Feel it" }],
    },
    {
      id: "a2-mood",
      text: "That's the\nwhole *energy*.",
      speaker: "marnhon",
    },
    {
      id: "a2-cool",
      text: "Alright.\nLet it come\n*down*.",
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
      text: "Evening hits\n*different*.",
      speaker: "miles",
    },
    {
      id: "a3-vibe",
      text: "Stoop talk.\nSlow *music*.",
      speaker: "miles",
    },
    {
      id: "a3-night",
      text: "This the part\nnobody *films*.",
      speaker: "miles",
    },
    {
      id: "a3-walk",
      text: "Walk it off\nwith *me*.",
      speaker: "miles",
    },
  ],
};

export const ACT_FOUR: Act = {
  id: 4,
  character: "block",
  characterSide: "right",
  textSide: "left",
  beats: [
    {
      id: "a4-open",
      label: "04 · home",
      text: "Empty streets.\nStill *warm*.",
      speaker: "block",
    },
    {
      id: "a4-quiet",
      text: "This the block\nthat *made* us.",
      speaker: "block",
    },
    {
      id: "a4-end",
      text: "You're *home* now.\nPull up whenever.",
      speaker: "block",
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
