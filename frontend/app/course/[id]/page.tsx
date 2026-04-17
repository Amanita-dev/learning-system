// app/course/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getCourse,
  getCourseModules,
  getProgress,
  completeModule,
  generateModuleContent,
  type Course,
  type Module,
  type Progress,
} from "../../lib/learning-api";
import CourseHeader from "../../components/CourseHeader";
import ModulesList from "../../components/ModulesList";
import ModuleContent from "../../components/ModuleContent";
import QuizModal from "../../components/QuizModal";
import AlertMessage from "../../components/AlertMessage";

export default function CoursePage() {
  const params = useParams();
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
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
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

  // Обработка выбора модуля - генерируем контент если нужно
  const handleSelectModule = async (module: Module) => {
    // Проверяем, закрыт ли модуль
    if (module.is_locked) {
      setError("Этот модуль закрыт. Пройдите предыдущий модуль.");
      return;
    }

    // Проверяем, есть ли уже контент
    if (!module.content || !module.content.trim()) {
      setIsGeneratingContent(true);
      setError("");
      
      try {
        const result = await generateModuleContent(module.id);
        if (result.success) {
          // Обновляем данные модуля после генерации
          await loadCourseData();
          // Находим обновлённый модуль
          const updatedModule = result.module;
          setSelectedModule({
            ...module,
            content: updatedModule.content,
            quiz: updatedModule.quiz,
            quality: updatedModule.quality,
          });
        } else {
          setError(result.message || "Ошибка генерации контента");
        }
      } catch (err) {
        setError("Произошла ошибка при генерации контента");
      } finally {
        setIsGeneratingContent(false);
      }
    } else {
      setSelectedModule(module);
    }
  };

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
      await loadCourseData(); // ✅ Обновляем данные
      setSelectedModule(null);
      setShowQuiz(false);
    } else {
      setError(result.message);
    }
  };

  const handleQuizComplete = async () => {
    await finalizeModuleCompletion();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-red-900 via-orange-800 to-red-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <button className="text-white bg-black/30 backdrop-blur-lg border border-red-500/30 rounded-xl px-6 py-3 font-bold hover:bg-white/10 transition-all">
              ← Назад к созданию курса
            </button>
          </Link>
        </div>

        <CourseHeader
          course={course}  // ✅ Передаём реальный курс
          progress={progress}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
          <ModulesList
            modules={modules}
            selectedModule={selectedModule}
            onSelectModule={handleSelectModule}
            isLoading={isLoading}
          />

          <ModuleContent
            selectedModule={selectedModule}
            courseId={courseId}
            isLoading={isLoading || isGeneratingContent}
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
    </div>
  );
}