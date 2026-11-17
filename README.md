# Full-Stack Todo App

A simple task manager built with React, FastAPI, and PostgreSQL. Create, edit, complete, and delete tasks in a responsive interface, with changes stored in a database.

## Features

- Create tasks with a title and optional description
- Edit, complete, and delete tasks
- Filter tasks and track progress
- Optimistic updates, loading states, validation, and toast notifications
- REST API with interactive documentation and rate limiting
- PostgreSQL persistence and Alembic database migrations

## Demo

[Watch the demo video](Demo_video/todo_poc.mp4)

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Axios, Zod |
| Backend | Python, FastAPI, SQLAlchemy 2.0, Pydantic v2, Uvicorn |
| Database | PostgreSQL 16, Alembic |
| Local database | Docker Compose |

## Project structure

```text
todo-app/
├── backend/           FastAPI application and Alembic migrations
├── frontend/          React and Vite application
├── docker-compose.yml PostgreSQL service
└── README.md
```

## Run locally on Windows

### Prerequisites

- Docker Desktop, installed and running
- Python 3.11–3.13 and the Windows Python launcher (`py`)
- Node.js and npm (Node.js 20 or 22 recommended)

Open **Command Prompt** in the project folder. Docker Compose starts PostgreSQL on port 5432 using the development credentials in `docker-compose.yml`.

### 1. Start the database

```cmd
docker compose up -d
docker compose ps
```

Wait for the database service to show **healthy**. Leave Docker Desktop running.

### 2. Start the backend

In a Command Prompt opened in the project folder:

```cmd
cd backend
py -3.13 -m venv .venv
call .venv\Scripts\activate.bat
python -m pip install -r requirements.txt
if not exist .env copy .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

If you use Python 3.11 or 3.12, replace `py -3.13` with your installed version. If you already have a compatible virtual environment in `backend\.venv`, activate it instead of creating another one. The copy command preserves an existing `.env` file.

Leave this window open. The API is available at [localhost:8000](http://localhost:8000), interactive documentation at [localhost:8000/docs](http://localhost:8000/docs), and API/database health at [localhost:8000/health](http://localhost:8000/health).

### 3. Start the frontend

Open a second Command Prompt in the project folder:

```cmd
cd frontend
npm install
if not exist .env copy .env.example .env
npm run dev
```

Open [localhost:5173](http://localhost:5173) and keep both application windows open. Vite will print the address if it uses a different port; add that origin to `CORS_ORIGINS` in `backend/.env` and restart the backend if needed.

## Test the application

1. In the frontend, create a task, edit it, mark it complete, and refresh the page. Your changes should remain.
2. Delete the task, confirm deletion, and refresh to check it remains deleted. Try an empty title to check validation.
3. Open [the API documentation](http://localhost:8000/docs) and use **Try it out** to test the POST, GET, PUT, and DELETE endpoints. A deleted task should return 404 when requested again.
4. To inspect saved tasks directly, run this from the project folder:

   ```cmd
   docker compose exec db psql -U todo_user -d todo_db
   ```

   Then run:

   ```sql
   SELECT id, title, description, completed, created_at, updated_at
   FROM todos ORDER BY id DESC;
   ```

   Type `\q` to exit PostgreSQL.

To test persistence across a database restart, create a task, run `docker compose down` and `docker compose up -d` from the project folder, wait for a healthy status, and refresh the frontend. The task should still be present. Do not add `-v` to `docker compose down` unless you intend to delete the database volume and its data.

## API reference

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | Check API and database health |
| GET | `/api/todos` | List tasks, newest first |
| GET | `/api/todos/{id}` | Get a task |
| POST | `/api/todos` | Create a task |
| PUT | `/api/todos/{id}` | Update a task |
| DELETE | `/api/todos/{id}` | Delete a task; returns 204 |

Example request body for `POST /api/todos`:

```json
{
  "title": "Plan the week",
  "description": "Write down the most important tasks",
  "completed": false
}
```

Missing tasks return 404, invalid input returns 422, and requests over the configured rate limit return 429. The interactive docs include response schemas and let you send requests directly.

## Configuration

Copy the example files only if the corresponding `.env` does not already exist. Do not commit `.env` files or credentials.

| File | Variable | Development default |
| --- | --- | --- |
| `backend/.env` | `DATABASE_URL` | `postgresql+psycopg2://todo_user:todo_pass@localhost:5432/todo_db` |
| `backend/.env` | `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` |
| `backend/.env` | `RATE_LIMIT` | `100/minute` |
| `frontend/.env` | `VITE_API_URL` | `http://localhost:8000` |

These credentials and settings are for local development. An internet-facing deployment needs appropriate authentication, secrets, HTTPS, and database configuration.

## Useful commands

Run these from the indicated directory:

| Directory | Command | Purpose |
| --- | --- | --- |
| Project root | `docker compose ps` | Check the database container |
| Project root | `docker compose down` | Stop the database, retaining its volume |
| `backend` | `alembic upgrade head` | Apply migrations |
| `frontend` | `npm run typecheck` | Check TypeScript |
| `frontend` | `npm run build` | Type-check and build the frontend |

## Troubleshooting

- **Docker cannot connect to the engine:** Start Docker Desktop and wait until it is running. Check `docker info` and `docker context ls`.
- **Database connection refused:** Check `docker compose ps`, ensure port 5432 is available, and verify `DATABASE_URL` matches your database.
- **Frontend cannot reach the API:** Ensure Uvicorn is running, check [the health endpoint](http://localhost:8000/health), and verify `VITE_API_URL`.
- **CORS error:** Add the exact frontend origin to `CORS_ORIGINS` in `backend/.env`, then restart the backend.
- **Migration error:** Confirm PostgreSQL is healthy and the database URL is correct before rerunning `alembic upgrade head`.

## Adding a demo video on GitHub

One way to show an inline video is to open a GitHub issue or pull request, attach the video to its comment editor, and wait for GitHub to generate a URL. Copy that URL into the Demo section on its own line, then commit and push the README. You can discard the draft comment if the uploaded URL remains accessible; verify the video plays in the README after pushing.

Alternatively, add a file such as `docs/demo.mp4` to the repository and use `[Watch the demo](docs/demo.mp4)` in the Demo section. GitHub's file and upload limits apply; the link opens the video rather than guaranteeing an inline player.
