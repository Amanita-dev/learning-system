import json
from .base import BaseAgent


class CoursePlannerAgent(BaseAgent):
    def plan_course(self, topic: str, difficulty: str, num_modules: int = 5) -> dict:
        print(f"🎯 [Planner] Планирую курс: {topic}")
        
        # Формируем строку сложности для примера
        difficulty_ru = {
            "beginner": "новичок",
            "intermediate": "средний",
            "advanced": "продвинутый",
            "easy": "легкий",
            "hard": "сложный"
        }.get(difficulty.lower(), difficulty)

        # ЖЕЛЕЗНЫЙ ПРОМТ С ПРИМЕРАМИ
        prompt = f"""Ты — JSON API для планирования курсов. Твоя задача: вернуть структуру курса.

ПРАВИЛА:
1. Ответ ТОЛЬКО JSON, без маркдауна, без текста.
2. Ровно {num_modules} модулей в массиве.
3. "order" — числа от 1 до {num_modules}.
4. На русском языке.
5. Никаких приветствий, объяснений, маркдауна (```).

ПРИМЕРЫ РАБОТЫ:

ПРИМЕР 1:
Входные данные: Тема: "Python", Сложность: "новичок", Модулей: 2

Вывод:
{{
  "course_title": "Python для начинающих",
  "course_description": "Основные концепции программирования на Python. Синтаксис, переменные, функции, циклы и условия.",
  "modules": [
    {{
      "order": 1,
      "title": "Основы синтаксиса",
      "key_topics": ["переменные", "типы данных", "операторы", "вывод текста"]
    }},
    {{
      "order": 2,
      "title": "Управление потоком выполнения",
      "key_topics": ["условные операторы", "циклы", "функции", "область видимости"]
    }}
  ]
}}

ПРИМЕР 2:
Входные данные: Тема: "Машинное обучение", Сложность: "средний", Модулей: 3

Вывод:
{{
  "course_title": "Машинное обучение: средний уровень",
  "course_description": "Практический курс машинного обучения с использованием Python. Классификация, регрессия, кластеризация.",
  "modules": [
    {{
      "order": 1,
      "title": "Основы ML и подготовка данных",
      "key_topics": ["feature engineering", "нормализация", "разделение данных", "метрики"]
    }},
    {{
      "order": 2,
      "title": "Алгоритмы классификации",
      "key_topics": ["логистическая регрессия", "деревья решений", "SVM", "ансамбли"]
    }},
    {{
      "order": 3,
      "title": "Оценка и оптимизация моделей",
      "key_topics": ["кросс-валидация", "подбор гиперпараметров", "GridSearchCV", "переобучение"]
    }}
  ]
}}

ТЕКУЩАЯ ЗАДАЧА (выполни ровно по формату примеров выше):
Входные данные: Тема: "{topic}", Сложность: "{difficulty_ru}", Модулей: {num_modules}

Вывод:
"""

        # Ожидаемый формат для fallback
        expected_format = {
            "course_title": f"Курс по {topic}",
            "course_description": f"Курс по теме {topic} уровня {difficulty}",
            "modules": [
                {
                    "order": i,
                    "title": f"Модуль {i}",
                    "key_topics": ["тема1", "тема2"]
                }
                for i in range(1, num_modules + 1)
            ]
        }

        # Вызов с валидацией
        data = self._validate_and_retry(prompt, expected_format)

        # ВАЛИДАЦИЯ И ПРЕОБРАЗОВАНИЕ
        course_title = self._safe_string(data.get("course_title"), f"Курс по {topic}")
        course_description = self._safe_string(data.get("course_description"), f"Структурированное обучение теме {topic}")
        
        modules = []
        raw_modules = data.get("modules", [])
        
        if isinstance(raw_modules, list):
            for idx, m in enumerate(raw_modules[:num_modules], 1):
                try:
                    if isinstance(m, dict):
                        # Безопасное извлечение полей
                        order = int(m.get("order", idx))
                        title = self._safe_string(m.get("title"), f"Модуль {idx}")
                        key_topics = self._safe_list(m.get("key_topics", []))
                        
                        # Если темы пусты, добавляем заглушку
                        if not key_topics:
                            key_topics = [f"Тема {idx}"]
                        
                        modules.append({
                            "order": order,
                            "title": title,
                            "key_topics": key_topics
                        })
                except (ValueError, TypeError, KeyError) as e:
                    print(f"⚠️ Ошибка обработки модуля {idx}: {e}")
                    # Создаём fallback модуль
                    modules.append({
                        "order": idx,
                        "title": f"Модуль {idx}",
                        "key_topics": [f"Тема {idx}"]
                    })
        
        # Если модули не сгенерировались, используем fallback
        if not modules:
            print("⚠️ Модули не сгенерированы, используется default структура")
            modules = expected_format["modules"]
        
        result = {
            "course_title": course_title,
            "course_description": course_description,
            "modules": modules
        }
        
        print(f"✅ Курс сгенерирован: {len(modules)} модулей")
        return result

    @staticmethod
    def _safe_string(value, default: str = "") -> str:
        """Безопасное преобразование в строку"""
        try:
            if value is None:
                return default
            s = str(value).strip()
            return s if s else default
        except Exception:
            return default

    @staticmethod
    def _safe_list(value, default: list = None) -> list:
        """Безопасное преобразование в список строк"""
        if default is None:
            default = []
        
        try:
            if isinstance(value, list):
                # Фильтруем пустые значения и преобразуем в строки
                result = []
                for item in value:
                    s = str(item).strip()
                    if s:
                        result.append(s)
                return result if result else default
            elif isinstance(value, str):
                # Если случайно пришла строка, обрачиваем её в список
                s = value.strip()
                return [s] if s else default
            else:
                return default
        except Exception:
            return default
