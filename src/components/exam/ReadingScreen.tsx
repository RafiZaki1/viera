"use client";

import type { ReactNode } from "react";
import type { Letter, QuestionItem } from "@/lib/types";
import { ScreenLayout, ZoomableImage } from "./layout";
import { QuestionCard } from "./QuestionCard";

type Props = {
  item: QuestionItem;
  value?: Letter;
  onAnswer: (letter: Letter) => void;
  onZoom: (src: string) => void;
  footer: ReactNode;
};

export function ReadingScreen({ item, value, onAnswer, onZoom, footer }: Props) {
  const card = <QuestionCard key={item.id} item={item} value={value} onChange={onAnswer} />;

  return (
    <ScreenLayout footer={footer}>
      {item.image ? (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {/* key = gambar: posisi scroll passage tetap saat pindah soal dalam passage yang sama */}
          <div
            key={item.image}
            className="max-h-[calc(100dvh-15rem)] min-h-64 overflow-auto rounded-md lg:sticky lg:top-20"
          >
            <ZoomableImage
              src={item.image}
              alt={`Reading passage for question ${item.number}`}
              onZoom={onZoom}
            />
          </div>
          <div className="lg:sticky lg:top-20">{card}</div>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl">{card}</div>
      )}
    </ScreenLayout>
  );
}
