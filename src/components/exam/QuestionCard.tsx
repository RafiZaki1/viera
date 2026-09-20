"use client";

import { parseOption } from "@/lib/config";
import type { Letter, QuestionItem } from "@/lib/types";
import { cn } from "../ui";

type Props = {
  item: QuestionItem;
  value?: Letter;
  onChange?: (letter: Letter) => void;
  /** "active"/"muted" dipakai pada tampilan 3 soal (renderCustomThreeLayout). */
  state?: "default" | "active" | "muted";
};

export function QuestionCard({ item, value, onChange, state = "default" }: Props) {
  const muted = state === "muted";
  const disabled = muted || !onChange;

  return (
    <section
      aria-label={`Question ${item.number}`}
      className={cn(
        "font-exam overflow-hidden rounded-md bg-white shadow-sm transition-opacity",
        state === "active" ? "border-2 border-exam-active" : "border border-exam-line",
        muted && "opacity-50",
      )}
    >
      <p className="border-b border-exam-line bg-exam-head px-4 py-2.5 text-[15px] font-bold">
        Choose the correct answer.
      </p>
      <fieldset disabled={disabled} className="px-4 pt-3 pb-4">
        <legend className="float-left mb-3 w-full text-[15px] leading-relaxed">
          {item.question}
        </legend>
        <div className="clear-left space-y-1.5">
          {item.options.map((option) => {
            const { letter, text } = parseOption(option);
            const checked = value === letter;
            return (
              <label
                key={option}
                className={cn(
                  "flex items-start gap-3 rounded-md border px-3 py-2 text-[15px] leading-snug",
                  checked ? "border-exam-active bg-sky-50" : "border-transparent",
                  !disabled && "cursor-pointer hover:bg-slate-50",
                )}
              >
                <input
                  type="radio"
                  name={`answer-${item.id}`}
                  value={letter}
                  checked={checked}
                  onChange={() => onChange?.(letter as Letter)}
                  className="mt-0.5 size-4 shrink-0 accent-exam-active"
                />
                <span className="w-7 shrink-0 font-semibold">({letter})</span>
                {text && <span>{text}</span>}
              </label>
            );
          })}
        </div>
      </fieldset>
    </section>
  );
}
