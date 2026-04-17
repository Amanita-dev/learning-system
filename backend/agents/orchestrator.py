# agents/orchestrator.py
from .planner import CoursePlannerAgent
from .content import ContentGeneratorAgent
from .quality import QualityAssessorAgent
from .quiz import QuizGeneratorAgent

class AgentsOrchestrator:
    def __init__(self):
        self.planner = CoursePlannerAgent()
        self.content_gen = ContentGeneratorAgent()
        self.quality_assessor = QualityAssessorAgent()
        self.quiz_generator = QuizGeneratorAgent()

    def plan_course_only(self, topic: str, difficulty: str, num_modules: int = 5) -> dict:
        """Только планирование курса без генерации контента"""
        print(f"\n🎯 ПЛАНИРОВАНИЕ КУРСА: {topic}\n")
        
        plan = self.planner.plan_course(topic, difficulty, num_modules)
        modules_list = plan.get("modules", [])

        if not modules_list:
            modules_list = [
                {"order": i + 1, "title": f"Модуль {i + 1}", "key_topics": []}
                for i in range(num_modules)
            ]

        # Возвращаем только план (без контента)
        return {
            "title": plan.get("course_title", f"Курс: {topic}"),
            "description": plan.get("course_description", "Сгенерировано локально"),
            "modules": modules_list,
            "total_modules": len(modules_list),
        }

    def generate_module_content_on_demand(
        self, 
        module_title: str, 
        topic: str, 
        difficulty: str, 
        key_topics: list
    ) -> dict:
        """Генерация контента, викторины и оценки для конкретного модуля по требованию"""
        print(f"\n📝 ГЕНЕРАЦИЯ КОНТЕНТА ДЛЯ МОДУЛЯ: {module_title}\n")
        
        # 1. Генерация контента
        content = self.content_gen.generate_module_content(module_title, topic, difficulty, key_topics)
        
        # 2. Генерация викторины
        quiz = self.quiz_generator.generate_quiz(module_title, key_topics)
        
        # 3. Оценка качества
        quality = self.quality_assessor.assess_content(content, module_title)
        
        return {
            "content": content,
            "quiz": quiz,
            "quality": quality,
        }

    def create_full_course(self, topic: str, difficulty: str, num_modules: int = 5) -> dict:
        """Полная генерация курса (для обратной совместимости)"""
        print(f"\n🚀 ЗАПУСК OLLAMA AGENTS: {topic}\n")

        plan = self.planner.plan_course(topic, difficulty, num_modules)
        modules_list = plan.get("modules", [])

        if not modules_list:
            modules_list = [
                {"order": i + 1, "title": f"Модуль {i + 1}", "key_topics": []}
                for i in range(num_modules)
            ]

        final_modules = []
        for mod in modules_list:
            title = mod.get("title", "Без названия")
            key_topics = mod.get("key_topics", [])

            # 1. Генерация контента
            content = self.content_gen.generate_module_content(title, topic, difficulty, key_topics)
            mod["content"] = content

            # 2. Генерация викторины
            quiz = self.quiz_generator.generate_quiz(title, key_topics)
            mod["quiz"] = quiz

            # 3. Оценка качества
            quality = self.quality_assessor.assess_content(content, title)
            mod["quality"] = quality

            final_modules.append(mod)

        return {
            "title": plan.get("course_title", f"Курс: {topic}"),
            "description": plan.get("course_description", "Сгенерировано локально"),
            "modules": final_modules,
            "total_modules": len(final_modules),
        }