// app/components/CourseHeader.tsx
import { Course, Progress } from "../lib/learning-api";

interface CourseHeaderProps {
  course: Course | null;  // ✅
  progress: Progress | null;
}

export default function CourseHeader({ course, progress }: CourseHeaderProps) {
  return (
    <div className="rounded-3xl p-8 md:p-12 bg-gradient-to-br from-red-900/30 to-orange-700/30 backdrop-blur-lg border border-red-500/30 animate-fadeIn shadow-[0_0_25px_rgba(239,68,68,0.2)]">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 bg-gradient-to-r from-red-200 to-orange-200 bg-clip-text text-transparent">
        🎓 {course?.title || "Загрузка..."}
      </h1>

      {progress && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-white font-semibold text-lg">
              Прогресс: {progress.completed_modules_count} / {progress.total_modules_count}
            </span>
            <span className="text-2xl font-bold text-orange-300">
              {progress.progress_percent}%
            </span>
          </div>

          {/* Прогресс бар */}
          <div className="h-4 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-red-500/20">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
              style={{ width: `${progress.progress_percent}%` }}
            />
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="rounded-xl p-4 text-center bg-black/20 backdrop-blur-lg border border-red-500/20 animate-pulse">
              <div className="text-3xl font-bold text-green-300">
                {progress.completed_modules_count}
              </div>
              <div className="text-sm text-white mt-1">Завершено</div>
            </div>
            <div className="rounded-xl p-4 text-center bg-black/20 backdrop-blur-lg border border-red-500/20 animate-pulse">
              <div className="text-3xl font-bold text-orange-300">
                {progress.total_modules_count - progress.completed_modules_count}
              </div>
              <div className="text-sm text-white mt-1">Осталось</div>
            </div>
            <div className="rounded-xl p-4 text-center bg-black/20 backdrop-blur-lg border border-red-500/20 animate-pulse">
              <div className="text-3xl font-bold text-yellow-300">
                {progress.progress_percent}%
              </div>
              <div className="text-sm text-white mt-1">Всего</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}