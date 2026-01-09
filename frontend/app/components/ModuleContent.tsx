"use client";

import { useState, useEffect } from "react";
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
  onModuleCompleted
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
        <div className="rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-96 bg-gradient-to-br from-red-900/30 to-orange-700/30 backdrop-blur-lg border border-red-500/30 animate-slideIn shadow-[0_0_25px_rgba(239,68,68,0.2)]">
          <div className="text-6xl mb-6 animate-bounce">👈</div>
          <p className="text-2xl font-semibold text-white">
            Выбери модуль из списка слева
          </p>
          <p className="text-white text-opacity-70 mt-4">
            И начни изучать новый материал!
          </p>
        </div>
      </div>
    );
  }

  if (isLoading && !content) {
    return (
      <div className="lg:col-span-3">
        <div className="rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-96 bg-gradient-to-br from-red-900/30 to-orange-700/30 backdrop-blur-lg border border-red-500/30 animate-slideIn shadow-[0_0_25px_rgba(239,68,68,0.2)]">
          <div className="text-6xl mb-6 animate-pulse">📝</div>
          <p className="text-xl font-semibold text-white">
            AI генерирует материал...
          </p>
          <div className="mt-6 flex gap-2 justify-center">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.7)]"></div>
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.7)]" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.7)]" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-3 animate-slideIn">
      <div className="rounded-3xl p-8 md:p-12 bg-gradient-to-br from-red-900/30 to-orange-700/30 backdrop-blur-lg border border-red-500/30 shadow-[0_0_25px_rgba(239,68,68,0.2)]">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          {selectedModule.title}
        </h2>
        <p className="text-white text-opacity-80 text-lg mb-8">
          {selectedModule.description}
        </p>

        {error && (
          <div className="rounded-2xl p-4 mb-6 bg-red-500 bg-opacity-20 backdrop-blur-lg border border-red-400/30 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            ❌ {error}
          </div>
        )}

        {!error && content && (
          <>
            <div className="rounded-2xl p-8 mb-8 max-h-[50vh] overflow-y-auto bg-black/20 backdrop-blur-lg border border-red-500/20 shadow-[inset_0_0_15px_rgba(239,68,68,0.1)]">
              <div className="text-white text-opacity-90 whitespace-pre-wrap leading-relaxed text-base md:text-lg">
                {content}
              </div>
            </div>

            <button
              onClick={handleComplete}
              disabled={isLoading || parentLoading}
              className="w-full text-lg py-4 font-bold rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white hover:from-red-700 hover:to-orange-600 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_4px_15px_rgba(239,68,68,0.4)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.5)]"
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