"use client";

import { useRouter } from "next/navigation";
import {
  startTransition,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { submitExam } from "@/app/actions";
import { DIRECTIONS, threeQuestionSet, TOTAL_TIME } from "@/lib/config";
import { checkSession, createExamStore, setNotice } from "@/lib/storage";
import {
  isQuestion,
  type Answers,
  type ExamItem,
  type ExamResult,
  type Letter,
  type Participant,
  type QuestionItem,
  type StoredResult,
} from "@/lib/types";
import { Button, cn, LoadingScreen, Spinner } from "../ui";
import { EndDialog, MarkedDialog, ZoomDialog } from "./Dialogs";
import {
  IntroScreen,
  ListeningDirection,
  ReadingDirection,
  ResumeScreen,
  TransitionScreen,
} from "./DirectionScreens";
import { ScreenLayout, Toolbar } from "./layout";
import { ListeningScreen } from "./ListeningScreen";
import { ReadingScreen } from "./ReadingScreen";

type Props = { items: ExamItem[] };

/** Cek login seperti awal script.js, lalu jalankan tes. */
export default function ExamApp({ items }: Props) {
  const router = useRouter();
  const [gate] = useState(() => {
    const session = checkSession();
    if (!session.ok) return { kind: "login" as const, message: session.message };
    const submitted = createExamStore(session.participant.std_code).get("result");
    if (submitted) return { kind: "done" as const };
    return { kind: "ok" as const, participant: session.participant };
  });

  useEffect(() => {
    if (gate.kind === "login") {
      setNotice(gate.message);
      router.replace("/");
    } else if (gate.kind === "done") {
      router.replace("/result");
    }
  }, [gate, router]);

  if (gate.kind !== "ok") return <LoadingScreen label="Mengalihkan…" />;
  return <Exam items={items} participant={gate.participant} />;
}

type Phase = "running" | "resume" | "submitting" | "error";

function describe(item: ExamItem, totalQuestions: number) {
  if (item.type === "direction") {
    return { section: DIRECTIONS[item.id]?.label ?? "Directions", position: undefined };
  }
  return {
    section: `${item.type === "listening" ? "Listening" : "Reading"} · Part ${item.part}`,
    position: `Question ${item.number} of ${totalQuestions}`,
  };
}

function isReadingSection(item: ExamItem) {
  return (
    item.type === "reading" ||
    (item.type === "direction" && DIRECTIONS[item.id]?.kind === "reading")
  );
}

function Exam({ items, participant }: { items: ExamItem[]; participant: Participant }) {
  const router = useRouter();
  const [store] = useState(() => createExamStore(participant.std_code));
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastIndex = items.length - 1;

  const questions = useMemo(() => items.filter(isQuestion), [items]);
  const byNumber = useMemo(() => new Map(questions.map((q) => [q.number, q])), [questions]);
  const firstReadingIndex = useMemo(() => items.findIndex(isReadingSection), [items]);

  // State tersimpan per peserta (key sama dengan script.js).
  const [index, setIndex] = useState(() =>
    Math.min(Math.max(store.getNumber("currentQuestion") ?? 0, 0), lastIndex),
  );
  const [answers, setAnswers] = useState<Answers>(() => store.getJSON<Answers>("answers") ?? {});
  const [marked, setMarked] = useState<string[]>(() => store.getJSON<string[]>("marked") ?? []);
  const [reachedEnd, setReachedEnd] = useState(() => store.get("hasReached100") === "true");
  const [remaining, setRemaining] = useState(
    () => store.getNumber("remainingTime") ?? TOTAL_TIME,
  );
  const [started, setStarted] = useState(() => store.get("started") === "true");
  const [timedOut, setTimedOut] = useState(
    () => store.get("examExpired") === "true" || remaining <= 0,
  );
  const [phase, setPhase] = useState<Phase>(() => {
    if (timedOut) return "submitting";
    // Lanjut di bagian listening: perlu satu klik agar browser mengizinkan audio.
    if (started && index < firstReadingIndex) return "resume";
    return "running";
  });
  const [dialog, setDialog] = useState<"end" | "marked" | null>(null);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);

  const item = items[index];
  const info = describe(item, questions.length);

  // ---------------- NAVIGASI (loadQuestion / nextQuestion / previousQuestion) ----------------
  const goTo = (target: number) => {
    const next = Math.min(Math.max(target, 0), lastIndex);
    setIndex(next);
    store.set("currentQuestion", String(next));
    if (next === lastIndex) {
      setReachedEnd(true);
      store.set("hasReached100", "true");
    }
  };

  const goNext = () => {
    // Soal terakhir → modal "End of the Test"
    if (index >= lastIndex) setDialog("end");
    else goTo(index + 1);
  };

  const goPrev = () => goTo(index - 1);

  const jumpTo = (id: string) => {
    const target = items.findIndex((it) => it.id === id);
    if (target === -1) return;
    setDialog(null);
    goTo(target);
  };

  // ---------------- JAWABAN & MARK FOR REVIEW ----------------
  const saveAnswer = (id: string, letter: Letter) => {
    const updated = { ...answers, [id]: letter };
    setAnswers(updated);
    store.setJSON("answers", updated);
  };

  const toggleMarked = (id: string) => {
    const updated = marked.includes(id) ? marked.filter((m) => m !== id) : [...marked, id];
    setMarked(updated);
    store.setJSON("marked", updated);
  };

  // ---------------- GLOBAL TIMER ----------------
  const tick = useEffectEvent(() => {
    const left = Math.max(0, remaining - 1);
    setRemaining(left);
    store.set("remainingTime", String(left));
    if (left === 0) {
      // ⏰ Waktu habis → kirim hasil ujian
      store.set("examExpired", "true");
      setTimedOut(true);
      setDialog(null);
      setZoomSrc(null);
      setPhase("submitting");
    }
  });

  const timerRunning = started && phase === "running";
  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => tick(), 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  // ---------------- SUBMIT (dinilai di server) ----------------
  const finishSubmit = useEffectEvent((result: ExamResult) => {
    const stored: StoredResult = {
      ...result,
      submittedAt: new Date().toISOString(),
      timeUsed: TOTAL_TIME - remaining,
      timedOut,
    };
    store.setJSON("result", stored);
    router.replace("/result");
  });
  const failSubmit = useEffectEvent(() => setPhase("error"));

  useEffect(() => {
    if (phase !== "submitting") return;
    let cancelled = false;
    startTransition(async () => {
      try {
        const result = await submitExam(store.getJSON<Answers>("answers") ?? {});
        if (!cancelled) finishSubmit(result);
      } catch {
        if (!cancelled) failSubmit();
      }
    });
    return () => {
      cancelled = true;
    };
  }, [phase, store]);

  const submit = () => {
    setDialog(null);
    setPhase("submitting");
  };

  // Dipanggil di dalam klik: membuka izin autoplay elemen audio (Safari/iOS).
  const primeAudio = () => {
    audioRef.current?.play().catch(() => {});
  };

  const startTest = () => {
    primeAudio();
    setStarted(true);
    store.set("started", "true");
    goNext();
  };

  // ---------------- TAMPILAN ----------------
  let screen: ReactNode;
  if (phase === "submitting") {
    screen = <SubmittingScreen timedOut={timedOut} />;
  } else if (phase === "error") {
    screen = <SubmitErrorScreen onRetry={() => setPhase("submitting")} />;
  } else if (phase === "resume") {
    screen = (
      <ResumeScreen
        participant={participant}
        position={info.position ?? info.section}
        remaining={remaining}
        onContinue={() => {
          primeAudio();
          setPhase("running");
        }}
      />
    );
  } else if (item.type === "direction") {
    const config = DIRECTIONS[item.id];
    if (config?.kind === "intro") {
      screen = (
        <IntroScreen
          participant={participant}
          questionCount={{
            listening: questions.filter((q) => q.type === "listening").length,
            reading: questions.filter((q) => q.type === "reading").length,
          }}
          onStart={startTest}
        />
      );
    } else if (config?.kind === "transition") {
      screen = (
        <TransitionScreen key={item.id} title={config.label} seconds={config.seconds} onDone={goNext} />
      );
    } else if (config?.kind === "listening") {
      screen = (
        <ListeningDirection
          key={item.id}
          item={item}
          image={config.image}
          label={config.label}
          readSeconds={config.readSeconds}
          audioRef={audioRef}
          onDone={goNext}
          onZoom={setZoomSrc}
        />
      );
    } else if (config?.kind === "reading") {
      screen = (
        <ReadingDirection
          key={item.id}
          image={config.image}
          label={config.label}
          onNext={goNext}
          onPrev={config.canGoBack ? goPrev : undefined}
          onZoom={setZoomSrc}
        />
      );
    } else {
      // Direction tanpa konfigurasi → cukup tombol lanjut
      screen = (
        <ScreenLayout
          footer={
            <>
              <span />
              <Button variant="primary" onClick={goNext}>
                Continue →
              </Button>
            </>
          }
        >
          <p className="text-center text-slate-600">Directions</p>
        </ScreenLayout>
      );
    }
  } else if (item.type === "listening") {
    const set = threeQuestionSet(item.number);
    const group = set
      ? set.map((n) => byNumber.get(n)).filter((q): q is QuestionItem => Boolean(q))
      : null;
    screen = (
      <ListeningScreen
        key={item.id}
        item={item}
        group={group}
        answers={answers}
        onAnswer={saveAnswer}
        audioRef={audioRef}
        onFinished={goNext}
        onZoom={setZoomSrc}
      />
    );
  } else {
    const isMarked = marked.includes(item.id);
    screen = (
      <ReadingScreen
        item={item}
        value={answers[item.id]}
        onAnswer={(letter) => saveAnswer(item.id, letter)}
        onZoom={setZoomSrc}
        footer={
          <>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={goPrev}>← Previous</Button>
              {reachedEnd && (
                <Button variant="warning" onClick={() => setDialog("marked")}>
                  📌 Marked Questions
                </Button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-md border border-sky-500 px-4 py-2 text-sm font-semibold text-sky-800 shadow-sm transition-colors select-none",
                  isMarked ? "bg-sky-200" : "bg-sky-50 hover:bg-sky-100",
                )}
              >
                <input
                  type="checkbox"
                  checked={isMarked}
                  onChange={() => toggleMarked(item.id)}
                  className="size-4 accent-sky-700"
                />
                Mark for Review
              </label>
              <Button variant="primary" onClick={goNext}>
                Next →
              </Button>
            </div>
          </>
        }
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <Toolbar
        name={participant.std_name}
        code={participant.std_code}
        section={info.section}
        position={info.position}
        remaining={remaining}
      />
      <main className="flex flex-1 flex-col">{screen}</main>

      {/* Satu elemen audio dipakai bergantian untuk semua soal listening */}
      <audio ref={audioRef} preload="auto" className="hidden" />

      <EndDialog
        open={dialog === "end"}
        answered={questions.filter((q) => answers[q.id]).length}
        total={questions.length}
        onCancel={() => setDialog(null)}
        onShowMarked={() => setDialog("marked")}
        onSubmit={submit}
      />
      <MarkedDialog
        open={dialog === "marked"}
        questions={questions}
        marked={marked}
        answers={answers}
        onClose={() => setDialog(null)}
        onJump={jumpTo}
      />
      <ZoomDialog src={zoomSrc} onClose={() => setZoomSrc(null)} />
    </div>
  );
}

function SubmittingScreen({ timedOut }: { timedOut: boolean }) {
  return (
    <ScreenLayout>
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
        {timedOut && <p className="text-xl font-bold text-rose-700">⏰ Waktu habis!</p>}
        <Spinner className="size-8 text-brand" />
        <p className="text-slate-700">Mengirim hasil ujian…</p>
      </div>
    </ScreenLayout>
  );
}

function SubmitErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <ScreenLayout>
      <div className="mx-auto max-w-md rounded-xl border border-rose-200 bg-white p-6 text-center shadow-sm">
        <p className="text-lg font-semibold text-rose-700">Gagal mengirim jawaban</p>
        <p className="mt-2 text-sm text-slate-600">
          Jawaban Anda tetap tersimpan di perangkat ini. Periksa koneksi ke server, lalu coba lagi.
        </p>
        <Button variant="primary" className="mt-5" onClick={onRetry}>
          Coba lagi
        </Button>
      </div>
    </ScreenLayout>
  );
}
