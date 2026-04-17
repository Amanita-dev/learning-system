const API_BASE_URL = "http://localhost:8000/api/learning";

// === 1. Общий интерфейс Course (включает всё, что возвращает бэкенд) ===
export interface Course {
  id: number;
  title: string;
  description: string;
  topic: string;
  difficulty: string;      // ✅
  modules_count: number;
  created_at: string;      // ✅
}

// === 2. Тип для вопроса викторины ===
export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
}

// === 3. Module — с полем quiz и quality ===
export interface Module {
  id: number;
  title: string;
  description: string;
  content: string;
  module_order: number;
  is_locked: boolean;
  is_completed: boolean;
  quiz: {
    questions: QuizQuestion[];
  };
  quality: {
    overall_score: number;
    completeness: number;
    clarity: number;
    examples: number;
    structure: number;
    recommendation: string;
  };
}

// === 4. Progress ===
export interface Progress {
  course_id: number;
  completed_modules_count: number;
  total_modules_count: number;
  progress_percent: number;
}

// === 5. Функции ===

export async function startCourse(
  topic: string,
  difficulty: "beginner" | "intermediate" | "advanced" = "beginner"
) {
  try {
    console.log("🚀 Отправляю запрос на создание курса:", { topic, difficulty });

    const response = await fetch(`${API_BASE_URL}/start-course`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, difficulty })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Ошибка создания курса:", errorText);
      throw new Error(`Ошибка при создании курса: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Ответ от бэкенда:", data);

    // ✅ Проверим, что data.course_id — число
    console.log("✅ data.course_id:", data.course_id, typeof data.course_id);

    // ✅ Убедимся, что course_id — число
    const courseId = Number(data.course_id);
    console.log("✅ courseId после Number():", courseId, typeof courseId);

    if (isNaN(courseId) || courseId <= 0) {
      console.error("❌ course_id не является числом или <= 0:", data.course_id);
      return { success: false, message: "Ошибка: course_id не является числом" };
    }

    return {
      success: true,
      course_id: courseId,  // ✅ Гарантируем, что это число
      message: data.message
    };
  } catch (error) {
    console.error("❌ Ошибка в startCourse:", error);
    return { success: false, message: "Ошибка при создании курса" };
  }
}

export async function getCourse(courseId: number) {
  try {
    console.log("📚 Запрашиваю информацию о курсе:", courseId);

    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Ошибка загрузки курса:", errorText);
      throw new Error(`Ошибка при загрузке курса: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Курс получен:", data);

    return {
      success: true,
      course: data.course  // ✅ Возвращаем курс
    };
  } catch (error) {
    console.error("❌ Ошибка в getCourse:", error);
    return { success: false, message: "Ошибка при загрузке курса" };
  }
}

export async function getCourseModules(courseId: number) {
  try {
    console.log("📚 Запрашиваю модули для курса:", courseId);

    const response = await fetch(
      `${API_BASE_URL}/courses/${courseId}/modules`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Ошибка загрузки модулей:", errorText);
      throw new Error(`Ошибка при загрузке модулей: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Модули получены:", data);

    return data;
  } catch (error) {
    console.error("❌ Ошибка в getCourseModules:", error);
    return { success: false, message: "Ошибка при загрузке модулей" };
  }
}

export async function generateModuleContent(moduleId: number) {
  try {
    console.log("📝 Генерируем контент для модуля:", moduleId);

    const response = await fetch(
      `${API_BASE_URL}/modules/${moduleId}/generate-content`,
      { method: "POST" }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Ошибка генерации контента:", errorText);
      throw new Error(`Ошибка при генерации контента: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Контент сгенерирован:", data);

    return data;
  } catch (error) {
    console.error("❌ Ошибка в generateModuleContent:", error);
    return { success: false, message: "Ошибка при генерации контента" };
  }
}

export async function getModuleContent(moduleId: number) {
  try {
    console.log("📄 Запрашиваю контент модуля:", moduleId);

    const response = await fetch(
      `${API_BASE_URL}/modules/${moduleId}/content`
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Ошибка загрузки контента:", error);
      throw new Error(error.detail || "Ошибка при загрузки контента");
    }

    const data = await response.json();
    console.log("✅ Контент модуля получен:", data);

    return data;
  } catch (error: any) {
    console.error("❌ Ошибка в getModuleContent:", error);
    return {
      success: false,
      message: error.message || "Ошибка при загрузке контента"
    };
  }
}

export async function completeModule(moduleId: number) {
  try {
    console.log("✅ Отмечаю модуль как завершённый:", moduleId);

    const response = await fetch(
      `${API_BASE_URL}/modules/${moduleId}/complete`,
      { method: "POST" }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Ошибка завершения модуля:", errorText);
      throw new Error(`Ошибка при завершении модуля: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Модуль завершён:", data);

    return data;
  } catch (error) {
    console.error("❌ Ошибка в completeModule:", error);
    return { success: false, message: "Ошибка при завершении модуля" };
  }
}

export async function getProgress(courseId: number) {
  try {
    console.log("📊 Запрашиваю прогресс для курса:", courseId);

    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/progress`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Ошибка загрузки прогресса:", errorText);
      throw new Error(`Ошибка при загрузке прогресса: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Прогресс получен:", data);

    return data;
  } catch (error) {
    console.error("❌ Ошибка в getProgress:", error);
    return { success: false, message: "Ошибка при загрузке прогресса" };
  }
}

export async function getAllCourses() {
  try {
    console.log("📚 Запрашиваю все курсы");

    const response = await fetch(`${API_BASE_URL}/courses`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Ошибка загрузки курсов:", errorText);
      throw new Error(`Ошибка при загрузке курсов: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Курсы получены:", data);

    return data;
  } catch (error) {
    console.error("❌ Ошибка в getAllCourses:", error);
    return { success: false, message: "Ошибка при загрузке курсов" };
  }
}