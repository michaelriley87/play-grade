# PlayGrade

PlayGrade is a social platform for discussing games, film and TV, and music. Users can publish image posts, reply, like content, follow other users, filter the feed, and manage their profiles.

## Stack

- Next.js 15, React, TypeScript, and Mantine
- Flask and Gunicorn
- PostgreSQL
- JWT authentication and bcrypt password hashing
- Docker Compose for the local application stack

## Run with Docker

Docker Compose is the supported development setup. It starts PostgreSQL, applies pending database migrations, and then starts the API and frontend.

1. Install Docker Desktop (or Docker Engine with the Compose plugin).
2. Copy the example environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Start the stack:

   ```powershell
   docker compose up --build
   ```

4. Open the services:

   - Application: <http://localhost:3000>
   - API documentation: <http://localhost:5000/apidocs>
   - API health check: <http://localhost:5000/health>

The defaults in `.env.example` are intended only for local development. Set strong database credentials and a randomly generated `PLAYGRADE_SECRET_KEY` before deploying.

To stop the services, run `docker compose down`. To also delete the local database and uploaded-image volumes, run `docker compose down --volumes`.

## Database migrations

Versioned SQL migrations live in `backend/migrations`. The one-shot `migrate` Compose service records applied files in the `schema_migrations` table and runs before the API starts.

Add future schema changes as a new, sequentially named SQL file rather than editing a migration that has already been deployed—for example, `002_add_user_bio.sql`.

To apply migrations manually to a configured database:

```powershell
Set-Location backend
python migrate.py
```

The `PLAYGRADE_DB_NAME`, `PLAYGRADE_DB_USER`, `PLAYGRADE_DB_PASSWORD`, `PLAYGRADE_DB_HOST`, and optional `PLAYGRADE_DB_PORT` variables must be set.

## Run without Docker

Use Python 3.12 for the backend and Node.js 20 or newer for the frontend. A PostgreSQL server and the same environment variables used by Compose are still required.

Backend:

```powershell
Set-Location backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python migrate.py
python app.py
```

Frontend, in another terminal:

```powershell
Set-Location frontend
npm ci
$env:NEXT_PUBLIC_BACKEND_URL = 'http://localhost:5000'
npm run dev
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PLAYGRADE_DB_NAME` | PostgreSQL database name |
| `PLAYGRADE_DB_USER` | PostgreSQL user |
| `PLAYGRADE_DB_PASSWORD` | PostgreSQL password |
| `PLAYGRADE_DB_HOST` | PostgreSQL hostname |
| `PLAYGRADE_DB_PORT` | PostgreSQL port; defaults to `5432` |
| `PLAYGRADE_SECRET_KEY` | Secret used to sign JWTs; required |
| `PLAYGRADE_CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `PLAYGRADE_MAX_UPLOAD_BYTES` | Maximum request size; defaults to 2 MiB |
| `NEXT_PUBLIC_BACKEND_URL` | API URL reachable by the user's browser |

Uploaded images and PostgreSQL data are kept in named Docker volumes so they survive container recreation.
