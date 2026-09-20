import type { Metadata } from "next";
import { Banner } from "@/components/Banner";
import { ExamApp } from "@/components/client-only";
import { getExamItems } from "@/lib/exam";

export const metadata: Metadata = { title: "Tes" };

export default function TestPage() {
  // Soal dikirim tanpa kunci jawaban; penilaian di server (app/actions.ts).
  return (
    <>
      <Banner />
      <ExamApp items={getExamItems()} />
    </>
  );
}
