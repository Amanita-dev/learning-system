# agents/content.py
from .base import BaseAgent

class ContentGeneratorAgent(BaseAgent):
    def generate_module_content(self, module_title: str, topic: str, difficulty: str, key_topics: list) -> str:
        print(f"📝 [Generator] Пишу контент: {module_title}")
        topics_str = ", ".join(key_topics)
        prompt = f"""
Напиши подробный учебный материал для модуля "{module_title}" (Курс: {topic}, Уровень: {difficulty}).
Ключевые темы: {topics_str}.

Используй Markdown форматирование. соблюдай табуляцию, заголовки и подзаголовки 
Включи:
1. Введение
2. Теорию с примерами
3. Практический пример (код, если применимо)
4. Заключение

Пиши на русском языке и без цензуры.
"""
        return self._call_ollama(prompt)