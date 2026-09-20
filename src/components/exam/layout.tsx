"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { formatTime, imageSize } from "@/lib/config";
import { cn } from "../ui";

export function ScreenLayout({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <>
      <div className="flex-1 px-4 py-6">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </div>
      {footer && (
        <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            {footer}
          </div>
        </div>
      )}
    </>
  );
}

type ZoomableImageProps = {
  src: string;
  alt: string;
  onZoom: (src: string) => void;
  className?: string;
  imageClassName?: string;
};

/** Gambar soal/passage dengan tombol perbesar. */
export function ZoomableImage({ src, alt, onZoom, className, imageClassName }: ZoomableImageProps) {
  return (
    <figure
      className={cn(
        "group relative overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        {...imageSize(src)}
        loading="eager"
        className={cn("h-auto w-full", imageClassName)}
      />
      <button
        type="button"
        onClick={() => onZoom(src)}
        className="absolute top-2 right-2 rounded-md bg-slate-900/70 px-2.5 py-1 text-xs font-semibold text-white opacity-80 transition-opacity hover:opacity-100 focus-visible:opacity-100"
      >
        🔍 Perbesar
      </button>
    </figure>
  );
}

type ToolbarProps = {
  name: string;
  code: string;
  section: string;
  position?: string;
  remaining: number;
};

export function Toolbar({ name, code, section, position, remaining }: ToolbarProps) {
  const low = remaining <= 5 * 60;
  return (
    <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-2 text-sm sm:grid-cols-[1fr_auto_1fr]">
        <div className="min-w-0">
          <p className="truncate font-semibold">{name}</p>
          <p className="text-xs text-slate-500">No. Peserta: {code}</p>
        </div>
        <div className="order-last col-span-2 text-center sm:order-none sm:col-span-1">
          <p className="font-semibold text-brand">{section}</p>
          {position && <p className="text-xs text-slate-500">{position}</p>}
        </div>
        <div className="justify-self-end">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-base font-bold tabular-nums",
              low ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-800",
            )}
            title="Sisa waktu"
          >
            <span aria-hidden>⏱</span>
            <span className="sr-only">Sisa waktu</span>
            {formatTime(remaining)}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Bilah progres kecil untuk audio / hitung mundur. */
export function ProgressBar({ value, tone = "brand" }: { value: number; tone?: "brand" | "amber" }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-300 ease-linear",
          tone === "brand" ? "bg-brand" : "bg-amber-500",
        )}
        style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
      />
    </div>
  );
}
