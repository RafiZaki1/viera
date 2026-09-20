"use client";

import Image from "next/image";
import { imageSize } from "@/lib/config";
import type { Answers, QuestionItem } from "@/lib/types";
import { Button, Modal } from "../ui";

/** showEndConfirmModal di script.js. */
export function EndDialog({
  open,
  answered,
  total,
  onCancel,
  onShowMarked,
  onSubmit,
}: {
  open: boolean;
  answered: number;
  total: number;
  onCancel: () => void;
  onShowMarked: () => void;
  onSubmit: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} labelledBy="end-title">
      <div className="p-6 text-center sm:p-8">
        <h2 id="end-title" className="text-xl font-bold">
          📝 End of the Test
        </h2>
        <p className="mt-3 text-slate-600">
          This is the end of the test. How would you like to proceed?
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Terjawab {answered} dari {total} soal.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="danger" onClick={onCancel}>
            ❌ Cancel
          </Button>
          <Button variant="warning" onClick={onShowMarked}>
            📌 View Marked Questions
          </Button>
          <Button variant="success" onClick={onSubmit}>
            ✅ Submit
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/** showMarkedQuestionsPopup di script.js — hanya soal reading. */
export function MarkedDialog({
  open,
  questions,
  marked,
  answers,
  onClose,
  onJump,
}: {
  open: boolean;
  questions: QuestionItem[];
  marked: string[];
  answers: Answers;
  onClose: () => void;
  onJump: (id: string) => void;
}) {
  const reading = questions.filter((q) => q.type === "reading");
  const markedQuestions = reading.filter((q) => marked.includes(q.id));
  const unanswered = reading.filter((q) => !answers[q.id] && !marked.includes(q.id));
  const last = reading.at(-1);

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="marked-title"
      sizeClass="w-[calc(100%-2rem)] max-w-3xl"
    >
      <div className="relative p-6 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-3 right-4 text-2xl leading-none text-slate-500 hover:text-slate-900"
        >
          ×
        </button>
        <h2 id="marked-title" className="sr-only">
          Marked and unanswered questions
        </h2>
        <div className="grid gap-6 md:grid-cols-2 md:divide-x md:divide-slate-200">
          <section className="md:pr-6">
            <h3 className="mb-4 text-lg font-semibold">📌 Marked Question</h3>
            <QuestionLinks
              list={markedQuestions}
              empty="Tidak ada soal ditandai."
              tone="blue"
              onJump={onJump}
            />
            {last && (
              <Button variant="warning" className="mt-6" onClick={() => onJump(last.id)}>
                ⏩ Go to Question {last.number}
              </Button>
            )}
          </section>
          <section className="md:pl-6">
            <h3 className="mb-4 text-lg font-semibold">🟥 Unanswered Question</h3>
            <QuestionLinks
              list={unanswered}
              empty="Semua soal sudah dijawab."
              tone="red"
              onJump={onJump}
            />
          </section>
        </div>
      </div>
    </Modal>
  );
}

function QuestionLinks({
  list,
  empty,
  tone,
  onJump,
}: {
  list: QuestionItem[];
  empty: string;
  tone: "blue" | "red";
  onJump: (id: string) => void;
}) {
  if (list.length === 0) return <p className="text-sm text-slate-500 italic">{empty}</p>;
  const color =
    tone === "blue"
      ? "border-blue-600 text-blue-700 hover:bg-blue-50"
      : "border-rose-600 text-rose-700 hover:bg-rose-50";
  return (
    <ul className="flex flex-wrap gap-2">
      {list.map((q) => (
        <li key={q.id}>
          <button
            type="button"
            onClick={() => onJump(q.id)}
            className={`min-w-14 rounded-md border px-3 py-1.5 text-sm font-semibold transition-colors ${color}`}
            aria-label={`Question number ${q.number}`}
          >
            {q.number}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function ZoomDialog({ src, onClose }: { src: string | null; onClose: () => void }) {
  const size = src ? imageSize(src) : null;
  // Gambar kecil (passage ±800px) ditampilkan 1,5× agar teksnya lebih besar.
  const width = size ? (size.width < 1000 ? size.width * 1.5 : size.width) : 0;

  return (
    <Modal
      open={src !== null}
      onClose={onClose}
      labelledBy="zoom-title"
      sizeClass="max-h-[95dvh] max-w-[95vw]"
    >
      {src && size && (
        <div>
          <div className="sticky top-0 left-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-2">
            <h2 id="zoom-title" className="text-sm font-semibold text-slate-600">
              Tampilan diperbesar
            </h2>
            <Button onClick={onClose}>Tutup ✕</Button>
          </div>
          <Image
            src={src}
            alt="Gambar diperbesar"
            {...size}
            style={{ width, maxWidth: "none" }}
            className="h-auto"
          />
        </div>
      )}
    </Modal>
  );
}
