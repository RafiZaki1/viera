# Rencana implementasi fitur evaluasi dan review VIERA

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun antarmuka evaluasi hasil ujian VIERA yang mencakup konversi estimasi skor TOEIC, analisis diagnostik kelemahan materi per part, review kartu soal lengkap dengan pemutar audio ulang, pembahasan dari KUNCI-JAWABAN.md, filter jawaban, serta tata letak cetak PDF.

**Architecture:** Data pembahasan diekstrak dari `KUNCI-JAWABAN.md` menjadi `src/data/explanations.json`. Logika `gradeAnswers` di `src/lib/exam.ts` memperkaya objek detail dan menghitung skor TOEIC serta diagnostik kelemahan. Halaman `/result` memanfaatkan data terpadu ini untuk memberikan pengalaman interaktif cepat di sisi klien.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4.

---

### Task 1: Ekstraksi data pembahasan dan pengayaan tipe TypeScript

**Files:**
- Create: `src/data/explanations.json`
- Modify: `src/lib/types.ts`
- Test: `scripts/validate-explanations.mjs`

- [ ] **Step 1: Buat skrip validasi kelengkapan penjelasan**
Memastikan terdapat 100 butir soal (q1 sampai q100) dengan kunci dan teks penjelasan yang tidak kosong.

- [ ] **Step 2: Jalankan skrip validasi dan verifikasi kegagalan**
Verifikasi bahwa skrip mendeteksi ketiadaan berkas `src/data/explanations.json`.

- [ ] **Step 3: Buat data `src/data/explanations.json` dan perbarui `src/lib/types.ts`**
Ekstrak seluruh penjelasan dari `KUNCI-JAWABAN.md` dan sesuaikan tipe `ResultDetail`, `ToeicResult`, `DiagnosticItem`, dan `ExamResult`.

- [ ] **Step 4: Jalankan skrip validasi dan pastikan berhasil**
Pastikan 100 butir soal valid dan cocok dengan data di `src/data/test.json`.

- [ ] **Step 5: Simpan perubahan ke git**

---

### Task 2: Modul kalkulasi konversi skor TOEIC dan diagnostik materi

**Files:**
- Create: `src/lib/toeic.ts`
- Modify: `src/lib/exam.ts`
- Test: `scripts/test-scoring.mjs`

- [ ] **Step 1: Buat pengujian kalkulasi skor dan diagnostik**
Menguji konversi skor mentah (0, 25, 50) ke skala TOEIC (10 sampai 990) dan pendeteksian part lemah.

- [ ] **Step 2: Jalankan pengujian dan verifikasi kegagalan**
Memastikan pengujian gagal karena fungsi belum diimplementasikan.

- [ ] **Step 3: Implementasikan `src/lib/toeic.ts` dan integrasikan ke `gradeAnswers` di `src/lib/exam.ts`**
Implementasikan pemetaan tabel TOEIC dan pengayaan `ResultDetail` dengan pertanyaan, opsi, media, dan pembahasan.

- [ ] **Step 4: Jalankan pengujian dan pastikan berhasil**
Konfirmasi akurasi perhitungan skor dan format data hasil pengujian.

- [ ] **Step 5: Simpan perubahan ke git**

---

### Task 3: Komponen pemutar audio review dan kartu soal interaktif

**Files:**
- Create: `src/components/ReviewAudioPlayer.tsx`
- Create: `src/components/ReviewQuestionCard.tsx`
- Modify: `src/components/ResultView.tsx`

- [ ] **Step 1: Buat komponen pemutar audio khusus review**
Mendukung pemutaran audio, jeda, indikator durasi, dan pengatur kecepatan putar (0.75x, 1x, 1.25x) tanpa batasan waktu.

- [ ] **Step 2: Buat komponen kartu soal interaktif**
Menampilkan nomor, lencana status jawaban (benar, salah, tidak dijawab), gambar dan passage, teks pertanyaan, opsi jawaban dengan penyorotan warna cerdas, serta kotak pembahasan.

- [ ] **Step 3: Integrasikan kartu soal dan filter ke `ResultView.tsx`**
Menyediakan filter (Semua, Salah, Benar, Tidak Dijawab, dan Part 1 sampai 7), pencarian instan, dan kisi navigasi cepat.

- [ ] **Step 4: Verifikasi build dan tampilan**
Jalankan kompilasi proyek `npm run build` untuk memeriksa ketiadaan galat tipe atau sintaks.

- [ ] **Step 5: Simpan perubahan ke git**

---

### Task 4: Modul diagnostik kelemahan, konversi nilai, dan tata letak cetak PDF

**Files:**
- Modify: `src/components/ResultView.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Tambahkan kartu ringkasan estimasi TOEIC dan diagnostik belajar**
Tampilkan skor konversi TOEIC, level kemahiran, dan rekomendasi fokus perbaikan pada bagian dengan akurasi terendah.

- [ ] **Step 2: Tambahkan tata letak ramah cetak (print stylesheet)**
Konfigurasikan aturan `@media print` untuk menyembunyikan tombol navigasi, mengoptimalkan tata letak kartu hasil tes, dan menyiapkan lembar laporan siap unduh PDF.

- [ ] **Step 3: Uji fungsionalitas menyeluruh dengan build produksi**
Jalankan `npm run build` dan periksa kinerja halaman hasil.

- [ ] **Step 4: Simpan perubahan ke git**
