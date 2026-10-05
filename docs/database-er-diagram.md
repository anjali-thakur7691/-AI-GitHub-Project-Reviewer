# CodeLens AI Database ER Diagram

This diagram documents the SQLite schema initialized by `database.py`.

```mermaid
erDiagram
    USERS ||--o{ SESSIONS : "has"
    USERS o|--o{ REPOSITORY_ANALYSES : "owns (optional)"

    USERS {
        INTEGER id PK
        TEXT name
        TEXT email UK
        TEXT password_salt
        TEXT password_hash
        INTEGER created_at
    }

    SESSIONS {
        TEXT token_hash PK
        INTEGER user_id FK
        INTEGER expires_at
        INTEGER created_at
    }

    REPOSITORY_ANALYSES {
        INTEGER id PK
        INTEGER user_id FK "nullable"
        TEXT repository_url
        TEXT repository_name
        TEXT result_json
        INTEGER created_at
    }
```

## Relationships and constraints

- A user can have multiple sessions. Deleting the user deletes their sessions (`ON DELETE CASCADE`).
- A user can have multiple saved analyses. `user_id` is nullable so anonymous scans can be saved; deleting a user preserves scan rows and sets their `user_id` to `NULL` (`ON DELETE SET NULL`).
- `users.email` is unique and case-insensitive.
- Session tokens are not stored in plain text; `token_hash` is the primary key.
- Times are Unix timestamps in seconds. `result_json` stores the analysis response as JSON text.
- Indexes support removing expired sessions and listing recent analyses by user.
