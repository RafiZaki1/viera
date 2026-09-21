"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { TOTAL_TIME } from "@/lib/config";
import {
  checkSession,
  clearNotice,
  createExamStore,
  forgetLastParticipant,
  generateCode,
  getLastParticipant,
  login,
  logout,
  peekNotice,
} from "@/lib/storage";
import type { Participant } from "@/lib/types";
import { Button } from "./ui";

export default function LoginForm() {
  const router = useRouter();
  const [notice] = useState(() => peekNotice());
  // Sesi aktif, atau peserta terakhir di perangkat ini (bila tab sempat ditutup).
  const [current, setCurrent] = useState<Participant | null>(() => {
    const session = checkSession();
    return session.ok ? session.participant : getLastParticipant();
  });
  const [code, setCode] = useState(() => generateCode());
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Pesan (mis. "Anda belum login") hanya tampil sekali.
  useEffect(() => {
    clearNotice();
  }, []);

  const enter = (participant: Participant) => {
    login(participant.std_code, participant.std_name);
    const submitted = createExamStore(participant.std_code).get("result");
    router.push(submitted ? "/result" : "/test");
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const stdName = name.trim().replace(/\s+/g, " ");
    if (stdName.length < 3) {
      setError("Nama lengkap minimal 3 karakter.");
      return;
    }
    enter({ std_code: code, std_name: stdName });
  };

  return (
    <div className="w-full max-w-md">
      {notice && (
        <p className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {notice}
        </p>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-brand">Masuk Peserta</h1>
        <p className="mt-1 text-sm text-slate-600">
          Listening and Reading Comprehension Module · 100 soal · {TOTAL_TIME / 60} menit
        </p>

        {current ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-md bg-sky-50 px-4 py-3 text-sm text-slate-700">
              Anda masuk sebagai <b>{current.std_name}</b> ({current.std_code}).
            </p>
            <Button variant="primary" className="w-full py-3" onClick={() => enter(current)}>
              Lanjutkan
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                logout();
                forgetLastParticipant();
                setCode(generateCode());
                setCurrent(null);
              }}
            >
              Peserta baru
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <p className="mb-1 text-sm font-semibold text-slate-700">Nomor Peserta</p>
              <div className="flex items-center gap-2">
                <output
                  aria-label="Nomor peserta"
                  className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-lg font-bold tracking-wider text-brand"
                >
                  {code}
                </output>
                <Button onClick={() => setCode(generateCode())} title="Buat nomor baru">
                  ↻ Acak
                </Button>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Dibuat otomatis. Jika halaman tertutup, tes bisa dilanjutkan dari perangkat ini.
              </p>
            </div>
            <div>
              <label htmlFor="std_name" className="mb-1 block text-sm font-semibold text-slate-700">
                Nama Lengkap
              </label>
              <input
                id="std_name"
                name="std_name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                autoComplete="name"
                autoFocus
                placeholder="Nama sesuai data peserta"
                className="w-full rounded-md border border-slate-300 px-3 py-2.5 outline-none focus:border-exam-active focus:ring-2 focus:ring-sky-200"
                required
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-rose-700">
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" className="w-full py-3 text-base">
              Masuk
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
