"use client";

import { useEffect, useEffectEvent, useState, type RefObject } from "react";
import { ANSWER_DELAY_SECONDS, MISSING_AUDIO_SECONDS } from "@/lib/config";
import type { Answers, Letter, QuestionItem } from "@/lib/types";
import { Button } from "../ui";
import { ProgressBar, ScreenLayout, ZoomableImage } from "./layout";
import { QuestionCard } from "./QuestionCard";

type Status = "loading" | "playing" | "answering" | "missing" | "blocked";

type Props = {
  item: QuestionItem;
  /** Set 3 soal (q18–q50) yang tampil bersamaan, termasuk soal aktif. */
  group: QuestionItem[] | null;
  answers: Answers;
  onAnswer: (id: string, letter: Letter) => void;
  audioRef: RefObject<HTMLAudioElement | null>;
  onFinished: () => void;
  onZoom: (src: string) => void;
};

const isDev = process.env.NODE_ENV === "development";

/**
 * Soal listening: audio diputar otomatis sekali, lalu setelah jeda
 * ANSWER_DELAY_SECONDS pindah ke soal berikutnya (startListeningSession di script.js).
 */
export function ListeningScreen({
  item,
  group,
  answers,
  onAnswer,
  audioRef,
  onFinished,
  onZoom,
}: Props) {
  const [status, setStatus] = useState<Status>(item.audio ? "loading" : "missing");
  const [countdown, setCountdown] = useState(
    item.audio ? ANSWER_DELAY_SECONDS : MISSING_AUDIO_SECONDS,
  );
  const [progress, setProgress] = useState(0);
  const finish = useEffectEvent(() => onFinished());

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !item.audio) return;
    let active = true;
    let failed = false;

    const fail = () => {
      if (!active || failed) return;
      failed = true;
      setCountdown(MISSING_AUDIO_SECONDS);
      setStatus("missing");
    };
    const onPlaying = () => {
      if (active) setStatus("playing");
    };
    const onTimeUpdate = () => {
      if (active && audio.duration) setProgress(audio.currentTime / audio.duration);
    };
    const onEnded = () => {
      if (!active) return;
      setProgress(1);
      setCountdown(ANSWER_DELAY_SECONDS);
      setStatus("answering");
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", fail);
    audio.src = item.audio;
    audio.play().catch((error: DOMException) => {
      if (!active) return;
      if (error.name === "NotAllowedError") setStatus("blocked");
      else if (error.name !== "AbortError") fail();
    });

    return () => {
      active = false;
      audio.pause();
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", fail);
    };
  }, [audioRef, item.audio]);

  // Hitung mundur waktu menjawab, lalu lanjut otomatis.
  useEffect(() => {
    if (status !== "answering" && status !== "missing") return;
    let left = status === "answering" ? ANSWER_DELAY_SECONDS : MISSING_AUDIO_SECONDS;
    const id = window.setInterval(() => {
      left -= 1;
      setCountdown(left);
      if (left <= 0) {
        window.clearInterval(id);
        finish();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [status]);

  const playManually = () => {
    audioRef.current?.play().catch(() => setStatus("blocked"));
  };

  const card = (q: QuestionItem, state?: "active" | "muted") => (
    <QuestionCard
      key={q.id}
      item={q}
      value={answers[q.id]}
      state={state}
      onChange={q.id === item.id ? (letter) => onAnswer(q.id, letter) : undefined}
    />
  );

  let content;
  if (group) {
    const graphic = group.find((q) => q.groupImage)?.groupImage;
    content = (
      <div className="space-y-5">
        {graphic && (
          <ZoomableImage
            src={graphic}
            alt="Graphic for this set of questions"
            onZoom={onZoom}
            className="mx-auto w-fit max-w-full p-2"
            imageClassName="max-h-60 w-auto max-w-full"
          />
        )}
        <div className="grid items-start gap-4 lg:grid-cols-3">
          {group.map((q) => card(q, q.id === item.id ? "active" : "muted"))}
        </div>
      </div>
    );
  } else if (item.image) {
    content = (
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <ZoomableImage src={item.image} alt={`Picture for question ${item.number}`} onZoom={onZoom} className="p-2" />
        {card(item)}
      </div>
    );
  } else {
    content = <div className="mx-auto max-w-xl">{card(item)}</div>;
  }

  return (
    <ScreenLayout
      footer={
        <>
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <StatusLabel status={status} countdown={countdown} />
            <div className="hidden min-w-24 flex-1 sm:block">
              {status === "answering" || status === "missing" ? (
                <ProgressBar
                  tone="amber"
                  value={
                    countdown /
                    (status === "answering" ? ANSWER_DELAY_SECONDS : MISSING_AUDIO_SECONDS)
                  }
                />
              ) : (
                <ProgressBar value={progress} />
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {status === "blocked" && (
              <Button variant="primary" onClick={playManually}>
                ▶ Putar audio
              </Button>
            )}
            {isDev && (
              <Button variant="ghost" onClick={onFinished} title="Hanya tampil saat development">
                ⏭ Dev Next
              </Button>
            )}
          </div>
        </>
      }
    >
      {content}
    </ScreenLayout>
  );
}

function StatusLabel({ status, countdown }: { status: Status; countdown: number }) {
  const text = {
    loading: "⏳ Loading audio…",
    playing: "🔊 Listen carefully…",
    answering: `⏱ Next question in ${countdown}s`,
    missing: `⚠️ Audio tidak tersedia — lanjut dalam ${countdown} detik`,
    blocked: "🔇 Browser memblokir audio. Klik “Putar audio”.",
  }[status];
  return (
    <p
      className={
        status === "playing"
          ? "shrink-0 text-sm font-semibold text-brand animate-viera-pulse"
          : "shrink-0 text-sm font-semibold text-slate-700"
      }
      aria-live="polite"
    >
      {text}
    </p>
  );
}
