import imageSizes from "@/data/image-sizes.json";

/** Timer global — sama dengan TOTAL_TIME di script.js (60 menit). */
export const TOTAL_TIME = 60 * 60;

/** Jeda setelah audio soal listening selesai sebelum pindah otomatis (script.js: 5 detik). */
export const ANSWER_DELAY_SECONDS = 5;

/** Waktu menjawab bila file audio soal tidak ada / gagal diputar (mis. 41.mp3). */
export const MISSING_AUDIO_SECONDS = 10;

/** Set 3 soal dalam satu tampilan (threeQuestionSets di script.js): q18–q50. */
export const THREE_QUESTION_FIRST = 18;
export const THREE_QUESTION_LAST = 50;

export function threeQuestionSet(number: number): number[] | null {
  if (number < THREE_QUESTION_FIRST || number > THREE_QUESTION_LAST) return null;
  const start = number - ((number - THREE_QUESTION_FIRST) % 3);
  return [start, start + 1, start + 2];
}

export type DirectionConfig = { label: string } & (
  | { kind: "intro" }
  | { kind: "transition"; seconds: number }
  // Direction listening: auto-next setelah audio; tanpa audio pakai hitung mundur.
  | { kind: "listening"; image: string; readSeconds: number }
  // Direction reading: tombol Continue (dan Previous kecuali d5).
  | { kind: "reading"; image: string; canGoBack: boolean }
);

/** directionMapping di script.js (direction-000/001 tidak ada, diganti layar HTML). */
export const DIRECTIONS: Record<string, DirectionConfig> = {
  d00: { kind: "intro", label: "General Directions" },
  d01: { kind: "transition", label: "Listening Test", seconds: 3 },
  d1: {
    kind: "listening",
    label: "Listening · Part 1 Directions",
    image: "/directions/direction-1.png",
    readSeconds: 45,
  },
  d2: {
    kind: "listening",
    label: "Listening · Part 2 Directions",
    image: "/directions/direction-2.png",
    readSeconds: 35,
  },
  d3: {
    kind: "listening",
    label: "Listening · Part 3 Directions",
    image: "/directions/direction-3.png",
    readSeconds: 20,
  },
  d4: {
    kind: "listening",
    label: "Listening · Part 4 Directions",
    image: "/directions/direction-4.png",
    readSeconds: 20,
  },
  d5: {
    kind: "reading",
    label: "Reading · Part 5 Directions",
    image: "/directions/direction-5.png",
    canGoBack: false,
  },
  d6: {
    kind: "reading",
    label: "Reading · Part 6 Directions",
    image: "/directions/direction-6.png",
    canGoBack: true,
  },
  d7: {
    kind: "reading",
    label: "Reading · Part 7 Directions",
    image: "/directions/direction-7.png",
    canGoBack: true,
  },
};

export const PART_LABELS: Record<number, string> = {
  1: "Photographs",
  2: "Question–Response",
  3: "Conversations",
  4: "Talks",
  5: "Incomplete Sentences",
  6: "Text Completion",
  7: "Reading Comprehension",
};

export function imageSize(src: string): { width: number; height: number } {
  const size = (imageSizes as Record<string, number[]>)[src];
  return size ? { width: size[0], height: size[1] } : { width: 1200, height: 800 };
}

export function formatTime(totalSeconds: number) {
  const s = Math.max(0, totalSeconds);
  const minutes = String(Math.floor(s / 60)).padStart(2, "0");
  const seconds = String(s % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

/** Pisahkan "A) teks" → { letter: "A", text: "teks" }. */
export function parseOption(option: string) {
  const match = option.match(/^\s*\(?([A-D])\)\s*([\s\S]*)$/);
  return match
    ? { letter: match[1], text: match[2].replace(/&nbsp;| /g, " ").trim() }
    : { letter: "", text: option };
}
