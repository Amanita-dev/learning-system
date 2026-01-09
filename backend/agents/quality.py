import json
from .base import BaseAgent

class QualityAssessorAgent(BaseAgent):
    def assess_content(self, content: str, module_title: str) -> dict:
        print(f"🔍 [Quality] Оцениваю модуль: {module_title}")
        prompt = f"""
Ты — генератор оценок качества. Оцени следующий учебный контент для модуля "{module_title}".

Контент:
{content[:2000]}

ТЫ МОЖЕШЬ ВЕРНУТЬ ТОЛЬКО валидный JSON, без пояснений, без текста, без заголовков.
ТЫ НЕ МОЖЕШЬ писать "Вот оценка", "Качество:", "Анализ:", "Далее:", "Заключение:" — ТОЛЬКО JSON.

ТЫ НЕ МОЖЕШЬ использовать markdown, заголовки, пояснения, текст до или после JSON.
ТЫ ДОЛЖЕН писать на РУССКОМ языке.
ТЫ НЕ МОЖЕШЬ использовать кавычки в значениях, кроме JSON-кавычек ("").
ТЫ НЕ МОЖЕШЬ использовать переносы строк в строках JSON.
ТЫ НЕ МОЖЕШЬ использовать escape-последовательности, кроме стандартных JSON.

Формат:
{{
  "overall_score": 8.5,
  "completeness": 9,
  "clarity": 8,
  "examples": 7,
  "structure": 9,
  "recommendation": "Можно использовать без доработок."
}}

ТЫ НЕ МОЖЕШЬ возвращать ничего кроме JSON. ТОЛЬКО JSON.
"""
        # Ожидаемый формат
        expected_format = {
            "overall_score": 0.0,
            "completeness": 0,
            "clarity": 0,
            "examples": 0,
            "structure": 0,
            "recommendation": ""
        }

        data = self._validate_and_retry(prompt, expected_format)

        return {
            "overall_score": float(data.get("overall_score", 0)),
            "completeness": int(data.get("completeness", 0)),
            "clarity": int(data.get("clarity", 0)),
            "examples": int(data.get("examples", 0)),
            "structure": int(data.get("structure", 0)),
            "recommendation": str(data.get("recommendation", "Без рекомендаций")),
        }