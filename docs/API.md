# CodeLens AI API

Base URL for the deployed demo: `https://ai-github-project-reviewer.onrender.com`

All request bodies are JSON. Browser requests use same-origin session cookies. Responses from the JSON helper include `Content-Type: application/json; charset=utf-8` and `Cache-Control: no-store` unless noted. This API is an application interface, not a public, versioned API contract.

## Endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | No | Service status and whether a Gemini key is configured. |
| `GET` | `/api/analysis` | No | Load the default repository analysis. |
| `GET` | `/api/auth/me` | Session | Return the signed-in user. |
| `GET` | `/api/analysis-history` | Session | Return up to 20 saved scans for the signed-in user. |
| `POST` | `/api/auth/register` | No | Create an account and sign in. |
| `POST` | `/api/auth/login` | No | Sign in with email and password. |
| `POST` | `/api/auth/logout` | Optional | Delete the current session and clear its cookie. |
| `POST` | `/api/analyze-repo` | No | Analyze a public GitHub repository URL. |
| `POST` | `/api/chat` | No | Ask a question using a repository scan context. |

## Health and default analysis

### `GET /api/health`

Example response:

```json
{"ok": true, "aiConfigured": true}
```

`aiConfigured` is `false` when neither `GEMINI_API_KEY` nor `GOOGLE_API_KEY` is configured. Chat still has a basic context-based fallback in that case.

### `GET /api/analysis`

Returns the server's default analysis JSON. The shape matches a successful repository analysis response.

## Authentication

### `POST /api/auth/register`

Request:

```json
{"name":"Asha","email":"asha@example.com","password":"at-least-8-characters"}
```

Name is required and limited to 100 characters; email must be valid; password must contain at least 8 characters. Success returns `{"user":{"id":1,"name":"Asha","email":"asha@example.com"}}` and sets an HTTP-only `codelens_session` cookie. Duplicate email returns `409`.

### `POST /api/auth/login`

Request: `{"email":"asha@example.com","password":"your-password"}`

Success returns the user object and sets the session cookie. Invalid credentials return `401`.

### `GET /api/auth/me`

Returns `{"user":{...}}` for a valid session, otherwise `401` with an error object.

### `POST /api/auth/logout`

No body required. Returns `{"ok":true}` and expires the session cookie.

### `GET /api/analysis-history`

Requires a valid session. Returns `{"analyses":[{"id":1,"url":"...","name":"...","createdAt":1730000000,"result":{...}}]}`. Unauthenticated requests return `401`.

## Repository analysis

### `POST /api/analyze-repo`

Request:

```json
{"url":"https://github.com/owner/repository"}
```

Only HTTPS URLs on `github.com` or `www.github.com` are accepted. The repository must be public. Success returns repository metadata, language breakdown, health and score breakdown, scan statistics, issues, security findings, and an `analysisId`. A logged-in user's scan is associated with their account; anonymous scans are stored without a user ID.

Typical errors: `400` invalid URL, `404` repository not found/private, GitHub API status for upstream errors, or `500` for an unexpected analysis failure.

## AI chat

### `POST /api/chat`

Request:

```json
{
  "url":"https://github.com/owner/repository",
  "context":{"name":"repository","issues":[]},
  "message":"What should I fix first?"
}
```

`context` should be the JSON returned by `/api/analyze-repo`. If omitted or invalid, the backend attempts to analyze the URL; if that fails, it uses a small fallback context. Success returns `{"response":"..."}`. With a Gemini key, the backend calls Gemini; without one it returns a context-based response.

## Analysis response (summary)

The analysis object includes fields such as `name`, `url`, `description`, `healthScore`, `scoreBreakdown`, `primaryLanguage`, `languages`, `scanStats`, `issues`, `securityScan`, and `analysisId`. Exact optional fields can vary with GitHub repository metadata.

## Security and limits

- Request JSON parsed by the shared helper is limited to 1 MB.
- Sessions are stored as SHA-256 token hashes and expire after seven days.
- Passwords are stored as salted PBKDF2-HMAC-SHA256 hashes.
- The app scans a bounded number of selected source files using built-in patterns; results are heuristic, not a full security audit.
- Keep Gemini keys in the server environment (Render Environment settings), never in browser code or public source control.
