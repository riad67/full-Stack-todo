from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.models import Todo
from app.schemas import TodoCreate, TodoRead, TodoUpdate

router = APIRouter(prefix="/api/todos", tags=["todos"])

DbSession = Annotated[Session, Depends(get_db)]


def _get_or_404(db: Session, todo_id: int) -> Todo:
    todo = crud.get_todo(db, todo_id)
    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo {todo_id} was not found",
        )
    return todo


def _db_error(exc: SQLAlchemyError) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="A database error occurred. Please try again.",
    )


@router.get("", response_model=list[TodoRead])
def list_todos(db: DbSession):
    try:
        return crud.list_todos(db)
    except SQLAlchemyError as exc:
        raise _db_error(exc) from exc


@router.get("/{todo_id}", response_model=TodoRead)
def get_todo(todo_id: int, db: DbSession):
    return _get_or_404(db, todo_id)


@router.post("", response_model=TodoRead, status_code=status.HTTP_201_CREATED)
def create_todo(payload: TodoCreate, db: DbSession):
    try:
        return crud.create_todo(db, payload)
    except SQLAlchemyError as exc:
        db.rollback()
        raise _db_error(exc) from exc


@router.put("/{todo_id}", response_model=TodoRead)
def update_todo(todo_id: int, payload: TodoUpdate, db: DbSession):
    todo = _get_or_404(db, todo_id)
    try:
        return crud.update_todo(db, todo, payload)
    except SQLAlchemyError as exc:
        db.rollback()
        raise _db_error(exc) from exc


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int, db: DbSession) -> Response:
    todo = _get_or_404(db, todo_id)
    try:
        crud.delete_todo(db, todo)
    except SQLAlchemyError as exc:
        db.rollback()
        raise _db_error(exc) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)
