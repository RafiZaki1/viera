import type { DiagnosticItem, ToeicResult } from "./types";

export const PART_NAMES: Record<number, string> = {
  1: "Photographs",
  2: "Question-Response",
  3: "Conversations",
  4: "Talks",
  5: "Incomplete Sentences",
  6: "Text Completion",
  7: "Reading Comprehension",
};

export function scaleRawScore(raw: number): number {
  const bounded = Math.max(0, Math.min(50, raw));
  if (bounded === 0) return 5;
  if (bounded === 50) return 495;
  const scaled = 5 + (bounded / 50) * 490;
  return Math.round(scaled / 5) * 5;
}

export function getProficiencyLevel(totalScore: number): { level: string; description: string } {
  if (totalScore <= 250) {
    return {
      level: "Elementary Proficiency (CEFR A1)",
      description: "Mampu memahami instruksi dan kosakata dasar yang sering digunakan dalam kehidupan sehari-hari.",
    };
  }
  if (totalScore <= 400) {
    return {
      level: "Elementary Proficiency Plus (CEFR A2)",
      description: "Mampu memahami informasi faktual sederhana dan percakapan rutin di lingkungan kerja.",
    };
  }
  if (totalScore <= 600) {
    return {
      level: "Limited Working Proficiency (CEFR B1)",
      description: "Mampu berpartisipasi dalam percakapan kerja umum dan memahami ide utama teks tertulis sederhana.",
    };
  }
  if (totalScore <= 780) {
    return {
      level: "Working Proficiency (CEFR B2)",
      description: "Mampu berkomunikasi secara efektif dalam sebagian besar situasi bisnis, rapat, dan korespondensi tertulis.",
    };
  }
  if (totalScore <= 900) {
    return {
      level: "Working Proficiency Plus (CEFR B2+)",
      description: "Pemahaman mendalam tentang nuansa bahasa Inggris bisnis dan teks bacaan yang kompleks.",
    };
  }
  return {
    level: "International Professional Proficiency (CEFR C1)",
    description: "Penguasaan bahasa tingkat tinggi, mampu memahami detail tersirat dan berkomunikasi secara fasih.",
  };
}

export function calculateToeicScore(listeningCorrect: number, readingCorrect: number): ToeicResult {
  const listeningScore = scaleRawScore(listeningCorrect);
  const readingScore = scaleRawScore(readingCorrect);
  const totalScore = listeningScore + readingScore;
  const { level, description } = getProficiencyLevel(totalScore);

  return {
    listeningScore,
    readingScore,
    totalScore,
    level,
    description,
  };
}

const PART_RECOMMENDATIONS: Record<number, string> = {
  1: "Fokus pada pengamatan subjek, aksi utama, dan benda di latar belakang gambar sebelum audio diputar.",
  2: "Perhatikan kata tanya di awal kalimat (Who, When, Where, Why, How) dan hindari jebakan kemiripan bunyi kata.",
  3: "Biasakan membaca sekilas pertanyaan dan opsi jawaban sebelum percakapan audio dimulai untuk mengantisipasi informasi kunci.",
  4: "Fokus mencatat gagasan utama pembicara, konteks pengumuman, dan instruksi spesifik di akhir pembicaraan.",
  5: "Perkuat pemahaman struktur tata bahasa, jenis kata (kata benda, kerja, sifat, keterangan), dan kolokasi kata.",
  6: "Pahami konteks keseluruhan paragraf sebelum memilih kata penghubung atau bentuk kata kerja yang tepat.",
  7: "Tingkatkan kecepatan membaca memindai (skimming dan scanning) untuk menemukan kata kunci dalam surat, brosur, atau artikel.",
};

export function generateDiagnostics(parts: { part: number; correct: number; total: number }[]): DiagnosticItem[] {
  return parts.map((item) => {
    const accuracy = item.total > 0 ? item.correct / item.total : 0;
    let status: DiagnosticItem["status"] = "moderate";
    let recommendation = "Pertahankan pemahaman materi dan tingkatkan latihan soal berkala pada bagian ini.";

    if (accuracy >= 0.75) {
      status = "strong";
      recommendation = "Kemampuan sudah sangat baik, pertahankan konsistensi akurasi.";
    } else if (accuracy < 0.6) {
      status = "weak";
      recommendation = PART_RECOMMENDATIONS[item.part] ?? "Tingkatkan latihan soal dan pemahaman materi pada bagian ini.";
    }

    return {
      part: item.part,
      label: PART_NAMES[item.part] ?? `Part ${item.part}`,
      accuracy,
      correct: item.correct,
      total: item.total,
      status,
      recommendation,
    };
  });
}
