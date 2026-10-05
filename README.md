# CodeLens AI

CodeLens AI is a web app for reviewing public GitHub repositories. It scans selected source files for common code and security patterns, shows repository metrics and findings, and can answer questions about a scan through the AI chat. The dashboard also has a voice assistant: ask a question with your microphone and hear the answer.

## Features

- Analyze a public GitHub repository by URL.
- View repository health, languages, files, and detected issues.
- Review security findings and suggested fixes.
- Ask questions about the current scan in AI chat.
- Use dashboard voice input and spoken answers (browser support and microphone permission required).
- Register and sign in; accounts and scan history are stored in a local SQLite database.
- Optional Gemini responses using `GEMINI_API_KEY`.

The built-in scanner uses source-pattern checks on a limited set of files. It is not a full dependency audit or a replacement for a dedicated security scanner. Without a Gemini key, the assistant uses a basic context-based response.

## Requirements

- Python 3
- Node.js and npm
- Internet access to fetch public GitHub repository information and source files

No Python packages need to be installed; the backend uses Python's standard library.

## Run locally

From the project folder, install the frontend packages once:

```powershell
npm install
```

Start the app (the Python server builds the frontend when needed):

```powershell
python app.py
```

Then open <http://localhost:8000>. Keep the terminal open while using the app.

To use Gemini, copy `.env.example` to `.env` and set your key:

```dotenv
GEMINI_API_KEY=your_api_key_here
```

The `.env` file is ignored by Git. Do not commit API keys.

## Frontend development

Vite can run the frontend separately:

```powershell
npm run dev
```

This starts the UI on port 3000. The Python backend is a separate process on port 8000; use `python app.py` for the fully connected app.

Create a production frontend build with:

```powershell
npm run build
```

## Configuration

- `PORT`: backend port; defaults to `8000`.
- `GEMINI_API_KEY` or `GOOGLE_API_KEY`: optional Gemini API key.
- `CODELENS_COOKIE_SECURE`: set to `true` when serving over HTTPS.
- `CODELENS_DATABASE_PATH`: optional path for the SQLite database.

## Deploy on Render

The repository includes a `render.yaml` Blueprint and a multi-stage `Dockerfile`. In Render, create a new Blueprint, connect this GitHub repository, and select the branch to deploy. Render will build the React frontend, start the Python API, and check `/api/health`.

Add `GEMINI_API_KEY` in the Render service's Environment settings if you want Gemini-powered answers. Do not put the key in `render.yaml` or commit it to Git.

The Blueprint uses Render's free web service. Free services sleep after 15 minutes without traffic and their local filesystem is temporary. This app stores accounts and scan history in SQLite, so that data can be lost when the service sleeps, restarts, or redeploys. Use a paid service with a persistent disk for SQLite persistence; the disk has an additional cost.

## Project layout

```text
app.py                 Python HTTP API and GitHub analysis
database.py             SQLite accounts, sessions, and scan history
index.html              Vite HTML entry point
public/favicon.svg      Browser tab icon
src/App.jsx             Main view and application state
src/api.js              Frontend API client
src/components/         Shared UI components
src/views/              Landing, dashboard, chat, and analysis views
```

## Project submission materials

- [Project presentation](docs/CodeLens_AI_Project_Presentation.pptx)
- [API documentation](docs/API.md)
- [Database ER diagram](docs/database-er-diagram.md)

## Security notes

- Keep `.env` private and rotate a key if it is accidentally exposed.
- Use HTTPS and set `CODELENS_COOKIE_SECURE=true` when deploying publicly.
- The local SQLite database contains account and session data; protect it like other private application data.

## Contributing

Open an issue or pull request with a clear description of the change. Avoid committing `.env`, the SQLite database, `node_modules`, or generated `dist` files.
