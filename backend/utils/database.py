import psycopg2
import os

PLAYGRADE_DB_CONFIG = {
    "dbname": os.getenv("PLAYGRADE_DB_NAME"),
    "user": os.getenv("PLAYGRADE_DB_USER"),
    "password": os.getenv("PLAYGRADE_DB_PASSWORD"),
    "host": os.getenv("PLAYGRADE_DB_HOST"),
    "port": os.getenv("PLAYGRADE_DB_PORT", "5432"),
}


def get_db_connection():
    return psycopg2.connect(**PLAYGRADE_DB_CONFIG)
