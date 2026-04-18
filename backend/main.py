import os
import json
from datetime import datetime
from typing import Generator

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# ====== ENV ======
from dotenv import load_dotenv
load_dotenv()

# ====== DB ======
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./learning.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ====== MODELS ======
class Course(Base):
    __tablename__ = "courses"
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, default="", nullable=False)
    topic = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    modules_count = Column(Integer, default=5, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class Module(Base):
    __tablename__ = "modules"
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, default="", nullable=False)
    content = Column(Text, default="", nullable=False)
    module_order = Column(Integer, nullable=False)
    is_locked = Column(Boolean, default=True, nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    quiz_data = Column(Text, default="{}", nullable=False)  # ✅ Новое поле
    quality_data = Column(Text, default="{}", nullable=False)  # ✅ Новое поле
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class Progress(Base):
    __tablename__ = "progress"
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    completed_modules_count = Column(Integer, default=0, nullable=False)
    total_modules_count = Column(Integer, default=5, nullable=False)
    progress_percent = Column(Integer, default=0, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

# ====== SCHEMAS ======
class StartCourseRequest(BaseModel):
    topic: str = Field(..., min_length=2)
    difficulty: str = Field("beginner")
    num_modules: int = Field(5, ge=1, le=12)

# ====== DEPENDENCY ======
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ====== APP ======
app = FastAPI(title="Learning System API (Local Ollama)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ====== IMPORT AGENTS ======
try:
    from agents import AgentsOrchestrator
    print("✅ AgentsOrchestrator успешно импортирован")
except ImportError as e:
    AgentsOrchestrator = None
    print(f"❌ Ошибка импорта AgentsOrchestrator: {e}")

# ====== HELPERS ======
def normalize_description_from_module(module_data: dict) -> str:
    key_topics = module_data.get("key_topics") or []
    if isinstance(key_topics, list):
        return "; ".join(str(x) for x in key_topics)[:200]
    return str(key_topics)[:200]

def recompute_progress(db: Session, course_id: int) -> None:
    progress = db.query(Progress).filter(Progress.course_id == course_id).first()
    if not progress:
        return

    completed = (
        db.query(Module)
        .filter(Module.course_id == course_id, Module.is_completed == True)
        .count()
    )

    progress.completed_modules_count = completed
    progress.progress_percent = int((completed / progress.total_modules_count) * 100) if progress.total_modules_count else 0
    progress.updated_at = datetime.utcnow()
    db.commit()

# ====== ENDPOINTS ======

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Learning API is running (Ollama Version)"}

@app.get("/api/agents/status")
async def agents_status():
    if AgentsOrchestrator is None:
        return {
            "success": False,
            "status": "error",
            "message": "AgentsOrchestrator не найден. Проверь backend/agents/",
        }
    return {
        "success": True,
        "status": "operational",
        "message": "Локальные агенты (Ollama) готовы",
    }

@app.post("/api/learning/start-course")
async def start_course(request: StartCourseRequest, db: Session = Depends(get_db)):
    if AgentsOrchestrator is None:
        raise HTTPException(status_code=500, detail="Система агентов не подключена")

    try:
        print(f"🚀 Начинаю генерацию курса через Ollama: {request.topic}")
        orchestrator = AgentsOrchestrator()

        # Получаем полный курс (с модулями, викторинами, оценками)
        full_course = orchestrator.create_full_course(
            topic=request.topic,
            difficulty=request.difficulty,
            num_modules=request.num_modules,
        )

        # Сохраняем курс
        db_course = Course(
            title=full_course.get("title", f"Курс: {request.topic}"),
            description=full_course.get("description", ""),
            topic=request.topic,
            difficulty=request.difficulty,
            modules_count=int(full_course.get("total_modules", 0)),
        )
        db.add(db_course)
        db.commit()
        db.refresh(db_course)

        # ✅ Правильные импорты
        from agents.content import ContentGeneratorAgent
        from agents.quiz import QuizGeneratorAgent
        from agents.quality import QualityAssessorAgent

        content_gen = ContentGeneratorAgent()
        quiz_agent = QuizGeneratorAgent()
        quality_agent = QualityAssessorAgent()

        modules = full_course.get("modules", [])
        for m in modules:
            # Безопасное извлечение order
            order_raw = m.get("order", 0)
            if isinstance(order_raw, list):
                order = 0
                print(f"⚠️ Порядок модуля — список: {order_raw}, использую 0")
            elif isinstance(order_raw, (str, int)):
                try:
                    order = int(order_raw)
                except (ValueError, TypeError):
                    order = 0
                    print(f"⚠️ Не удалось преобразовать order: {order_raw}, использую 0")
            else:
                order = 0

            # Генерируем контент, викторину, оценку
            content = content_gen.generate_module_content(
                m.get("title", f"Модуль {order}"),
                request.topic,
                request.difficulty,
                m.get("key_topics", [])
            )

            quiz = quiz_agent.generate_quiz(
                m.get("title", f"Модуль {order}"),
                m.get("key_topics", []),
                content
            )

            quality = quality_agent.assess_content(content, m.get("title", f"Модуль {order}"))

            # Сохраняем модуль с quiz и quality
            db_module = Module(
                course_id=db_course.id,
                title=str(m.get("title", f"Модуль {order}")),
                description=normalize_description_from_module(m),
                content=content,
                module_order=order,
                is_locked=(order > 1),
                is_completed=False,
                quiz_data=json.dumps(quiz),  # ✅ Сохраняем quiz
                quality_data=json.dumps(quality),  # ✅ Сохраняем quality
            )
            db.add(db_module)

        db.commit()

        # Создаём прогресс
        db_progress = Progress(
            course_id=db_course.id,
            completed_modules_count=0,
            total_modules_count=len(modules),
            progress_percent=0,
        )
        db.add(db_progress)
        db.commit()

        return {
            "success": True,
            "course_id": db_course.id,
            "course": {
                "id": db_course.id,
                "title": db_course.title,
                "description": db_course.description,
                "topic": db_course.topic,
                "modules_count": db_course.modules_count,
            },
            "message": "✅ Курс успешно создан через Ollama!",
        }

    except Exception as e:
        print(f"❌ Ошибка генерации: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")

@app.get("/api/learning/courses/{course_id}/modules")
async def get_course_modules(course_id: int, db: Session = Depends(get_db)):
    modules = db.query(Module).filter(Module.course_id == course_id).order_by(Module.module_order.asc()).all()
    if not modules:
        raise HTTPException(status_code=404, detail="Модули не найдены")

    return {
        "success": True,
        "modules": [
            {
                "id": m.id,
                "title": m.title,
                "description": m.description,
                "content": m.content,
                "module_order": m.module_order,
                "is_locked": m.is_locked,
                "is_completed": m.is_completed,
                "quiz": json.loads(m.quiz_data),  # ✅ Возвращаем quiz
                "quality": json.loads(m.quality_data),  # ✅ Возвращаем quality
            }
            for m in modules
        ],
    }

@app.get("/api/learning/modules/{module_id}/content")
async def get_module_content(module_id: int, db: Session = Depends(get_db)):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Модуль не найден")
    if module.is_locked:
        raise HTTPException(status_code=403, detail="Модуль закрыт.")

    return {
        "success": True,
        "module": {
            "id": module.id,
            "title": module.title,
            "description": module.description,
            "content": module.content,
            "is_completed": module.is_completed,
        },
    }

@app.post("/api/learning/modules/{module_id}/complete")
async def complete_module(module_id: int, db: Session = Depends(get_db)):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Модуль не найден")
    
    if not module.is_completed:
        module.is_completed = True
        db.commit()

    next_module = db.query(Module).filter(
        Module.course_id == module.course_id,
        Module.module_order == module.module_order + 1
    ).first()
    
    if next_module:
        next_module.is_locked = False
        db.commit()

    recompute_progress(db, module.course_id)

    return {"success": True, "message": "✅ Модуль завершён"}

@app.get("/api/learning/courses/{course_id}/progress")
async def get_progress(course_id: int, db: Session = Depends(get_db)):
    progress = db.query(Progress).filter(Progress.course_id == course_id).first()
    if not progress:
        raise HTTPException(status_code=404, detail="Прогресс не найден")

    return {
        "success": True,
        "progress": {
            "course_id": progress.course_id,
            "completed_modules_count": progress.completed_modules_count,
            "total_modules_count": progress.total_modules_count,
            "progress_percent": progress.progress_percent,
        },
    }

@app.get("/api/learning/courses")
async def get_all_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).order_by(Course.created_at.desc()).all()
    return {
        "success": True,
        "courses": [
            {
                "id": c.id,
                "title": c.title,
                "description": c.description,
                "topic": c.topic,
                "difficulty": c.difficulty,
                "modules_count": c.modules_count,
                "created_at": c.created_at.isoformat(),
            }
            for c in courses
        ],
    }

# ====== СОЗДАНИЕ ТАБЛИЦ ======
print("🔄 Создаю таблицы в базе данных...")
Base.metadata.create_all(bind=engine)
print("✅ Таблицы успешно созданы!")

# ====== ЗАПУСК ======
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)