# Evaluasi dan review hasil tes VIERA

Status: Proposed

## Context

Aplikasi VIERA saat ini menampilkan ringkasan skor numerik dan tabel status jawaban singkat pada rute `/result`. Peserta tes hanya melihat apakah jawaban mereka benar atau salah tanpa konteks soal, pilihan opsi, pemutar audio ulang, maupun alasan di balik kunci jawaban. Materi penjelasan lengkap telah tersedia di dokumen `KUNCI-JAWABAN.md`.

Tujuan dari perubahan ini adalah memberikan pengalaman diagnostik belajar lengkap setelah tes diselesaikan:
1. Menyertakan detail soal, gambar, dan pemutar audio untuk setiap butir pertanyaan listening.
2. Menyajikan pembahasan dan kutipan transkrip dari `KUNCI-JAWABAN.md`.
3. Menghitung estimasi skor setara skala TOEIC (10 sampai 990).
4. Menyusun modul diagnostik kelemahan materi per bagian (Part 1 sampai 7).
5. Menyediakan tata letak ramah cetak (print-friendly) untuk ekspor hasil ujian ke PDF atau printer fisik.

## Decision

Menerapkan pendekatan pengiriman payload terpadu dari Server Action saat pengiriman ujian (`submitExam`).

### 1. Struktur data pembahasan (`src/data/explanations.json`)
Mengekstrak 100 data pembahasan dan kutipan transkrip dari `KUNCI-JAWABAN.md` menjadi berkas JSON terstruktur dengan pemetaan id soal:
```json
{
  "q1": {
    "key": "B",
    "explanation": "Pria di kiri memakai jas. One of the men is wearing a jacket."
  }
}
```

### 2. Modul konversi skor TOEIC (`src/lib/toeic.ts`)
Mengonversi jumlah jawaban benar listening (0 sampai 50) dan reading (0 sampai 50) menjadi skor berskala 5 sampai 495 per bagian dan skor total 10 sampai 990 dengan tabel konversi proporsional standar TOEIC. Menghasilkan label kemahiran (misalnya Elementary, Intermediate, Working Proficiency).

### 3. Modul diagnostik materi
Menghitung persentase keberhasilan per part. Bagian dengan akurasi di bawah ambang batas (60 persen) ditandai sebagai area yang memerlukan latihan intensif bersama saran fokus belajar.

### 4. Perluasan tipe data (`src/lib/types.ts`)
Memperkaya `ResultDetail` dengan properti:
- `question?: string`
- `options?: string[]`
- `image?: string`
- `groupImage?: string`
- `audio?: string`
- `explanation?: string`

Serta menambahkan properti `toeic` dan `diagnostics` pada tipe `ExamResult`.

### 5. Komponen antarmuka review (`src/components/ResultView.tsx` dan subkomponen)
- Kartu skor utama dengan skor mentah dan estimasi TOEIC.
- Kartu diagnostik kelemahan materi.
- Filter review (Semua, Salah Saja, Benar Saja, Belum Dijawab, atau Part 1 sampai 7).
- Kisi navigasi nomor soal yang dapat diklik.
- Kartu detail soal interaktif dengan penyorotan warna opsi jawaban (hijau untuk kunci, merah untuk pilihan salah pengguna), pemutar audio mandiri (play, pause, kontrol kecepatan 0.75x, 1x, 1.25x), dan kotak penjelasan dasar jawaban.
- Tombol cetak dengan stylesheet cetak khusus untuk menyembunyikan navigasi dan menghasilkan laporan evaluasi rapi.

## Alternatives considered

1. Pengambilan data bertahap via API on-demand.
Ditolak karena membutuhkan koneksi aktif berulang dan membuat transisi filter soal terasa lambat dibanding pemrosesan di memori browser.
2. Penanaman seluruh kunci dan pembahasan langsung ke bundel kode klien sejak awal.
Ditolak karena berisiko memungkinkan peserta memeriksa kunci jawaban sebelum menyelesaikan tes.

## Consequences

- Ukuran payload `submitExam` bertambah sekitar 35 kilobita, masih berada jauh di bawah batas transfer wajar dan kapasitas penyimpanan lokal browser.
- Kunci jawaban dan pembahasan tetap aman di sisi server hingga sesi pengerjaan ujian benar-benar diserahkan.
- Halaman hasil ujian menjadi media belajar mandiri yang lengkap tanpa membutuhkan aplikasi pihak ketiga.

## Verification plan

1. Skrip validasi integritas data: memastikan seluruh 100 butir soal memiliki kunci dan penjelasan valid.
2. Pengujian fungsi konversi skor: memastikan pemetaan nilai 0, nilai tengah, dan nilai 100 menghasilkan skala skor yang akurat.
3. Kompilasi TypeScript dan linting: `npm run build` dan `npm run lint`.
4. Pengujian alur antarmuka di peramban: menyelesaikan simulasi tes dan memverifikasi interaksi filter, audio replay, dan tampilan cetak.
