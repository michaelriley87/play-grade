import os
from dataclasses import dataclass
from io import BytesIO
from itertools import count

import psycopg2
from psycopg2 import sql
import pytest


os.environ.setdefault("PLAYGRADE_DB_NAME", "playgrade_test")
os.environ.setdefault("PLAYGRADE_DB_USER", "playgrade")
os.environ.setdefault("PLAYGRADE_DB_PASSWORD", "playgrade_dev_password")
os.environ.setdefault("PLAYGRADE_DB_HOST", "localhost")
os.environ.setdefault("PLAYGRADE_DB_PORT", "5432")
os.environ.setdefault("PLAYGRADE_SECRET_KEY", "automated-test-secret")
os.environ.setdefault("PLAYGRADE_UPLOAD_FOLDER", "/tmp/playgrade-test-uploads")

from app import app as flask_app
from migrate import run_migrations
from utils.database import get_db_connection


PNG_BYTES = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"
    b"\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00"
    b"\x1f\x15\xc4\x89\x00\x00\x00\rIDAT\x08\xd7c\xf8\xcf\xc0\xf0\x1f\x00\x05\x00\x01\xff"
    b"\x89\x99=\x1d\x00\x00\x00\x00IEND\xaeB`\x82"
)


@dataclass
class TestUser:
    user_id: int
    username: str
    email: str
    password: str
    token: str

    @property
    def headers(self):
        return {"Authorization": f"Bearer {self.token}"}


def reset_tables():
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "TRUNCATE TABLE likes, follows, replies, posts, users RESTART IDENTITY CASCADE"
            )


@pytest.fixture(scope="session", autouse=True)
def migrated_test_database():
    test_database = os.environ["PLAYGRADE_DB_NAME"]
    admin_config = {
        "dbname": os.getenv("PLAYGRADE_DB_ADMIN_DB", "postgres"),
        "user": os.environ["PLAYGRADE_DB_USER"],
        "password": os.environ["PLAYGRADE_DB_PASSWORD"],
        "host": os.environ["PLAYGRADE_DB_HOST"],
        "port": os.environ["PLAYGRADE_DB_PORT"],
    }

    admin_connection = psycopg2.connect(**admin_config)
    admin_connection.autocommit = True
    with admin_connection.cursor() as cursor:
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (test_database,))
        if not cursor.fetchone():
            cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(test_database)))
    admin_connection.close()

    run_migrations()
    reset_tables()
    yield
    reset_tables()


@pytest.fixture(autouse=True)
def clean_test_state(migrated_test_database):
    reset_tables()
    upload_folder = flask_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_folder, exist_ok=True)
    for filename in os.listdir(upload_folder):
        path = os.path.join(upload_folder, filename)
        if os.path.isfile(path):
            os.remove(path)
    yield
    reset_tables()


@pytest.fixture
def client():
    flask_app.config.update(TESTING=True)
    with flask_app.test_client() as test_client:
        yield test_client


@pytest.fixture
def user_factory(client):
    sequence = count(1)

    def create_user(username=None, email=None, password="Password123!"):
        number = next(sequence)
        username = username or f"user{number}"
        email = email or f"user{number}@example.test"
        response = client.post(
            "/users/register",
            json={"username": username, "email": email, "password": password},
        )
        assert response.status_code == 201, response.get_json()

        login_response = client.post(
            "/users/login", json={"email": email, "password": password}
        )
        assert login_response.status_code == 200, login_response.get_json()
        return TestUser(
            user_id=response.get_json()["user_id"],
            username=username,
            email=email,
            password=password,
            token=login_response.get_json()["token"],
        )

    return create_user


@pytest.fixture
def post_factory(client):
    def create_post(user, title="Test post", category="🎮 Games", body="Test body"):
        response = client.post(
            "/posts",
            headers=user.headers,
            data={
                "title": title,
                "category": category,
                "body": body,
                "image": (BytesIO(PNG_BYTES), "test.png"),
            },
            content_type="multipart/form-data",
        )
        assert response.status_code == 201, response.get_json()
        return response.get_json()["post_id"]

    return create_post

