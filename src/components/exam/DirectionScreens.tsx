"use client";

import Image from "next/image";
import { useEffect, useEffectEvent, useState, type RefObject } from "react";
import { ANSWER_DELAY_SECONDS, formatTime, imageSize, TOTAL_TIME } from "@/lib/config";
import type { DirectionItem, Participant } from "@/lib/types";
import { Button } from "../ui";
import { ProgressBar, ScreenLayout } from "./layout";

function DirectionImage({ src, alt, onZoom }: { src: string; alt: string; onZoom: (src: string) => void }) {
  return (
    <figure className="relative mx-auto max-w-6xl overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
      <Image src={src} alt={alt} {...imageSize(src)} preload className="h-auto w-full" />
      <button
        type="button"
        onClick={() => onZoom(src)}
        className="absolute top-2 right-2 rounded-md bg-slate-900/70 px-2.5 py-1 text-xs font-semibold text-white opacity-80 hover:opacity-100 sm:hidden"
      >
        🔍 Perbesar
      </button>
    </figure>
  );
}

/** d00 — petunjuk umum & tombol mulai (juga membuka izin audio di browser). */
export function IntroScreen({
  participant,
  questionCount,
  onStart,
}: {
  participant: Participant;
  questionCount: { listening: number; reading: number };
  onStart: () => void;
}) {
  return (
    <ScreenLayout>
      <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold tracking-wide text-accent-dark uppercase">
          Listening and Reading Comprehension Module
        </p>
        <h1 className="mt-1 text-2xl font-bold text-brand">Selamat datang, {participant.std_name}</h1>
        <p className="mt-1 text-sm text-slate-500">No. Peserta: {participant.std_code}</p>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-sky-50 p-3">
            <p className="text-2xl font-bold text-brand">{questionCount.listening}</p>
            <p className="text-xs text-slate-600">Soal Listening</p>
          </div>
          <div className="rounded-lg bg-sky-50 p-3">
            <p className="text-2xl font-bold text-brand">{questionCount.reading}</p>
            <p className="text-xs text-slate-600">Soal Reading</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-3">
            <p className="text-2xl font-bold text-accent-dark">{TOTAL_TIME / 60}</p>
            <p className="text-xs text-slate-600">Menit</p>
          </div>
        </div>

        <ul className="mt-6 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
          <li>Waktu mulai berjalan setelah tombol <b>Mulai Tes</b> ditekan.</li>
          <li>
            <b>Listening</b>: audio diputar otomatis dan hanya sekali. Soal berpindah sendiri{" "}
            {ANSWER_DELAY_SECONDS} detik setelah audio selesai.
          </li>
          <li>
            <b>Reading</b>: Anda bisa kembali ke soal sebelumnya (<i>Previous</i>) dan menandai soal
            dengan <i>Mark for Review</i>.
          </li>
          <li>
            Jawaban tersimpan otomatis. Jika halaman tertutup, masuk lagi dengan nomor peserta yang
            sama untuk melanjutkan.
          </li>
          <li>Gunakan headset/speaker dan pastikan volume sudah pas.</li>
        </ul>

        <Button variant="primary" className="mt-8 w-full py-3 text-base" onClick={onStart}>
          Mulai Tes
        </Button>
      </div>
    </ScreenLayout>
  );
}

/** d01 — layar transisi singkat, auto-next (script.js: 3 detik). */
export function TransitionScreen({
  title,
  seconds,
  onDone,
}: {
  title: string;
  seconds: number;
  onDone: () => void;
}) {
  const [left, setLeft] = useState(seconds);
  const done = useEffectEvent(() => onDone());

  useEffect(() => {
    let remaining = seconds;
    const id = window.setInterval(() => {
      remaining -= 1;
      setLeft(remaining);
      if (remaining <= 0) {
        window.clearInterval(id);
        done();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [seconds]);

  return (
    <ScreenLayout>
      <div className="mx-auto flex max-w-xl flex-col items-center py-16 text-center">
        <p className="text-sm font-semibold tracking-[0.2em] text-accent-dark uppercase">VIERA</p>
        <h1 className="mt-2 text-4xl font-bold text-brand">{title}</h1>
        <p className="mt-4 text-slate-600">Starting in {Math.max(left, 0)}…</p>
      </div>
    </ScreenLayout>
  );
}

type ListeningDirectionProps = {
  item: DirectionItem;
  image: string;
  label: string;
  readSeconds: number;
  audioRef: RefObject<HTMLAudioElement | null>;
  onDone: () => void;
  onZoom: (src: string) => void;
};

/**
 * d1–d4 — direction listening. Seperti script.js: putar audio direction lalu lanjut otomatis.
 * Jika file audionya tidak ada, beri waktu membaca + tombol Continue.
 */
export function ListeningDirection({
  item,
  image,
  label,
  readSeconds,
  audioRef,
  onDone,
  onZoom,
}: ListeningDirectionProps) {
  const [status, setStatus] = useState<"playing" | "after" | "reading">(
    item.audio ? "playing" : "reading",
  );
  const [left, setLeft] = useState(item.audio ? ANSWER_DELAY_SECONDS : readSeconds);
  const done = useEffectEvent(() => onDone());

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !item.audio) return;
    let active = true;
    let failed = false;

    const fail = () => {
      if (!active || failed) return;
      failed = true;
      setLeft(readSeconds);
      setStatus("reading");
    };
    const onEnded = () => {
      if (!active) return;
      setLeft(ANSWER_DELAY_SECONDS);
      setStatus("after");
    };

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", fail);
    audio.src = item.audio;
    audio.play().catch((error: DOMException) => {
      if (active && error.name !== "AbortError") fail();
    });

    return () => {
      active = false;
      audio.pause();
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", fail);
    };
  }, [audioRef, item.audio, readSeconds]);

  useEffect(() => {
    if (status === "playing") return;
    let remaining = status === "after" ? ANSWER_DELAY_SECONDS : readSeconds;
    const id = window.setInterval(() => {
      remaining -= 1;
      setLeft(remaining);
      if (remaining <= 0) {
        window.clearInterval(id);
        done();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [status, readSeconds]);

  return (
    <ScreenLayout
      footer={
        <>
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <p className="shrink-0 text-sm font-semibold text-slate-700" aria-live="polite">
              {status === "playing"
                ? "🔊 Listen to the directions…"
                : `⏱ The test continues in ${Math.max(left, 0)}s`}
            </p>
            {status === "reading" && (
              <div className="hidden min-w-24 flex-1 sm:block">
                <ProgressBar tone="amber" value={left / readSeconds} />
              </div>
            )}
          </div>
          {status === "reading" && (
            <Button variant="primary" onClick={onDone}>
              Continue →
            </Button>
          )}
        </>
      }
    >
      <DirectionImage src={image} alt={label} onZoom={onZoom} />
    </ScreenLayout>
  );
}

/** d5–d7 — direction reading dengan tombol Continue (dan Previous untuk d6, d7). */
export function ReadingDirection({
  image,
  label,
  onNext,
  onPrev,
  onZoom,
}: {
  image: string;
  label: string;
  onNext: () => void;
  onPrev?: () => void;
  onZoom: (src: string) => void;
}) {
  return (
    <ScreenLayout
      footer={
        <>
          <div>{onPrev && <Button onClick={onPrev}>← Previous</Button>}</div>
          <Button variant="primary" onClick={onNext}>
            Continue →
          </Button>
        </>
      }
    >
      <DirectionImage src={image} alt={label} onZoom={onZoom} />
    </ScreenLayout>
  );
}

/** Tampil saat melanjutkan tes di bagian listening (butuh klik agar audio boleh diputar). */
export function ResumeScreen({
  participant,
  position,
  remaining,
  onContinue,
}: {
  participant: Participant;
  position: string;
  remaining: number;
  onContinue: () => void;
}) {
  return (
    <ScreenLayout>
      <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <h1 className="text-xl font-bold text-brand">Lanjutkan Tes</h1>
        <p className="mt-2 text-sm text-slate-600">
          {participant.std_name}, tes Anda akan dilanjutkan dari <b>{position}</b>.
        </p>
        <p className="mt-4 font-mono text-3xl font-bold tabular-nums text-slate-800">
          {formatTime(remaining)}
        </p>
        <p className="text-xs text-slate-500">sisa waktu</p>
        <p className="mt-4 text-xs text-slate-500">
          Audio soal ini akan diputar ulang dari awal.
        </p>
        <Button variant="primary" className="mt-6 w-full py-3 text-base" onClick={onContinue}>
          Lanjutkan
        </Button>
      </div>
    </ScreenLayout>
  );
}
