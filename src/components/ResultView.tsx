"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatTime, PART_LABELS } from "@/lib/config";
import { checkSession, createExamStore, logout, setNotice } from "@/lib/storage";
import type { Participant, ResultDetail, Score, StoredResult } from "@/lib/types";
import { Button, cn, LoadingScreen } from "./ui";

export default function ResultView() {
  const router = useRouter();
  const [state] = useState(() => {
    const session = checkSession();
    if (!session.ok) return { kind: "login" as const, message: session.message };
    const result = createExamStore(session.participant.std_code).getJSON<StoredResult>("result");
    if (!result) return { kind: "pending" as const };
    return { kind: "ok" as const, participant: session.participant, result };
  });

  useEffect(() => {
    if (state.kind === "login") {
      setNotice(state.message);
      router.replace("/");
    } else if (state.kind === "pending") {
      router.replace("/test");
    }
  }, [state, router]);

  if (state.kind !== "ok") return <LoadingScreen label="Mengalihkan…" />;
  return <Result participant={state.participant} result={state.result} />;
}

function Result({ participant, result }: { participant: Participant; result: StoredResult }) {
  const router = useRouter();
  const [showReview, setShowReview] = useState(false);
  const percent = Math.round((result.correct / result.total) * 100);
  const submittedAt = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(result.submittedAt));

  const signOut = () => {
    logout();
    router.replace("/");
  };

  const retake = () => {
    if (!window.confirm("Ulangi tes? Semua jawaban dan hasil sebelumnya akan dihapus.")) return;
    createExamStore(participant.std_code).clear();
    router.replace("/test");
  };

  return (
    <main className="flex-1 px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-wide text-accent-dark uppercase">
                Hasil Tes
              </p>
              <h1 className="mt-1 text-2xl font-bold text-brand">{participant.std_name}</h1>
              <p className="mt-1 text-sm text-slate-500">
                No. Peserta {participant.std_code} · {submittedAt} · waktu {formatTime(result.timeUsed)}
              </p>
              {result.timedOut && (
                <p className="mt-2 inline-block rounded-md bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                  ⏰ Dikirim otomatis karena waktu habis
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold text-brand tabular-nums">
                {result.correct}
                <span className="text-2xl text-slate-400">/{result.total}</span>
              </p>
              <p className="text-sm text-slate-500">jawaban benar ({percent}%)</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <SectionCard title="Listening" score={result.listening} />
            <SectionCard title="Reading" score={result.reading} />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Skor per Part</h2>
          <div className="mt-4 space-y-3">
            {result.parts.map((p) => (
              <div
                key={p.part}
                className="grid grid-cols-[5rem_1fr_4rem] items-center gap-3 text-sm sm:grid-cols-[5rem_12rem_1fr_4rem]"
              >
                <span className="font-semibold">Part {p.part}</span>
                <span className="hidden text-slate-500 sm:block">{PART_LABELS[p.part]}</span>
                <Bar score={p} />
                <span className="text-right tabular-nums">
                  {p.correct}/{p.total}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Pembahasan Jawaban</h2>
            <Button onClick={() => setShowReview((v) => !v)}>
              {showReview ? "Sembunyikan" : "Tampilkan kunci jawaban"}
            </Button>
          </div>
          {showReview && <Review details={result.details} />}
        </section>

        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" onClick={retake}>
            Ulangi tes
          </Button>
          <Button variant="primary" onClick={signOut}>
            Keluar
          </Button>
        </div>
      </div>
    </main>
  );
}

function SectionCard({ title, score }: { title: string; score: Score }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <div className="flex items-baseline justify-between">
        <p className="font-semibold">{title}</p>
        <p className="text-lg font-bold tabular-nums">
          {score.correct}
          <span className="text-sm text-slate-400">/{score.total}</span>
        </p>
      </div>
      <div className="mt-2">
        <Bar score={score} />
      </div>
    </div>
  );
}

function Bar({ score }: { score: Score }) {
  const value = score.total ? score.correct / score.total : 0;
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
      <div className="h-full rounded-full bg-brand" style={{ width: `${value * 100}%` }} />
    </div>
  );
}

function Review({ details }: { details: ResultDetail[] }) {
  const parts = [...new Set(details.map((d) => d.part))];
  return (
    <div className="mt-4 space-y-6">
      <p className="flex flex-wrap gap-4 text-xs text-slate-600">
        <Legend className="border-emerald-300 bg-emerald-50" label="Benar" />
        <Legend className="border-rose-300 bg-rose-50" label="Salah" />
        <Legend className="border-slate-300 bg-slate-50" label="Tidak dijawab" />
      </p>
      {parts.map((part) => (
        <div key={part}>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            Part {part} — {PART_LABELS[part]}
          </h3>
          <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
            {details
              .filter((d) => d.part === part)
              .map((d) => (
                <li
                  key={d.id}
                  className={cn(
                    "rounded-md border px-2 py-1.5 text-center text-xs",
                    d.correct
                      ? "border-emerald-300 bg-emerald-50"
                      : d.answer
                        ? "border-rose-300 bg-rose-50"
                        : "border-slate-300 bg-slate-50",
                  )}
                >
                  <p className="text-sm font-bold">{d.number}</p>
                  <p className="text-slate-600">
                    {d.answer ?? "–"} → <b>{d.key}</b>
                  </p>
                </li>
              ))}
          </ul>
        </div>
      ))}
      <p className="text-xs text-slate-500">Format: jawaban Anda → kunci jawaban.</p>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("inline-block size-3 rounded-sm border", className)} />
      {label}
    </span>
  );
}
