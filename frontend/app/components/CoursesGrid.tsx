// src/app/components/CoursesGrid.tsx
"use client";

import Link from "next/link";
import { Course } from "../lib/learning-api";  // ✅ Импортируем из learning-api

interface CoursesGridProps {
  courses: Course[];
}

export default function CoursesGrid({ courses }: CoursesGridProps) {
  if (!courses.length) {
    return (
      <div className="material-surface rounded-[28px] p-8 text-center">
        <p className="text-lg font-medium text-[color:var(--foreground)]">Ещё нет созданных курсов</p>
        <p className="mt-2 text-[color:var(--secondary)]">Создай первый курс, введя тему выше</p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Мои курсы</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Link href={`/course/${course.id}`} key={course.id}>
            <div className="material-surface h-full rounded-[24px] p-6 transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)]">
              <h3 className="text-xl font-semibold text-[color:var(--foreground)]">{course.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-[color:var(--secondary)]">
                {course.description || "Без описания"}
              </p>
              <div className="mt-5 flex items-center justify-between text-sm text-[color:var(--secondary)]">
                <span>🎓 {course.difficulty}</span>
                <span>📝 {course.modules_count} мод.</span>
              </div>
              <div className="mt-3 text-xs text-[color:var(--secondary)]">
                {new Date(course.created_at).toLocaleDateString("ru-RU")}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
