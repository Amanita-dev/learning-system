// app/course/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  getCourse,
  getCourseModules,
  getProgress,
  completeModule,
  type Course,
  type Module,
  type Progress,
} from "../../lib/learning-api";

const readSelectedModuleId = (value: string | null) => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

import CourseHeader from "../../components/CourseHeader";
import ModulesList from "../../components/ModulesList";
import ModuleContent from "../../components/ModuleContent";
import QuizModal from "../../components/QuizModal";
import AlertMessage from "../../components/AlertMessage";


export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id;


  // ✅ Добавим проверку, чтобы не было NaN
  if (typeof id === "string" && isNaN(Number(id))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-900 text-white">
        ❌ Неверный ID курса: {id}
      </div>
    );
  }

  const courseId = Number(id);
  const [course, setCourse] = useState<Course | null>(null);  // ✅
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);

  const loadCourseData = async () => {
    setIsLoading(true);
    
    // ✅ Загружаем курс, модули и прогресс
    const courseResult = await getCourse(courseId);
    const modulesResult = await getCourseModules(courseId);
    const progressResult = await getProgress(courseId);

    if (courseResult.success) {
      setCourse(courseResult.course);
    }
    if (modulesResult.success) {
      setModules(modulesResult.modules);
    }
    if (progressResult.success) {
      setProgress(progressResult.progress);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  useEffect(() => {
    const selectedModuleId = readSelectedModuleId(searchParams.get("module"));
    if (!selectedModuleId || !modules.length) return;

    const module = modules.find((item) => item.id === selectedModuleId);
    if (module) {
      setSelectedModule(module);
    }
  }, [searchParams, modules]);


  const handleModuleCompleted = async () => {
    if (selectedModule?.quiz?.questions?.length) {
      setShowQuiz(true);
      return;
    }
    await finalizeModuleCompletion();
  };

  const finalizeModuleCompletion = async () => {
    const result = await completeModule(selectedModule!.id);
    if (result.success) {
      await loadCourseData();
      setSelectedModule(null);
      setShowQuiz(false);
      router.push(`/course/${courseId}/modules`);
    } else {
      setError(result.message);
    }
  };


  const handleQuizComplete = async () => {
    await finalizeModuleCompletion();
  };

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-10 ">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/">
            <button className="inline-flex items-center gap-2 rounded-full bg-[color:var(--surface)] px-5 py-3 text-sm font-medium text-[color:var(--primary)] shadow-[0_4px_14px_rgba(0,0,0,0.08)] transition hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)]">
              ← Назад к созданию курса
            </button>
          </Link>

          <Link href={`/course/${courseId}/modules`}>
            <button className="inline-flex items-center gap-2 rounded-full bg-[color:var(--primary)] px-5 py-3 text-sm font-medium text-white shadow-[0_6px_18px_rgba(103,80,164,0.28)] transition hover:shadow-[0_10px_24px_rgba(103,80,164,0.34)]">
              Выбрать модуль
            </button>
          </Link>
        </div>


        <CourseHeader course={course} progress={progress} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <ModulesList
            modules={modules}
            selectedModule={selectedModule}
            onSelectModule={setSelectedModule}
            isLoading={isLoading}
          />

          <ModuleContent
            selectedModule={selectedModule}
            courseId={courseId}
            isLoading={isLoading}
            onModuleCompleted={handleModuleCompleted}
          />
        </div>

        {error && <AlertMessage type="error" message={error} />}

        {showQuiz && selectedModule && (
          <QuizModal
            questions={selectedModule.quiz!.questions}
            onQuizComplete={handleQuizComplete}
            onClose={() => setShowQuiz(false)}
          />
        )}
      </div>
    </main>
  );
}
