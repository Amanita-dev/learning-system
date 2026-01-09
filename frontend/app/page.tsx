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
    <div className="min-h-screen w-full bg-gradient-to-br from-red-900 via-orange-800 to-red-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto animate-slideIn">
        <div className="text-center mb-12 mt-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-red-300 to-orange-200 bg-clip-text text-transparent animate-pulse">
            🎓 Обучение с AI
          </h1>
          <p className="text-xl text-white text-opacity-90">
            Введи тему — система создаст персональный курс специально для тебя 🚀
          </p>
        </div>

        <StartCourseForm onSubmit={handleStartCourse} isLoading={isLoading} />

        {error && <AlertMessage type="error" message={error} />}

        {/* ✅ Сетка курсов */}
        <CoursesGrid courses={courses} />
      </div>
    </div>
  );
}