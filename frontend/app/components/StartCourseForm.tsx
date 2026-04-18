// app/components/StartCourseForm.tsx
"use client";

import { useState } from "react";

interface StartCourseFormProps {
  onSubmit: (topic: string, difficulty: "beginner" | "intermediate" | "advanced") => Promise<void>;  // ✅
  isLoading: boolean;
}

export default function StartCourseForm({
  onSubmit,
  isLoading
}: StartCourseFormProps) {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    await onSubmit(topic, difficulty);  // ✅ difficulty — правильный тип
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="material-surface space-y-6 rounded-[28px] p-6 md:p-8"
    >
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[color:var(--secondary)]">
          Что ты хочешь изучить?
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Пример: Python, JavaScript, Машинное обучение..."
          className="w-full rounded-2xl border border-[color:var(--outline)] bg-[color:var(--surface)] px-4 py-3 text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--primary)] focus:ring-4 focus:ring-[color:var(--primary-container)]"
          disabled={isLoading}
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-[color:var(--secondary)]">
          Уровень сложности
        </label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as "beginner" | "intermediate" | "advanced")}
          className="w-full rounded-2xl border border-[color:var(--outline)] bg-[color:var(--surface)] px-4 py-3 text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--primary)] focus:ring-4 focus:ring-[color:var(--primary-container)]"
          disabled={isLoading}
        >
          <option value="beginner">Начинающий</option>
          <option value="intermediate">Средний</option>
          <option value="advanced">Продвинутый</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isLoading || !topic.trim()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--primary)] px-5 py-3 text-base font-medium text-white shadow-[0_6px_18px_rgba(103,80,164,0.28)] transition hover:shadow-[0_10px_24px_rgba(103,80,164,0.34)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <span className="animate-spin">⏳</span>
            <span>Создаю курс...</span>
          </>
        ) : (
          <>
            <span>🚀</span>
            <span>Создать курс</span>
          </>
        )}
      </button>
    </form>
  );
}
