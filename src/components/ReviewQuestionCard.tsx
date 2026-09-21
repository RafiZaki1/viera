"use client";

import Image from "next/image";
import { parseOption } from "@/lib/config";
import { PART_NAMES } from "@/lib/toeic";
import type { ResultDetail } from "@/lib/types";
import { ReviewAudioPlayer } from "./ReviewAudioPlayer";
import { cn } from "./ui";

type ReviewQuestionCardProps = {
  detail: ResultDetail;
};

export function ReviewQuestionCard({ detail }: ReviewQuestionCardProps) {
  const isCorrect = detail.correct;
  const isUnanswered = detail.answer === null || detail.answer === undefined;
  const partName = PART_NAMES[detail.part] ?? `Part ${detail.part}`;

  // Image source: prefer groupImage if both exist, or image
  const displayImage = detail.image || detail.groupImage;

  return (
    <article
      id={`review-q-${detail.number}`}
      className={cn(
        "rounded-xl border bg-white p-5 shadow-sm transition-all scroll-mt-20",
        isCorrect ? "border-slate-200" : isUnanswered ? "border-amber-200" : "border-rose-200",
      )}
    >
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-slate-900">Soal {detail.number}</span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-medium">
            Part {detail.part} - {partName}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {isCorrect ? (
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 border border-emerald-200">
              Jawaban Benar
            </span>
          ) : isUnanswered ? (
            <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 font-semibold text-amber-700 border border-amber-200">
              Tidak Dijawab
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-rose-50 px-2.5 py-1 font-semibold text-rose-700 border border-rose-200">
              Jawaban Salah
            </span>
          )}

          <div className="text-slate-500 font-mono">
            Pilihan: <strong className="text-slate-800">{detail.answer ?? "-"}</strong> | Kunci:{" "}
            <strong className="text-emerald-700">{detail.key}</strong>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {/* Audio Player for Listening questions */}
        {detail.audio && (
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-500">Audio Soal</p>
            <ReviewAudioPlayer audioSrc={detail.audio} />
          </div>
        )}

        {/* Question Image if present */}
        {displayImage && (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-2">
            <div className="relative max-h-96 w-full flex justify-center">
              <Image
                src={displayImage}
                alt={`Gambar soal ${detail.number}`}
                width={800}
                height={500}
                className="max-h-96 w-auto object-contain rounded"
                unoptimized
              />
            </div>
          </div>
        )}

        {/* Question text */}
        {detail.question && detail.question !== `${detail.number}.` && (
          <p className="text-sm font-medium text-slate-900 leading-relaxed">{detail.question}</p>
        )}

        {/* Options list */}
        {detail.options && detail.options.length > 0 && (
          <div className="space-y-2">
            {detail.options.map((opt, idx) => {
              const parsed = parseOption(opt);
              const letter = parsed.letter || ["A", "B", "C", "D"][idx];
              const isKey = letter === detail.key;
              const isChosenWrong = letter === detail.answer && !isCorrect;

              return (
                <div
                  key={letter}
                  className={cn(
                    "flex items-start justify-between rounded-lg border px-3.5 py-2.5 text-sm transition-colors",
                    isKey
                      ? "border-emerald-300 bg-emerald-50/80 text-emerald-950 font-medium"
                      : isChosenWrong
                        ? "border-rose-300 bg-rose-50/80 text-rose-950"
                        : "border-slate-200 bg-slate-50/50 text-slate-700",
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={cn(
                        "inline-flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        isKey
                          ? "bg-emerald-600 text-white"
                          : isChosenWrong
                            ? "bg-rose-600 text-white"
                            : "bg-slate-200 text-slate-700",
                      )}
                    >
                      {letter}
                    </span>
                    <span className="leading-snug">{parsed.text || opt}</span>
                  </div>

                  {isKey && (
                    <span className="ml-2 shrink-0 rounded bg-emerald-200/80 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                      Kunci Jawaban
                    </span>
                  )}
                  {isChosenWrong && (
                    <span className="ml-2 shrink-0 rounded bg-rose-200/80 px-2 py-0.5 text-xs font-semibold text-rose-800">
                      Pilihan Anda
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Explanation box */}
        {detail.explanation && (
          <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-3.5 text-xs text-indigo-950">
            <p className="font-semibold text-indigo-900 mb-1">Dasar jawaban dan kutipan transkrip</p>
            <p className="leading-relaxed text-indigo-900/90">{detail.explanation}</p>
          </div>
        )}
      </div>
    </article>
  );
}
