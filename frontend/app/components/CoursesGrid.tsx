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
      <div className="text-center py-12">
        <p className="text-white text-xl">Ещё нет созданных курсов</p>
        <p className="text-white text-opacity-70 mt-2">Создай первый курс, введя тему выше</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-white mb-6">📚 Мои курсы</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Link href={`/course/${course.id}`} key={course.id}>
            <div className="rounded-2xl p-6 bg-gradient-to-br from-red-900/30 to-orange-700/30 backdrop-blur-lg border border-red-500/30 hover:shadow-[0_0_25px_rgba(239,68,68,0.3)] transition-all cursor-pointer">
              <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
              <p className="text-white text-opacity-80 text-sm mb-3 line-clamp-2">
                {course.description || "Без описания"}
              </p>
              <div className="flex justify-between text-xs text-white text-opacity-70">
                <span>🎓 {course.difficulty}</span>
                <span>📝 {course.modules_count} мод.</span>
              </div>
              <div className="mt-3 text-xs text-white text-opacity-50">
                {new Date(course.created_at).toLocaleDateString("ru-RU")}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}