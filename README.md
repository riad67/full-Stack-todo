# Todo App

Full-stack Todo app: **React 18 + Vite + TypeScript + Tailwind** on the front, **FastAPI + SQLAlchemy 2.0 + Pydantic v2** on the back, **PostgreSQL** for storage, **Alembic** for migrations.

```
todo-app/
├── frontend/          React + Vite + TypeScript + Tailwind
├── backend/           FastAPI + SQLAlchemy + Alembic
├── docker-compose.yml PostgreSQL 16
└── README.md
```

## Prerequisites

- Docker (for PostgreSQL) — or an existing PostgreSQL server
- Python 3.11+
- Node.js 18+

## 1. Start PostgreSQL

From the project root:

```bash
docker compose up -d
```

This starts PostgreSQL on port 5432 with database `todo_db`, user `todo_user`, password `todo_pass`. Check it is ready with `docker compose ps` (the status should read "healthy").

## 2. Set up and run the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # Windows: copy .env.example .env
alembic upgrade head               # creates the todos table
uvicorn app.main:app --reload --port 8000
```

The API is now at http://localhost:8000. Interactive docs are at http://localhost:8000/docs, and `GET http://localhost:8000/health` reports API and database status.

## 3. Set up and run the frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env               # Windows: copy .env.example .env
npm run dev
```

Open http://localhost:5173.

## API

| Method | Path              | Description                                      |
| ------ | ----------------- | ------------------------------------------------ |
| GET    | `/health`         | Health check (also verifies the database)        |
| GET    | `/api/todos`      | All todos, newest first                          |
| GET    | `/api/todos/{id}` | One todo                                         |
| POST   | `/api/todos`      | Create a todo (`title` required)                 |
| PUT    | `/api/todos/{id}` | Update `title`, `description` and/or `completed` |
| DELETE | `/api/todos/{id}` | Permanently delete a todo (returns 204)          |

Errors use the shape `{"detail": "message"}`. Missing todos return 404, invalid input returns 422, and exceeding the rate limit returns 429 Too Many Requests.

## Configuration

`backend/.env`

| Variable       | Default                                              | Purpose                          |
| -------------- | ---------------------------------------------------- | -------------------------------- |
| `DATABASE_URL` | `postgresql+psycopg2://todo_user:todo_pass@localhost:5432/todo_db` | SQLAlchemy connection URL |
| `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173`        | Origins allowed by CORS          |
| `RATE_LIMIT`   | `100/minute`                                         | Per-IP limit on every endpoint   |

`frontend/.env`

| Variable       | Default                 | Purpose              |
| -------------- | ----------------------- | -------------------- |
| `VITE_API_URL` | `http://localhost:8000` | Backend base URL     |

## Migrations

```bash
cd backend
alembic upgrade head                                   # apply all migrations
alembic revision --autogenerate -m "describe change"   # after editing models.py
alembic downgrade -1                                   # undo the last migration
```

## Useful commands

```bash
npm run build        # type-check and build the frontend for production
npm run typecheck    # type-check only
docker compose down  # stop PostgreSQL (add -v to also delete its data)
```

## Troubleshooting

- **"Can't reach the server"** in the UI: the backend isn't running on port 8000, or `VITE_API_URL` points elsewhere.
- **`DATABASE_URL is not set`**: copy `backend/.env.example` to `backend/.env`.
- **Connection refused on 5432**: PostgreSQL isn't running, or another Postgres already uses the port. Stop it or change the host port in `docker-compose.yml` and `DATABASE_URL`.
- **CORS errors**: add the frontend's origin to `CORS_ORIGINS` and restart the backend.
