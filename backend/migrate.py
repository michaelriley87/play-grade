import os
import time
from pathlib import Path

import psycopg2


MIGRATIONS_DIR = Path(__file__).parent / "migrations"
MAX_CONNECTION_ATTEMPTS = 30


def database_config():
    return {
        "dbname": os.environ["PLAYGRADE_DB_NAME"],
        "user": os.environ["PLAYGRADE_DB_USER"],
        "password": os.environ["PLAYGRADE_DB_PASSWORD"],
        "host": os.environ["PLAYGRADE_DB_HOST"],
        "port": os.getenv("PLAYGRADE_DB_PORT", "5432"),
    }


def connect_with_retry():
    for attempt in range(1, MAX_CONNECTION_ATTEMPTS + 1):
        try:
            return psycopg2.connect(**database_config())
        except psycopg2.OperationalError:
            if attempt == MAX_CONNECTION_ATTEMPTS:
                raise
            print(f"Database unavailable; retrying ({attempt}/{MAX_CONNECTION_ATTEMPTS})")
            time.sleep(1)


def run_migrations():
    migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    if not migration_files:
        raise RuntimeError(f"No migrations found in {MIGRATIONS_DIR}")

    with connect_with_retry() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS schema_migrations (
                    version TEXT PRIMARY KEY,
                    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )

            for migration_file in migration_files:
                cursor.execute(
                    "SELECT 1 FROM schema_migrations WHERE version = %s",
                    (migration_file.name,),
                )
                if cursor.fetchone():
                    print(f"Already applied: {migration_file.name}")
                    continue

                print(f"Applying: {migration_file.name}")
                cursor.execute(migration_file.read_text(encoding="utf-8"))
                cursor.execute(
                    "INSERT INTO schema_migrations (version) VALUES (%s)",
                    (migration_file.name,),
                )

    print("Database migrations are up to date")


if __name__ == "__main__":
    run_migrations()

