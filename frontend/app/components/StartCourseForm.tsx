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
      className="rounded-3xl p-8 md:p-12 space-y-6 bg-gradient-to-br from-red-900/30 to-orange-700/30 backdrop-blur-lg border border-red-500/30 animate-fadeIn shadow-[0_0_25px_rgba(239,68,68,0.2)]"
    >
      <div className="space-y-3">
        <label className="block text-lg font-semibold text-white">
          📚 Что ты хочешь изучить?
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Пример: Python, JavaScript, Машинное обучение..."
          className="w-full text-white text-lg rounded-xl p-4 bg-black/20 backdrop-blur-lg border border-red-500/30 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all"
          disabled={isLoading}
          autoFocus
        />
      </div>

      <div className="space-y-3">
        <label className="block text-lg font-semibold text-white">
          📊 Уровень сложности
        </label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as "beginner" | "intermediate" | "advanced")}
          className="w-full text-white text-lg rounded-xl p-4 bg-black/20 backdrop-blur-lg border border-red-500/30 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all"
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
        className="w-full text-lg py-4 font-bold rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white hover:from-red-700 hover:to-orange-600 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_4px_15px_rgba(239,68,68,0.4)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.5)]"
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