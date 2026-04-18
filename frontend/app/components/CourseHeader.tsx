// app/components/CourseHeader.tsx
import { Course, Progress } from "../lib/learning-api";

interface CourseHeaderProps {
  course: Course | null;  // ✅
  progress: Progress | null;
}

export default function CourseHeader({ course, progress }: CourseHeaderProps) {
  return (
    <section className="material-surface animate-fadeIn rounded-[28px] p-6 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-[color:var(--foreground)] md:text-4xl">
        {course?.title || "Загрузка..."}
      </h1>

      {progress && (
        <div className="mt-6 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[color:var(--secondary)]">
              Прогресс: {progress.completed_modules_count} / {progress.total_modules_count}
            </span>
            <span className="text-lg font-semibold text-[color:var(--primary)]">
              {progress.progress_percent}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-[color:var(--surface-variant)]">
            <div 
              className="h-full rounded-full bg-[color:var(--primary)] transition-all duration-700"
              style={{ width: `${progress.progress_percent}%` }}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[color:var(--surface-variant)] p-4 text-center">
              <div className="text-2xl font-semibold text-[color:var(--foreground)]">
                {progress.completed_modules_count}
              </div>
              <div className="text-sm text-[color:var(--secondary)]">Завершено</div>
            </div>
            <div className="rounded-2xl bg-[color:var(--surface-variant)] p-4 text-center">
              <div className="text-2xl font-semibold text-[color:var(--foreground)]">
                {progress.total_modules_count - progress.completed_modules_count}
              </div>
              <div className="text-sm text-[color:var(--secondary)]">Осталось</div>
            </div>
            <div className="rounded-2xl bg-[color:var(--surface-variant)] p-4 text-center">
              <div className="text-2xl font-semibold text-[color:var(--foreground)]">
                {progress.progress_percent}%
              </div>
              <div className="text-sm text-[color:var(--secondary)]">Всего</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
