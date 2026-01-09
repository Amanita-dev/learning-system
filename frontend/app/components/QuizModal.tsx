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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-red-900/30 to-orange-700/30 backdrop-blur-lg border border-red-500/30 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">🧠 Проверь свои знания</h2>
          <button
            onClick={onClose}
            className="text-white text-opacity-70 hover:text-opacity-100 text-2xl"
          >
            ✕
          </button>
        </div>

        {questions.map((q, idx) => (
          <div key={idx} className="mb-6 p-4 bg-black/20 rounded-xl">
            <p className="text-white font-semibold mb-3">{idx + 1}. {q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, optIdx) => (
                <button
                  key={optIdx}
                  onClick={() => handleSelect(idx, optIdx)}
                  disabled={submitted}
                  className={`
                    w-full text-left p-3 rounded-lg transition-all
                    ${
                      answers[idx] === optIdx
                        ? q.correct_index === optIdx
                          ? "bg-green-500/30 border border-green-400"
                          : "bg-red-500/30 border border-red-400"
                        : submitted && q.correct_index === optIdx
                        ? "bg-green-500/30 border border-green-400"
                        : "bg-white/10 hover:bg-white/20"
                    }
                    text-white
                  `}
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
            className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Проверить ответы
          </button>
        ) : (
          <div className="text-center py-4">
            <p className="text-green-300 text-xl font-bold">✅ Тест пройден!</p>
            <p className="text-white mt-2">Переход к следующему модулю...</p>
          </div>
        )}
      </div>
    </div>
  );
}