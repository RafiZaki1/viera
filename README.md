# VIERA — Aplikasi Tes Listening & Reading

Aplikasi tes berbasis Next.js dari materi VIERA (audio, gambar, dan `test.json`).
Alur dan logikanya mengikuti `script.js` versi lama.

## Menjalankan

```bash
npm install
npm run dev          # http://localhost:3000
```

Produksi:

```bash
npm run build
npm start
```

Penilaian dilakukan lewat Server Action, jadi aplikasi harus dijalankan dengan `next start`
(atau hosting yang mendukung Next.js), bukan sebagai file statis.

## Alur tes

1. **Masuk** (`/`) — peserta cukup mengisi nama; nomor peserta dibuat acak otomatis (`VIERA-XXXXXX`). Disimpan seperti di script.js:
   `sessionStorage.std_code` dan `localStorage["vieraData::<kode>"]`.
2. **Tes** (`/test`)
   - Petunjuk umum → *Listening Test* → direction Part 1–4.
   - Listening: audio diputar otomatis sekali; 5 detik setelah audio selesai pindah ke soal berikutnya.
     Soal 18–50 tampil tiga sekaligus (soal aktif disorot, lainnya redup) beserta grafiknya.
   - Reading: Previous/Next, *Mark for Review*, direction Part 6 & 7 punya tombol Previous.
   - Setelah sampai soal 100 muncul tombol **Marked Questions** (soal ditandai & belum dijawab).
     Next di soal 100 membuka dialog **End of the Test** (Cancel / View Marked Questions / Submit).
   - Timer global 60 menit; saat habis jawaban langsung dikirim.
3. **Hasil** (`/result`) — skor total, Listening/Reading, per Part, dan pembahasan kunci jawaban.

Progres (posisi soal, sisa waktu, jawaban, tanda) tersimpan di `localStorage` dengan
namespace `<kode>::`, sehingga peserta bisa melanjutkan setelah halaman tertutup.

Saat `npm run dev` ada tombol **⏭ Dev Next** di soal listening untuk melompati audio
(tidak muncul di build produksi).

## Struktur

```
public/audio/         audio soal (1.mp3 … 50.mp3)
public/images/        gambar soal & passage
public/directions/    gambar direction (tanpa header)
public/banner.png     header VIERA
src/data/test.json    soal + kunci jawaban (field "answer")
src/lib/exam.ts       memuat soal & menilai jawaban (server-only)
src/lib/config.ts     durasi tes, jeda jawaban, pemetaan direction
src/lib/storage.ts    penyimpanan sesi & progres
src/components/exam/  layar tes (listening, reading, direction, dialog)
KUNCI-JAWABAN.md      kunci jawaban beserta alasannya
```

## Mengubah soal atau kunci jawaban

Edit `src/data/test.json`. Setiap soal punya `answer` (huruf `A`–`D`) dan `part` (1–7).
Kunci jawaban hanya dibaca di server, tidak ikut terkirim ke browser.

## File yang belum ada

`test.json` merujuk beberapa audio yang tidak disertakan:

- `41.mp3` — soal 41 tetap tampil dengan waktu menjawab 10 detik.
- `direction1.mp3` … `direction4.mp3` — direction Part 1–4 ditampilkan dengan hitung mundur
  dan tombol *Continue*.

Cukup taruh file tersebut di `public/audio/` dan aplikasi otomatis memakainya.
