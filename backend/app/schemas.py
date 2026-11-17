from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


def _clean_title(value: str) -> str:
    value = value.strip()
    if not value:
        raise ValueError("Title must not be blank")
    return value


def _clean_description(value: str | None) -> str | None:
    if value is None:
        return None
    value = value.strip()
    return value or None


class TodoCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=5000)

    _title = field_validator("title")(_clean_title)
    _description = field_validator("description")(_clean_description)


class TodoUpdate(BaseModel):
    """Partial update: only the fields that are sent are changed."""

    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=5000)
    completed: bool | None = None

    @field_validator("title")
    @classmethod
    def _title(cls, value: str | None) -> str:
        if value is None:
            raise ValueError("Title cannot be null")
        return _clean_title(value)

    @field_validator("completed")
    @classmethod
    def _completed(cls, value: bool | None) -> bool:
        if value is None:
            raise ValueError("Completed cannot be null")
        return value

    _description = field_validator("description")(_clean_description)


class TodoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    completed: bool
    created_at: datetime
    updated_at: datetime | None
