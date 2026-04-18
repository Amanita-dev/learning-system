"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getCourse, getCourseModules, type Course, type Module } from "../../../lib/learning-api";

export default function CourseModulesPage() {
  const params = useParams();
  const id = params.id;
  const courseId = Number(id);

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (Number.isNaN(courseId)) return;

    const load = async () => {
      setIsLoading(true);
      const courseResult = await getCourse(courseId);
      const modulesResult = await getCourseModules(courseId);

      if (courseResult.success) setCourse(courseResult.course);
      if (modulesResult.success) setModules(modulesResult.modules);
      setIsLoading(false);
    };

    load();
  }, [courseId]);

  if (Number.isNaN(courseId)) {
    return <div className="min-h-screen flex items-center justify-center">Неверный ID курса</div>;
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Link href={`/course/${courseId}`}>
            <button className="inline-flex items-center gap-2 rounded-full bg-[color:var(--surface)] px-5 py-3 text-sm font-medium text-[color:var(--primary)] shadow-[0_4px_14px_rgba(0,0,0,0.08)] transition hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)]">
              ← Вернуться к курсу
            </button>
          </Link>
        </div>

        <section className="material-surface rounded-[28px] p-6 md:p-8">
          <h1 className="text-3xl font-bold text-[color:var(--foreground)]">
            Выбор модуля
          </h1>
          <p className="mt-2 text-[color:var(--secondary)]">
            {course?.title || "Загрузка курса..."}
          </p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="material-surface rounded-[24px] p-6">
                  <div className="h-5 w-3/4 rounded bg-[color:var(--surface-variant)]" />
                  <div className="mt-3 h-4 w-full rounded bg-[color:var(--surface-variant)]" />
                  <div className="mt-2 h-4 w-2/3 rounded bg-[color:var(--surface-variant)]" />
                </div>
              ))
            : modules.map((module, index) => (
                <Link key={module.id} href={`/course/${courseId}?module=${module.id}`}>
                  <div className={`material-surface h-full rounded-[24px] p-6 transition hover:-translate-y-0.5 ${module.is_locked ? "opacity-70" : ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm text-[color:var(--secondary)]">Модуль {index + 1}</div>
                        <h3 className="mt-1 text-xl font-semibold text-[color:var(--foreground)]">{module.title}</h3>
                      </div>
                      <div className="text-2xl">{module.is_completed ? "✅" : module.is_locked ? "🔒" : "📘"}</div>
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm text-[color:var(--secondary)]">
                      {module.description}
                    </p>
                    <div className="mt-5 text-sm font-medium text-[color:var(--primary)]">
                      {module.is_locked ? "Сначала завершите предыдущий модуль" : "Открыть модуль"}
                    </div>
                  </div>
                </Link>
              ))}
        </section>
      </div>
    </main>
  );
}
