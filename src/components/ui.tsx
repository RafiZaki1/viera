"use client";

import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const VARIANTS = {
  primary: "border-transparent bg-brand text-white hover:bg-brand-dark",
  secondary: "border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
  warning: "border-transparent bg-amber-400 text-slate-900 hover:bg-amber-300",
  success: "border-transparent bg-emerald-600 text-white hover:bg-emerald-700",
  danger: "border-transparent bg-rose-600 text-white hover:bg-rose-700",
  ghost: "border-transparent bg-transparent text-slate-600 shadow-none hover:bg-slate-100",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTS;
};

export function Button({ variant = "secondary", className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold shadow-sm transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-exam-active",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}

type ModalProps = {
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  /** Kelas ukuran; menggantikan ukuran bawaan. */
  sizeClass?: string;
  children: ReactNode;
};

/** Dialog native (<dialog>) — Esc & klik di luar kotak menutup dialog. */
export function Modal({
  open,
  onClose,
  labelledBy,
  sizeClass = "w-[calc(100%-2rem)] max-w-lg",
  children,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "m-auto rounded-xl bg-white p-0 text-slate-900 shadow-2xl",
        "backdrop:bg-slate-900/60 backdrop:backdrop-blur-[2px]",
        sizeClass,
      )}
    >
      {open && children}
    </dialog>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-5 animate-spin rounded-full border-2 border-current border-r-transparent",
        className,
      )}
    />
  );
}

export function LoadingScreen({ label = "Memuat…" }: { label?: string }) {
  return (
    <div className="flex flex-1 items-center justify-center gap-3 py-24 text-slate-600">
      <Spinner />
      <span>{label}</span>
    </div>
  );
}
