// Penyimpanan sesi & progres, mengikuti pola script.js:
// - sessionStorage "std_code"          → kode peserta yang sedang login
// - localStorage "vieraData::<kode>"   → data peserta ({ std_code, std_name })
// - localStorage "<kode>::<key>"       → progres tes per peserta (namespace)

import type { Participant } from "./types";

const SESSION_KEY = "std_code";
const NOTICE_KEY = "viera_notice";
const participantKey = (code: string) => `vieraData::${code}`;

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

export function getSessionCode(): string | null {
  return safe(() => sessionStorage.getItem(SESSION_KEY), null);
}

export function getParticipant(code: string): Participant | null {
  const data = safe(
    () => JSON.parse(localStorage.getItem(participantKey(code)) ?? "null"),
    null,
  );
  return data?.std_name ? { std_code: code, std_name: data.std_name } : null;
}

export type SessionCheck =
  | { ok: true; participant: Participant }
  | { ok: false; message: string };

/** Pengecekan yang sama dengan bagian awal script.js. */
export function checkSession(): SessionCheck {
  const code = getSessionCode();
  if (!code) {
    return { ok: false, message: "Anda belum login. Silakan login terlebih dahulu." };
  }
  const participant = getParticipant(code);
  if (!participant) {
    return { ok: false, message: "Data peserta tidak ditemukan. Silakan login ulang." };
  }
  return { ok: true, participant };
}

export function login(code: string, name: string) {
  localStorage.setItem(
    participantKey(code),
    JSON.stringify({ std_code: code, std_name: name }),
  );
  sessionStorage.setItem(SESSION_KEY, code);
}

export function logout() {
  safe(() => sessionStorage.removeItem(SESSION_KEY), undefined);
}

/** Pesan satu kali untuk halaman login (pengganti alert() di script.js). */
export function setNotice(message: string) {
  safe(() => sessionStorage.setItem(NOTICE_KEY, message), undefined);
}

export function peekNotice(): string | null {
  return safe(() => sessionStorage.getItem(NOTICE_KEY), null);
}

export function clearNotice() {
  safe(() => sessionStorage.removeItem(NOTICE_KEY), undefined);
}

export type ExamStore = ReturnType<typeof createExamStore>;

/** Akses localStorage dengan namespace "<kode>::" seperti di script.js. */
export function createExamStore(code: string) {
  const ns = `${code}::`;
  const get = (key: string) => safe(() => localStorage.getItem(ns + key), null);
  const set = (key: string, value: string) =>
    safe(() => localStorage.setItem(ns + key, value), undefined);

  return {
    get,
    set,
    getNumber(key: string): number | null {
      const n = Number.parseInt(get(key) ?? "", 10);
      return Number.isFinite(n) ? n : null;
    },
    getJSON<T>(key: string): T | null {
      return safe(() => JSON.parse(get(key) ?? "null") as T | null, null);
    },
    setJSON: (key: string, value: unknown) => set(key, JSON.stringify(value)),
    /** Hapus seluruh progres & hasil peserta ini (data login tetap). */
    clear: () =>
      safe(() => {
        Object.keys(localStorage)
          .filter((k) => k.startsWith(ns))
          .forEach((k) => localStorage.removeItem(k));
      }, undefined),
  };
}
