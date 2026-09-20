import type { Metadata } from "next";
import { Banner } from "@/components/Banner";
import { ResultView } from "@/components/client-only";

export const metadata: Metadata = { title: "Hasil Tes" };

export default function ResultPage() {
  return (
    <>
      <Banner />
      <ResultView />
    </>
  );
}
