import json
import re
import ollama
from typing import Dict, Any

# === НАСТРОЙКИ ===
OLLAMA_MODEL = "mistral:7b"  # или любая другая модель
MAX_RETRIES = 3  # максимальное количество попыток
# =================

class BaseAgent:
    def __init__(self):
        self.model = OLLAMA_MODEL

    def _call_ollama(self, prompt: str) -> str:
        """Отправляет запрос в локальную Ollama"""
        try:
            print(f"🦙 [Ollama] Думаю над запросом... (Модель: {self.model})")
            response = ollama.chat(model=self.model, messages=[
                {
                    'role': 'user',
                    'content': prompt,
                },
            ])
            return response['message']['content']
        except Exception as e:
            print(f"❌ Ошибка Ollama: {e}")
            return "{}"

    def _clean_json(self, text: str) -> str:
        """
        Извлекает JSON из ответа Ollama, обрабатывая возможные форматы и обрезанные строки.
        """
        text = text.strip()

        # 1. Ищем JSON в блоках ```json ... ``` или ``` ... ```
        match = re.search(r"```(?:json)?\s*({.*?})\s*```", text, re.DOTALL)
        if match:
            return match.group(1)

        # 2. Ищем JSON вида { "key": ... } в тексте (даже если до/после мусор)
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and start < end:
            potential_json = text[start:end + 1]
            try:
                # Проверим, валиден ли он
                json.loads(potential_json)
                return potential_json
            except json.JSONDecodeError:
                # Если не валиден — пробуем восстановить
                # Убираем лишние запятые перед } или ]
                fixed = re.sub(r",(\s*[}\]])", r"\1", potential_json)
                # Убираем всё после последней запятой в объекте
                lines = fixed.splitlines()
                for i in range(len(lines), 0, -1):
                    try:
                        partial = "\n".join(lines[:i]).rstrip(", \t\n\r")
                        if partial.endswith(","):
                            partial = partial.rstrip(",")
                        json.loads(partial)
                        return partial
                    except json.JSONDecodeError:
                        continue

        # 3. Если ничего не нашли — возвращаем пустую строку
        return ""

    def _validate_and_retry(self, prompt: str, expected_format: Dict[str, Any], retries: int = MAX_RETRIES) -> Dict[str, Any]:
        """
        Вызывает Ollama, валидирует результат и повторяет, если формат неверный.
        """
        for attempt in range(retries + 1):
            if attempt > 0:
                print(f"⚠️ Повторная попытка ({attempt}/{retries})...")

            raw_response = self._call_ollama(prompt)
            cleaned = self._clean_json(raw_response)

            if not cleaned:
                print(f"⚠️ Не удалось извлечь JSON (попытка {attempt + 1})")
                continue

            try:
                data = json.loads(cleaned)

                # Проверяем, соответствует ли формат ожидаемому
                if self._is_valid_format(data, expected_format):
                    print(f"✅ Формат валиден (попытка {attempt + 1})")
                    return data
                else:
                    print(f"⚠️ Формат неверный (попытка {attempt + 1})")
                    # Уточняем промпт, чтобы модель исправилась
                    prompt += f"\n\nПРЕДЫДУЩИЙ ОТВЕТ БЫЛ НЕПРАВИЛЬНЫМ ФОРМАТОМ. ТЫ МОЖЕШЬ ВЕРНУТЬ ТОЛЬКО валидный JSON в нужном формате: {expected_format}. НЕЛЬЗЯ использовать текст до/после JSON."

            except json.JSONDecodeError:
                print(f"⚠️ Не удалось распарсить JSON (попытка {attempt + 1})")
                continue

        # Если все попытки неудачны — возвращаем заглушку
        print(f"❌ Все попытки исчерпаны. Возвращаю заглушку.")
        return self._get_fallback_response(expected_format)

    def _is_valid_format(self, data: Dict[str, Any], expected_format: Dict[str, Any]) -> bool:
        """
        Проверяет, соответствует ли data структуре expected_format.
        """
        def check_structure(actual, expected):
            if isinstance(expected, dict):
                if not isinstance(actual, dict):
                    return False
                for key, value in expected.items():
                    if key not in actual:
                        return False
                    if not check_structure(actual[key], value):
                        return False
                return True
            elif isinstance(expected, list):
                if not isinstance(actual, list):
                    return False
                if expected:
                    for item in actual:
                        if not check_structure(item, expected[0]):
                            return False
                return True
            else:
                # Для простых типов (str, int, float...) проверяем тип
                expected_type = type(expected)
                return isinstance(actual, expected_type)

        return check_structure(data, expected_format)

    def _get_fallback_response(self, expected_format: Dict[str, Any]) -> Dict[str, Any]:
        """
        Возвращает заглушку в формате expected_format.
        """
        def build_fallback(value):
            if isinstance(value, dict):
                return {k: build_fallback(v) for k, v in value.items()}
            elif isinstance(value, list):
                if value:
                    return [build_fallback(value[0])]
                else:
                    return []
            elif isinstance(value, str):
                return "Ошибка генерации"
            elif isinstance(value, int):
                return 0
            elif isinstance(value, float):
                return 0.0
            elif isinstance(value, bool):
                return False
            else:
                return None

        return build_fallback(expected_format)