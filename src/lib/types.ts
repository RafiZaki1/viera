export const LETTERS = ["A", "B", "C", "D"] as const;
export type Letter = (typeof LETTERS)[number];

export type DirectionItem = {
  id: string;
  type: "direction";
  audio?: string;
};

export type QuestionItem = {
  id: string;
  type: "listening" | "reading";
  part: number;
  number: number;
  question: string;
  options: string[];
  image?: string;
  groupImage?: string;
  audio?: string;
};

export type ExamItem = DirectionItem | QuestionItem;

/** Jawaban peserta: id soal -> huruf pilihan. */
export type Answers = Record<string, Letter>;

export type Score = { correct: number; total: number };

export type ToeicResult = {
  listeningScore: number;
  readingScore: number;
  totalScore: number;
  level: string;
  description: string;
};

export type DiagnosticItem = {
  part: number;
  label: string;
  accuracy: number;
  correct: number;
  total: number;
  status: "strong" | "moderate" | "weak";
  recommendation: string;
};

export type ResultDetail = {
  id: string;
  number: number;
  part: number;
  answer: Letter | null;
  key: Letter;
  correct: boolean;
  question?: string;
  options?: string[];
  image?: string;
  groupImage?: string;
  audio?: string;
  explanation?: string;
};

export type ExamResult = {
  correct: number;
  total: number;
  listening: Score;
  reading: Score;
  parts: ({ part: number } & Score)[];
  details: ResultDetail[];
  toeic?: ToeicResult;
  diagnostics?: DiagnosticItem[];
};

export type Participant = {
  std_code: string;
  std_name: string;
};

/** Hasil yang disimpan di localStorage setelah submit. */
export type StoredResult = ExamResult & {
  submittedAt: string;
  timeUsed: number;
  timedOut: boolean;
};

export function isQuestion(item: ExamItem): item is QuestionItem {
  return item.type !== "direction";
}
