import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import Boolean, DateTime, Integer, String, Text, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

load_dotenv(Path(__file__).parent / ".env.local")


def database_url() -> str:
    url = os.getenv("DATABASE_URL")
    if not url:
        raise RuntimeError("DATABASE_URL environment variable is required")

    if not url.startswith("sqlite:///"):
        raise RuntimeError("Only sqlite:/// DATABASE_URL values are supported")

    raw_path = url.removeprefix("sqlite:///")
    path = Path(raw_path)
    if path.is_absolute():
        return url

    return "sqlite:///" + str((Path(__file__).parent / path).as_posix())


def frontend_origins() -> list[str]:
    origins = os.getenv("FRONTEND_ORIGINS")
    if not origins:
        raise RuntimeError("FRONTEND_ORIGINS environment variable is required")

    return [origin.strip() for origin in origins.split(",") if origin.strip()]


engine = create_engine(
    database_url(),
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class TodoModel(Base):
    __tablename__ = "todos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class TodoCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: str = ""

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, value: str) -> str:
        title = value.strip()
        if not title:
            raise ValueError("Title is required")
        return title

    @field_validator("description")
    @classmethod
    def normalize_description(cls, value: str) -> str:
        return value.strip()


class TodoUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=120)
    description: Optional[str] = None
    completed: Optional[bool] = None

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value

        title = value.strip()
        if not title:
            raise ValueError("Title is required")
        return title

    @field_validator("description")
    @classmethod
    def normalize_description(cls, value: Optional[str]) -> Optional[str]:
        return value.strip() if value is not None else value


class TodoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    completed: bool
    created_at: datetime
    updated_at: datetime


app = FastAPI(title="Todo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def create_tables() -> None:
    Base.metadata.create_all(bind=engine)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.on_event("startup")
def on_startup() -> None:
    create_tables()


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Hello World"}


def apply_todo_update(todo: TodoModel, payload: TodoUpdate) -> TodoModel:
    if payload.title is not None:
        todo.title = payload.title
    if payload.description is not None:
        todo.description = payload.description
    if payload.completed is not None:
        todo.completed = payload.completed

    todo.updated_at = now_utc()
    return todo


@app.get("/todos", response_model=list[TodoResponse])
def list_todos(db: Session = Depends(get_db)) -> list[TodoModel]:
    statement = select(TodoModel).order_by(TodoModel.id.desc())
    return list(db.scalars(statement).all())


@app.post("/todos", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(payload: TodoCreate, db: Session = Depends(get_db)) -> TodoModel:
    timestamp = now_utc()
    todo = TodoModel(
        title=payload.title,
        description=payload.description,
        completed=False,
        created_at=timestamp,
        updated_at=timestamp,
    )
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


@app.get("/todos/{todo_id}", response_model=TodoResponse)
def get_todo(todo_id: int, db: Session = Depends(get_db)) -> TodoModel:
    todo = db.get(TodoModel, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    return todo


@app.put("/todos/{todo_id}", response_model=TodoResponse)
def replace_todo(
    todo_id: int,
    payload: TodoUpdate,
    db: Session = Depends(get_db),
) -> TodoModel:
    todo = db.get(TodoModel, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    apply_todo_update(todo, payload)
    db.commit()
    db.refresh(todo)
    return todo


@app.patch("/todos/{todo_id}", response_model=TodoResponse)
def update_todo(
    todo_id: int,
    payload: TodoUpdate,
    db: Session = Depends(get_db),
) -> TodoModel:
    return replace_todo(todo_id, payload, db)


@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int, db: Session = Depends(get_db)) -> Response:
    todo = db.get(TodoModel, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    db.delete(todo)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
