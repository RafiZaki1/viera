"use server";

import { gradeAnswers } from "@/lib/exam";
import type { ExamResult } from "@/lib/types";

export async function submitExam(answers: unknown): Promise<ExamResult> {
  return gradeAnswers(answers);
}
