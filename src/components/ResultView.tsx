"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { formatTime, PART_LABELS } from "@/lib/config";
import {
  checkSession,
  createExamStore,
  forgetLastParticipant,
  logout,
  setNotice,
} from "@/lib/storage";
import type { Participant, Score, StoredResult } from "@/lib/types";
import { ReviewQuestionCard } from "./ReviewQuestionCard";
import { Button, cn, LoadingScreen } from "./ui";

type FilterStatus = "all" | "wrong" | "correct" | "unanswered";

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
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [selectedPart, setSelectedPart] = useState<number | "all">("all");
  const [showReview, setShowReview] = useState(true);

  const percent = Math.round((result.correct / result.total) * 100);
  const submittedAt = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(result.submittedAt));

  const wrongCount = result.total - result.correct;
  const unansweredCount = result.details.filter((d) => d.answer === null || d.answer === undefined).length;

  const filteredDetails = useMemo(() => {
    return result.details.filter((d) => {
      // Filter by part
      if (selectedPart !== "all" && d.part !== selectedPart) {
        return false;
      }
      // Filter by status
      if (filterStatus === "correct") return d.correct;
      if (filterStatus === "wrong") return !d.correct;
      if (filterStatus === "unanswered") return d.answer === null || d.answer === undefined;
      return true;
    });
  }, [result.details, selectedPart, filterStatus]);

  const signOut = () => {
    logout();
    forgetLastParticipant();
    router.replace("/");
  };

  const retake = () => {
    if (!window.confirm("Ulangi tes? Semua jawaban dan hasil sebelumnya akan dihapus.")) return;
    createExamStore(participant.std_code).clear();
    router.replace("/test");
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToQuestion = (number: number) => {
    const el = document.getElementById(`review-q-${number}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <main className="flex-1 px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Ringkasan Skor Utama */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 print:border-none print:shadow-none print:p-0">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-wider text-accent-dark uppercase">
                Laporan Hasil Ujian VIERA
              </p>
              <h1 className="mt-1 text-2xl font-bold text-brand">{participant.std_name}</h1>
              <p className="mt-1 text-sm text-slate-500">
                Nomor Peserta {participant.std_code} · {submittedAt} · Durasi pengerjaan {formatTime(result.timeUsed)}
              </p>
              {result.timedOut && (
                <p className="mt-2 inline-block rounded-md bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                  Ujian diserahkan otomatis karena waktu 60 menit habis
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold text-brand tabular-nums">
                {result.correct}
                <span className="text-2xl text-slate-400">/{result.total}</span>
              </p>
              <p className="text-sm text-slate-500 font-medium">Akurasi jawaban ({percent}%)</p>
            </div>
          </div>

          {/* Kartu Estimasi Skor TOEIC */}
          {result.toeic && (
            <div className="mt-6 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-slate-50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100/80 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                    Estimasi Skor Skala TOEIC
                  </span>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">
                    {result.toeic.level}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-brand tabular-nums">
                    {result.toeic.totalScore}
                  </span>
                  <span className="text-base text-slate-400">/990</span>
                </div>
              </div>

              <div className="mt-3 grid gap-4 sm:grid-cols-2 text-sm">
                <div className="flex items-center justify-between rounded-lg bg-white/80 px-3.5 py-2 border border-indigo-50">
                  <span className="text-slate-600 font-medium">Listening Score</span>
                  <span className="font-bold text-brand tabular-nums">
                    {result.toeic.listeningScore} <span className="text-xs text-slate-400">/495</span>
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/80 px-3.5 py-2 border border-indigo-50">
                  <span className="text-slate-600 font-medium">Reading Score</span>
                  <span className="font-bold text-brand tabular-nums">
                    {result.toeic.readingScore} <span className="text-xs text-slate-400">/495</span>
                  </span>
                </div>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                {result.toeic.description}
              </p>
            </div>
          )}

          {/* Perbandingan Listening & Reading */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <SectionCard title="Listening Comprehension (1-50)" score={result.listening} />
            <SectionCard title="Reading Comprehension (51-100)" score={result.reading} />
          </div>
        </section>

        {/* Diagnostik Kelemahan Materi per Bagian */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Analisis Performa per Bagian</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluasi akurasi dan rekomendasi penguatan materi berdasarkan persentase jawaban benar tiap part.
          </p>

          <div className="mt-5 space-y-4">
            {(result.diagnostics || result.parts.map((p) => ({
              part: p.part,
              label: PART_LABELS[p.part] ?? `Part ${p.part}`,
              accuracy: p.total > 0 ? p.correct / p.total : 0,
              correct: p.correct,
              total: p.total,
              status: (p.total > 0 && p.correct / p.total >= 0.75 ? "strong" : p.correct / p.total < 0.6 ? "weak" : "moderate") as "strong" | "moderate" | "weak",
              recommendation: "Tingkatkan latihan soal dan pemahaman materi pada bagian ini.",
            }))).map((diag) => {
              const accuracyPercent = Math.round(diag.accuracy * 100);
              const isWeak = diag.status === "weak";
              const isStrong = diag.status === "strong";

              return (
                <div
                  key={diag.part}
                  className={cn(
                    "rounded-lg border p-4 transition-colors",
                    isWeak
                      ? "border-rose-200 bg-rose-50/40"
                      : isStrong
                        ? "border-emerald-200 bg-emerald-50/30"
                        : "border-slate-200 bg-slate-50/50",
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">Part {diag.part}</span>
                      <span className="text-sm text-slate-600 font-medium">{diag.label}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-xs font-semibold",
                          isWeak
                            ? "bg-rose-100 text-rose-800"
                            : isStrong
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-700",
                        )}
                      >
                        {isWeak ? "Perlu Penguatan" : isStrong ? "Sangat Baik" : "Cukup"}
                      </span>
                      <span className="text-sm font-mono font-bold text-slate-800 tabular-nums">
                        {diag.correct}/{diag.total} ({accuracyPercent}%)
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5">
                    <Bar score={{ correct: diag.correct, total: diag.total }} />
                  </div>

                  {isWeak && (
                    <p className="mt-2 text-xs text-rose-800 leading-relaxed font-medium">
                      Fokus evaluasi: {diag.recommendation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Tinjauan Pembahasan dan Kartu Soal */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Tinjauan Butir Soal dan Pembahasan</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Putar ulang audio, periksa transkrip, dan baca dasar alasan kunci jawaban.
              </p>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <Button onClick={() => setShowReview((v) => !v)}>
                {showReview ? "Sembunyikan review" : "Tampilkan review"}
              </Button>
            </div>
          </div>

          {showReview && (
            <div className="mt-5 space-y-6">
              {/* Navigasi Cepat Nomor Soal */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Kisi Navigasi Soal (1 - 100)
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <Legend className="border-emerald-300 bg-emerald-100 text-emerald-900" label="Benar" />
                    <Legend className="border-rose-300 bg-rose-100 text-rose-900" label="Salah" />
                    <Legend className="border-amber-300 bg-amber-100 text-amber-900" label="Kosong" />
                  </div>
                </div>

                <div className="grid grid-cols-10 gap-1.5 sm:grid-cols-20">
                  {result.details.map((d) => {
                    const isUnans = d.answer === null || d.answer === undefined;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => scrollToQuestion(d.number)}
                        className={cn(
                          "rounded py-1 text-center font-mono text-xs font-semibold transition-all hover:scale-105 cursor-pointer",
                          d.correct
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : isUnans
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-rose-100 text-rose-800 border border-rose-300",
                        )}
                        title={`Soal ${d.number}: Jawaban ${d.answer ?? "Kosong"} (Kunci ${d.key})`}
                      >
                        {d.number}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bilah Filter Soal */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-y border-slate-100 py-3 print:hidden">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium text-slate-500 mr-1">Status:</span>
                  {(
                    [
                      { key: "all", label: `Semua (${result.total})` },
                      { key: "wrong", label: `Salah (${wrongCount})` },
                      { key: "correct", label: `Benar (${result.correct})` },
                      { key: "unanswered", label: `Kosong (${unansweredCount})` },
                    ] as const
                  ).map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => setFilterStatus(filter.key)}
                      className={cn(
                        "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer",
                        filterStatus === filter.key
                          ? "bg-brand text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                      )}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Bagian:</span>
                  <select
                    value={selectedPart}
                    onChange={(e) => setSelectedPart(e.target.value === "all" ? "all" : Number(e.target.value))}
                    className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="all">Semua Part (1 - 7)</option>
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <option key={num} value={num}>
                        Part {num} ({PART_LABELS[num]})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Daftar Kartu Soal */}
              <div className="space-y-4">
                {filteredDetails.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                    Tidak ada butir soal yang sesuai dengan kriteria filter saat ini.
                  </div>
                ) : (
                  filteredDetails.map((detail) => (
                    <ReviewQuestionCard key={detail.id} detail={detail} />
                  ))
                )}
              </div>
            </div>
          )}
        </section>

        {/* Tombol Aksi Bawah */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden">
          <Button variant="secondary" onClick={handlePrint}>
            Cetak Laporan / Simpan PDF
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={retake}>
              Ulangi Tes
            </Button>
            <Button variant="primary" onClick={signOut}>
              Keluar
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

function SectionCard({ title, score }: { title: string; score: Score }) {
  const percent = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
  return (
    <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
      <div className="flex items-baseline justify-between">
        <p className="font-semibold text-slate-900 text-sm">{title}</p>
        <p className="text-base font-bold tabular-nums text-slate-800">
          {score.correct}
          <span className="text-xs text-slate-400">/{score.total}</span>
          <span className="ml-1.5 text-xs text-slate-500 font-normal">({percent}%)</span>
        </p>
      </div>
      <div className="mt-2.5">
        <Bar score={score} />
      </div>
    </div>
  );
}

function Bar({ score }: { score: Score }) {
  const value = score.total ? score.correct / score.total : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <div className="h-full rounded-full bg-brand transition-all duration-300" style={{ width: `${value * 100}%` }} />
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("inline-block size-3 rounded border", className)} />
      {label}
    </span>
  );
}
