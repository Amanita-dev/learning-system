// src/components/QuizModal.tsx
"use client";

import { useState } from "react";
import { QuizQuestion } from "../lib/learning-api";

interface QuizModalProps {
  questions: QuizQuestion[];
  onQuizComplete: () => void;
  onClose: () => void;
}

export default function QuizModal({
  questions,
  onQuizComplete,
  onClose,
}: QuizModalProps) {
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    // Опционально: показать результаты
    setTimeout(() => {
      onQuizComplete();
    }, 2000);
  };

  const allAnswered = answers.every(a => a !== -1);

  if (!questions.length) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="material-surface max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Проверь свои знания</h2>
          <button onClick={onClose} className="text-2xl text-[color:var(--secondary)]">
            ✕
          </button>
        </div>

        {questions.map((q, idx) => (
          <div key={idx} className="mb-5 rounded-2xl bg-[color:var(--surface-variant)] p-4">
            <p className="mb-3 font-medium text-[color:var(--foreground)]">
              {idx + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, optIdx) => (
                <button
                  key={optIdx}
                  onClick={() => handleSelect(idx, optIdx)}
                  disabled={submitted}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    answers[idx] === optIdx
                      ? q.correct_index === optIdx
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : "border-red-200 bg-red-50 text-[color:var(--error)]"
                      : submitted && q.correct_index === optIdx
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                      : "border-[color:var(--outline)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:bg-[color:var(--surface-variant)]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--primary)] px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Проверить ответы
          </button>
        ) : (
          <div className="py-4 text-center">
            <p className="text-xl font-semibold text-emerald-700">✅ Тест пройден!</p>
            <p className="mt-2 text-[color:var(--secondary)]">Переход к следующему модулю...</p>
          </div>
        )}
      </div>
    </div>
  );
}
