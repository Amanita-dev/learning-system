"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
// Импорт темы для подсветки кода (можно заменить на github-dark, atom-one-dark, monokai и т.д.)
import "highlight.js/styles/github-dark.css";
import { Module, getModuleContent, completeModule } from "../lib/learning-api";

interface ModuleContentProps {
  selectedModule: Module | null;
  courseId: number;
  isLoading: boolean;
  onModuleCompleted: () => Promise<void>;
}

export default function ModuleContent({
  selectedModule,
  courseId,
  isLoading: parentLoading,
  onModuleCompleted,
}: ModuleContentProps) {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedModule) return;

    const loadContent = async () => {
      setIsLoading(true);
      setError("");
      setContent("");

      const result = await getModuleContent(selectedModule.id);

      if (result.success) {
        setContent(result.module.content);
      } else {
        setError(result.message);
      }

      setIsLoading(false);
    };

    loadContent();
  }, [selectedModule]);

  const handleComplete = async () => {
    if (!selectedModule) return;

    setIsLoading(true);
    setError("");

    const result = await completeModule(selectedModule.id);

    if (result.success) {
      await onModuleCompleted();
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  if (!selectedModule) {
    return (
      <div className="lg:col-span-3">
        <div className="material-surface flex min-h-96 flex-col items-center justify-center rounded-[28px] p-10 text-center">
          <div className="mb-4 text-5xl">👈</div>
          <p className="text-2xl font-semibold text-[color:var(--foreground)]">
            Выбери модуль из списка слева
          </p>
          <p className="mt-3 text-[color:var(--secondary)]">
            И начни изучать новый материал!
          </p>
        </div>
      </div>
    );
  }

  if (isLoading && !content) {
    return (
      <div className="lg:col-span-3">
        <div className="material-surface flex min-h-96 flex-col items-center justify-center rounded-[28px] p-10 text-center">
          <div className="mb-4 text-5xl animate-pulse">📝</div>
          <p className="text-xl font-semibold text-[color:var(--foreground)]">
            AI генерирует материал...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-3 animate-slideIn">
      <div className="material-surface rounded-[28px] p-6 md:p-8">
        <h2 className="text-3xl font-bold text-[color:var(--foreground)]">
          {selectedModule.title}
        </h2>
        <p className="mt-2 text-lg text-[color:var(--secondary)]">
          {selectedModule.description}
        </p>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-[color:var(--error)]">
            {error}
          </div>
        )}

        {!error && content && (
          <>
            {/* 👇 prose автоматически добавляет отступы, стили для заголовков, списков, цитат, таблиц */}
            {/* 👇 rehypePlugins={[rehypeHighlight]} включает подсветку синтаксиса в блоках кода */}
           <div className="mt-6 max-h-[60vh] overflow-y-auto rounded-2xl bg-[color:var(--surface-variant)] p-6 text-[color:var(--foreground)]">
      <div className="prose prose-lg prose-invert max-w-none
                      prose-headings:font-bold prose-headings:my-4
                      prose-p:my-3 prose-p:leading-relaxed
                      prose-ul:my-3 prose-ol:my-3 prose-li:my-1
                      prose-blockquote:border-l-4 prose-blockquote:border-[color:var(--primary)] prose-blockquote:pl-4 prose-blockquote:italic
                      prose-pre:bg-[color:var(--surface)] prose-pre:rounded-xl prose-pre:p-4 prose-pre:text-sm
                      prose-code:bg-[color:var(--surface)] prose-code:px-1 prose-code:rounded prose-code:text-[color:var(--accent)]
                      prose-a:text-[color:var(--accent)] prose-a:no-underline hover:prose-a:underline
                      prose-strong:font-semibold prose-em:italic">
        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{content}</ReactMarkdown>
      </div>
    </div>

            <button
              onClick={handleComplete}
              disabled={isLoading || parentLoading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--primary)] px-5 py-3 text-base font-medium text-white shadow-[0_6px_18px_rgba(103,80,164,0.28)] transition hover:shadow-[0_10px_24px_rgba(103,80,164,0.34)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Завершаю модуль...</span>
                </>
              ) : (
                <>
                  <span>✅</span>
                  <span>Завершить модуль</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}