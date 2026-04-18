'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { startCourse, getAllCourses, type Course } from "./lib/learning-api";
import StartCourseForm from "./components/StartCourseForm";
import CoursesGrid from "./components/CoursesGrid";
import AlertMessage from "./components/AlertMessage";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);

  const handleStartCourse = async (topic: string, difficulty: "beginner" | "intermediate" | "advanced") => {  // ✅
    setIsLoading(true);
    setError("");

    console.log("🚀 Отправляю запрос на создание курса:", { topic, difficulty });

    const result = await startCourse(topic, difficulty);

    console.log("✅ Результат создания курса:", result);

    // ✅ Проверяем, что result.course_id — число и > 0
    if (result.success && result.course_id != null && !isNaN(Number(result.course_id)) && Number(result.course_id) > 0) {
      const courseId = Number(result.course_id);
      console.log("✅ courseId перед router.push:", courseId, typeof courseId);
      router.push(`/course/${courseId}`);
    } else {
      console.error("❌ course_id не является числом или <= 0:", result.course_id);
      setError(result.message || "Ошибка: course_id не является числом");
    }

    setIsLoading(false);
  };

  // ✅ Загружаем курсы при открытии главной
  useEffect(() => {
    const loadCourses = async () => {
      const result = await getAllCourses();
      if (result.success) {
        setCourses(result.courses);
      }
    };
    loadCourses();
  }, []);

  return (
    <main className="min-h-screen w-full max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl animate-slideIn space-y-8">
        <section className="material-surface overflow-hidden rounded-[28px] p-6 md:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl space-y-3">
              <span className="inline-flex rounded-full bg-[color:var(--primary-container)] px-4 py-2 text-sm font-medium text-[color:var(--primary)]">
                AI Learning Platform
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-[color:var(--foreground)] md:text-5xl">
                Обучение с AI
              </h1>
              <p className="max-w-2xl text-base text-[color:var(--secondary)] md:text-lg">
                Введи тему — система создаст персональный курс специально для тебя.
              </p>
            </div>
          </div>
        </section>

        <StartCourseForm onSubmit={handleStartCourse} isLoading={isLoading} />

        {error && <AlertMessage type="error" message={error} />}

        <CoursesGrid courses={courses} />
      </div>
    </main>
  );
}
