import json
from .base import BaseAgent

class QuizGeneratorAgent(BaseAgent):
    def generate_quiz(self, module_title: str, key_topics: list) -> dict:
        print(f"❓ [Quiz] Генерирую тест для: {module_title}")
        # truncated_content = (content[:3000] + "...") if len(content) > 3000 else content
        # 1. Формируем строку тем
        topics_str = ", ".join(key_topics) if key_topics else "основы"

        # 2. ЖЕЛЕЗНЫЙ ПРОМТ
        # Мы даем модели пример диалога, где она УЖЕ ответила правильно.
        prompt = f"""
Ты — JSON API, возвращающий данные для викторин. 
Твоя задача: преобразовать тему и теги в массив вопросов на РУССКОМ языке.

ПРАВИЛА:
1. Формат строго JSON.
2. Никакого маркдауна (```), никаких приветствий.
3. Ровно 3 вопроса.
4. "correct_index" — это число от 0 до 3.

ПРИМЕР ВЗАИМОДЕЙСТВИЯ:

Ввод:
Тема: "Фотосинтез"
Темы: "хлорофилл, свет, вода"

Вывод:
{{
  "questions": [
    {{
      "question": "Какой пигмент отвечает за зеленый цвет растений?",
      "options": ["Каротин", "Хлорофилл", "Ксантофилл", "Антоциан"],
      "correct_index": 1
    }},
    {{
      "question": "Что необходимо для световой фазы фотосинтеза?",
      "options": ["Только вода", "Сахар", "Солнечный свет", "Кислород"],
      "correct_index": 2
    }},
    {{
      "question": "Что является побочным продуктом фотосинтеза?",
      "options": ["Кислород", "Углекислый газ", "Глюкоза", "Азот"],
      "correct_index": 0
    }}
  ]
}}

ТЕКУЩАЯ ЗАДАЧА:
Ввод:
Тема: "{module_title}"
Темы: "{topics_str}"


Вывод:
"""
        
        # Ожидаемый формат (для fallback)
        expected_format = {
            "questions": [
                {
                    "question": "Вопрос не сгенерирован",
                    "options": ["Да", "Нет", "Возможно", "Ошибка"],
                    "correct_index": 0
                }
            ]
        }

        # 3. Вызов с валидацией
        # Важно: используй _validate_and_retry из прошлого совета, 
        # он умеет вырезать JSON из мусора.
        data = self._validate_and_retry(prompt, expected_format)

        # 4. Валидация типов (твоя старая логика, она хорошая)
        questions = data.get("questions", [])
        valid_questions = []
        
        for q in questions[:3]:
            try:
                if (
                    isinstance(q.get("question"), str)
                    and isinstance(q.get("options"), list)
                    and len(q["options"]) >= 2  # Хотя бы 2 ответа
                    and isinstance(q.get("correct_index"), int)
                ):
                    # Обрезаем лишние опции или дополняем, если надо
                    opts = [str(opt) for opt in q["options"]][:4]
                    
                    # Защита индекса
                    idx = q["correct_index"]
                    if idx >= len(opts): idx = 0
                    
                    valid_questions.append({
                        "question": str(q["question"]),
                        "options": opts,
                        "correct_index": int(idx)
                    })
            except Exception:
                continue

        # Если пусто — возвращаем заглушку, чтобы фронт не упал
        if not valid_questions:
            return expected_format

        return {"questions": valid_questions}
