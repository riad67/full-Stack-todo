from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Todo
from app.schemas import TodoCreate, TodoUpdate


def list_todos(db: Session) -> Sequence[Todo]:
    stmt = select(Todo).order_by(Todo.created_at.desc(), Todo.id.desc())
    return db.scalars(stmt).all()


def get_todo(db: Session, todo_id: int) -> Todo | None:
    return db.get(Todo, todo_id)


def create_todo(db: Session, data: TodoCreate) -> Todo:
    todo = Todo(title=data.title, description=data.description)
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


def update_todo(db: Session, todo: Todo, data: TodoUpdate) -> Todo:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(todo, field, value)
    db.commit()
    db.refresh(todo)
    return todo


def delete_todo(db: Session, todo: Todo) -> None:
    db.delete(todo)
    db.commit()
