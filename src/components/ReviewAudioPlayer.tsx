"use client";

import { useEffect, useRef, useState } from "react";
import { formatTime } from "@/lib/config";
import { cn } from "./ui";

type ReviewAudioPlayerProps = {
  audioSrc?: string;
  className?: string;
};

export function ReviewAudioPlayer({ audioSrc, className }: ReviewAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setHasError(false);

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handleError = () => {
      setHasError(true);
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [audioSrc]);

  if (!audioSrc || hasError) {
    return (
      <div className={cn("rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500", className)}>
        Berkas rekaman audio tidak tersedia untuk nomor ini.
      </div>
    );
  }

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => setHasError(true));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const target = Number(e.target.value);
    audio.currentTime = target;
    setCurrentTime(target);
  };

  const setSpeed = (rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const rewind = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - seconds);
  };

  return (
    <div className={cn("rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2", className)}>
      <audio ref={audioRef} src={audioSrc} preload="metadata" />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Jeda audio" : "Putar audio"}
            className="inline-flex size-8 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-dark transition-colors cursor-pointer"
          >
            {isPlaying ? (
              <svg className="size-4 fill-current" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="size-4 fill-current ml-0.5" viewBox="0 0 24 24">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={() => rewind(5)}
            className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-100 cursor-pointer"
            title="Mundur 5 detik"
          >
            -5s
          </button>

          <span className="text-xs font-mono text-slate-600">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-500 mr-1">Kecepatan</span>
          {[0.75, 1, 1.25].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => setSpeed(rate)}
              className={cn(
                "rounded px-2 py-0.5 font-medium transition-colors cursor-pointer",
                playbackRate === rate
                  ? "bg-brand text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100",
              )}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={duration || 100}
        value={currentTime}
        onChange={handleSeek}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-brand"
      />
    </div>
  );
}
