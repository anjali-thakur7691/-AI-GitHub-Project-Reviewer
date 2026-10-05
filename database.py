"""Small SQLite persistence layer for CodeLens accounts and repository scans."""

import hashlib
import json
import os
import secrets
import sqlite3
import time
from contextlib import contextmanager


PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.getenv("CODELENS_DATABASE_PATH", os.path.join(PROJECT_DIR, "codelens.sqlite3"))
PASSWORD_ITERATIONS = 310_000
SESSION_TTL_SECONDS = 7 * 24 * 60 * 60


@contextmanager
def connect():
    connection = sqlite3.connect(DATABASE_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def _password_hash(password, salt=None):
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS)
    return salt.hex(), digest.hex()


def initialize_database():
    directory = os.path.dirname(DATABASE_PATH)
    if directory:
        os.makedirs(directory, exist_ok=True)
    with connect() as db:
        db.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_salt TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                created_at INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS sessions (
                token_hash TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                expires_at INTEGER NOT NULL,
                created_at INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS repository_analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                repository_url TEXT NOT NULL,
                repository_name TEXT NOT NULL,
                result_json TEXT NOT NULL,
                created_at INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
            CREATE INDEX IF NOT EXISTS idx_analyses_user_created ON repository_analyses(user_id, created_at DESC);
        """)
        db.execute("DELETE FROM sessions WHERE expires_at <= ?", (int(time.time()),))
        demo_email = "demo@codelens.ai"
        row = db.execute("SELECT id FROM users WHERE email = ?", (demo_email,)).fetchone()
        if not row:
            salt, digest = _password_hash("CodeLensDemo123")
            db.execute(
                "INSERT INTO users(name, email, password_salt, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
                ("CodeLens Demo", demo_email, salt, digest, int(time.time())),
            )


def create_user(name, email, password):
    salt, digest = _password_hash(password)
    with connect() as db:
        cursor = db.execute(
            "INSERT INTO users(name, email, password_salt, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
            (name.strip(), email.strip().lower(), salt, digest, int(time.time())),
        )
        return {"id": cursor.lastrowid, "name": name.strip(), "email": email.strip().lower()}


def authenticate_user(email, password):
    with connect() as db:
        user = db.execute("SELECT * FROM users WHERE email = ?", (email.strip().lower(),)).fetchone()
    if not user:
        # Keep the work factor similar for unknown accounts to reduce timing clues.
        _password_hash(password, bytes(16))
        return None
    _, digest = _password_hash(password, bytes.fromhex(user["password_salt"]))
    if not secrets.compare_digest(digest, user["password_hash"]):
        return None
    return {"id": user["id"], "name": user["name"], "email": user["email"]}


def create_session(user_id):
    token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    now = int(time.time())
    with connect() as db:
        db.execute("DELETE FROM sessions WHERE expires_at <= ?", (now,))
        db.execute("INSERT INTO sessions(token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
                   (token_hash, user_id, now + SESSION_TTL_SECONDS, now))
    return token


def get_session_user(token):
    if not token:
        return None
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    now = int(time.time())
    with connect() as db:
        row = db.execute(
            "SELECT users.id, users.name, users.email FROM sessions JOIN users ON users.id = sessions.user_id "
            "WHERE sessions.token_hash = ? AND sessions.expires_at > ?", (token_hash, now)
        ).fetchone()
        db.execute("DELETE FROM sessions WHERE expires_at <= ?", (now,))
    return dict(row) if row else None


def delete_session(token):
    if not token:
        return
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    with connect() as db:
        db.execute("DELETE FROM sessions WHERE token_hash = ?", (token_hash,))


def save_analysis(user_id, result):
    repository_url = result.get("url", "")
    repository_name = result.get("name", "Unknown repository")
    with connect() as db:
        cursor = db.execute(
            "INSERT INTO repository_analyses(user_id, repository_url, repository_name, result_json, created_at) "
            "VALUES (?, ?, ?, ?, ?)",
            (user_id, repository_url, repository_name, json.dumps(result), int(time.time())),
        )
        return cursor.lastrowid


def list_analyses(user_id, limit=20):
    with connect() as db:
        rows = db.execute(
            "SELECT id, repository_url, repository_name, result_json, created_at FROM repository_analyses "
            "WHERE user_id = ? ORDER BY created_at DESC LIMIT ?", (user_id, limit)
        ).fetchall()
    return [{
        "id": row["id"],
        "url": row["repository_url"],
        "name": row["repository_name"],
        "createdAt": row["created_at"],
        "result": json.loads(row["result_json"]),
    } for row in rows]
