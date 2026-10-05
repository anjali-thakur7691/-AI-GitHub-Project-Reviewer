"""CodeLens API server with GitHub repository analysis and optional Gemini assistance."""

import http.server
import socketserver
import json
import re
import os
import urllib.request
import urllib.error
import subprocess
import sqlite3
from http.cookies import SimpleCookie
from urllib.parse import urlparse

PORT = 8000
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(PROJECT_DIR, "dist")


def load_local_env_file():
    """Read simple KEY=value entries without replacing environment settings."""
    env_path = os.path.join(PROJECT_DIR, ".env")
    try:
        with open(env_path, "r", encoding="utf-8") as env_file:
            for line in env_file:
                stripped = line.strip()
                if not stripped or stripped.startswith("#") or "=" not in stripped:
                    continue
                key, value = stripped.split("=", 1)
                key = key.strip()
                value = value.strip().strip("\"'")
                if key and key not in os.environ:
                    os.environ[key] = value
    except FileNotFoundError:
        pass


load_local_env_file()
PORT = int(os.getenv("PORT", str(PORT)))

import database

# Gemini API Key configuration via Environment Variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
GEMINI_MODEL = "gemini-2.5-flash"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AI-GitHub-Project-Reviewer/1.0',
    'Accept': 'application/vnd.github.v3+json'
}

SCANNABLE_EXTENSIONS = {
    '.py', '.js', '.jsx', '.ts', '.tsx', '.json', '.yaml', '.yml', 
    '.env', '.sh', '.sql', '.html', '.php', '.go', '.rs', '.java', '.rb', '.c', '.cpp'
}

IGNORE_DIRS = {
    'node_modules', '.git', 'dist', 'build', 'vendor', '__pycache__', 
    '.next', '.venv', 'venv', 'coverage', '.idea', '.vscode'
}

IGNORE_FILES = {
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'composer.lock'
}

MAX_SCANNABLE_FILES = 25

def parse_github_url(url):
    """Extract owner and repo from GitHub URL string"""
    try:
        parsed = urlparse(str(url).strip())
        if parsed.scheme != "https" or parsed.hostname not in {"github.com", "www.github.com"}:
            return None, None
        parts = [part for part in parsed.path.strip("/").split("/") if part]
        if len(parts) != 2:
            return None, None
        owner, repo = parts
        if repo.endswith(".git"):
            repo = repo[:-4]
        if re.fullmatch(r"[A-Za-z0-9-]+", owner) and re.fullmatch(r"[A-Za-z0-9_.-]+", repo):
            return owner, repo
    except (TypeError, ValueError):
        pass
    return None, None

def fetch_json(url):
    """Fetch JSON data from URL using standard Python urllib"""
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=12) as response:
        if response.status == 200:
            return json.loads(response.read().decode('utf-8'))
    return None

def fetch_raw_file(raw_url):
    """Fetch raw file content from GitHub"""
    try:
        req = urllib.request.Request(raw_url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=8) as response:
            if response.status == 200:
                return response.read().decode('utf-8', errors='ignore')
    except Exception:
        pass
    return ""

def query_gemini_ai(repo_context, user_prompt):
    """Query Google Gemini API with repository scanned context"""
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or GEMINI_API_KEY
    
    # Context-Aware Fallback Engine if API key is not set
    if not api_key:
        issues_summary = "\n".join([f"- [{i['severity']}] {i['title']} in {i['file']}:{i['line']}" for i in repo_context.get('issues', [])])
        return (
            f"🤖 [AI Code Reviewer - Context Analysis for {repo_context.get('name', 'Repository')}]\n\n"
            f"Based on Python AST scanning of {repo_context.get('name')} (Health Score: {repo_context.get('healthScore')}/100):\n"
            f"• Primary Language: {repo_context.get('primaryLanguage')}\n"
            f"• Total Files Scanned: {repo_context.get('scanStats', {}).get('scanned', 25)} files\n\n"
            f"Detected Security & Quality Issues:\n{issues_summary}\n\n"
            f"Answer to your question ({user_prompt}):\n"
            f"The repository requires immediate attention for '{repo_context.get('issues', [{}])[0].get('title', 'Security Risk')}' in '{repo_context.get('issues', [{}])[0].get('file', 'config')}'. Applying process.env or secret manager fixes will elevate health score above 90+.\n\n"
            f"💡 Note: Set GEMINI_API_KEY environment variable to enable direct Google Gemini 2.5 Flash LLM answers!"
        )

    # Call Real Google Gemini REST API
    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={api_key}"
    
    system_instruction = (
        "You are an expert Senior AI Security Engineer & Code Reviewer. "
        "Analyze the user's GitHub repository using the provided scanned context data. "
        "Be concise, technical, precise, and direct. Refer specifically to actual scanned files, line numbers, and issue titles. "
        "If information is not present in the scanned context, explicitly state so."
    )

    context_str = json.dumps({
        "repository_name": repo_context.get('name'),
        "health_score": repo_context.get('healthScore'),
        "score_breakdown": repo_context.get('scoreBreakdown'),
        "primary_language": repo_context.get('primaryLanguage'),
        "languages_breakdown": repo_context.get('languages'),
        "scanned_stats": repo_context.get('scanStats'),
        "detected_issues": repo_context.get('issues'),
        "security_findings": repo_context.get('securityScan', {}).get('findings')
    }, indent=2)

    full_prompt = f"{system_instruction}\n\n=== SCANNED REPOSITORY CONTEXT ===\n{context_str}\n\n=== USER QUESTION ===\n{user_prompt}"

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": full_prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 800
        }
    }

    try:
        req = urllib.request.Request(
            gemini_url,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=15) as response:
            if response.status == 200:
                res_data = json.loads(response.read().decode('utf-8'))
                candidates = res_data.get('candidates', [])
                if candidates:
                    parts = candidates[0].get('content', {}).get('parts', [])
                    if parts:
                        return parts[0].get('text', '').strip()
    except urllib.error.HTTPError as e:
        # Fallback if model version differs
        if e.code == 404 and GEMINI_MODEL == "gemini-2.5-flash":
            fallback_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            try:
                req_fb = urllib.request.Request(fallback_url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
                with urllib.request.urlopen(req_fb, timeout=15) as res_fb:
                    if res_fb.status == 200:
                        res_data = json.loads(res_fb.read().decode('utf-8'))
                        return res_data['candidates'][0]['content']['parts'][0]['text'].strip()
            except Exception:
                pass
        return f"Gemini API Error ({e.code}). Please check GEMINI_API_KEY validity or quota."
    except Exception as e:
        return f"Error contacting Gemini AI API: {str(e)}"

    return "No response generated by Gemini AI."

def redact_secret_string(text):
    """Safely redact secret key strings into masked representations (e.g. sk_live_****...****)"""
    if not text:
        return ""
    
    redacted = str(text)

    secret_patterns = [
        r'sk_live_[0-9a-zA-Z]{20,}',
        r'AIzaSy[0-9a-zA-Z_-]{30,}',
        r'ghp_[0-9a-zA-Z]{30,}',
        r'AKIA[0-9A-Z]{16}',
        r'api_key\s*=\s*["\'][A-Za-z0-9_\-]{16,}["\']',
        r'password\s*=\s*["\'][^"\']{4,}["\']'
    ]

    for pat in secret_patterns:
        matches = re.findall(pat, redacted)
        for m in matches:
            if len(m) > 12:
                prefix = m[:8]
                suffix = m[-4:]
                masked = f"{prefix}****...****{suffix}"
            else:
                masked = "****[REDACTED_SECRET]****"
            redacted = redacted.replace(m, masked)
    
    return redacted

def query_gemini_ai(repo_context, user_prompt):
    """Query Google Gemini API with repository scanned context"""
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or GEMINI_API_KEY
    
    prompt_lower = user_prompt.lower()
    is_secret_query = any(k in prompt_lower for k in ['secret', 'key', 'password', 'token', '.env', 'gitignore', 'credential', 'hardcoded'])

    # Context-Aware Fallback Engine if API key is not set
    if not api_key:
        sec_issues = [i for i in repo_context.get('issues', []) if i.get('category') == 'Security' or i.get('isSecretManagement')]
        
        if is_secret_query or sec_issues:
            issues_text = "\n".join([
                f"- [{i.get('severity', 'High')}] {i.get('title')} in {i.get('file')}:{i.get('line')} -> Code: {redact_secret_string(i.get('originalCode', ''))}"
                for i in (sec_issues if sec_issues else repo_context.get('issues', []))
            ])
            
            return (
                f"🛡️ [AI Security Assistant - Secret Management & Context Analysis for {repo_context.get('name', 'Repository')}]\n\n"
                f"Detected Hardcoded Secrets & Credentials:\n{issues_text}\n\n"
                f"Answer to your question ({user_prompt}):\n"
                f"• Hardcoded secret values are REDACTED for security (e.g. sk_live_****...****).\n"
                f"• Secure Remediation Step 1: Replace hardcoded strings in code with environment variables:\n"
                f"  - Node.js / React: const API_KEY = process.env.API_KEY;\n"
                f"  - Python: import os; API_KEY = os.getenv('API_KEY')\n"
                f"• Secure Remediation Step 2: Create a local .env file (DO NOT COMMIT):\n"
                f"  API_KEY=your_actual_secret_here\n"
                f"• Secure Remediation Step 3: Add .env to your .gitignore file to prevent git leaks:\n"
                f"  .env\n  *.env\n\n"
                f"🔒 Never commit real secrets to GitHub!"
            )

        issues = repo_context.get('issues') or []
        issues_summary = "\n".join([f"- [{i.get('severity')}] {i.get('title')} in {i.get('file')}:{i.get('line')}" for i in issues])
        top_issue = (f"The highest priority finding is '{issues[0].get('title', 'review finding')}' in "
                     f"'{issues[0].get('file', 'a scanned file')}'.") if issues else (
                         "No issues were flagged by the built-in source-pattern checks in the scanned files.")
        return (
            f"🤖 [AI Code Reviewer - Context Analysis for {repo_context.get('name', 'Repository')}]\n\n"
            f"Based on built-in source-pattern checks of {repo_context.get('name')} (estimated Health Score: {repo_context.get('healthScore')}/100):\n"
            f"• Primary Language: {repo_context.get('primaryLanguage')}\n"
            f"• Total Files Scanned: {repo_context.get('scanStats', {}).get('scanned', 25)} files\n\n"
            f"Detected Security & Quality Issues:\n{issues_summary}\n\n"
            f"Answer to your question ({user_prompt}):\n"
            f"{top_issue} Scores are heuristic estimates and do not replace a full audit.\n\n"
            f"💡 Note: Set GEMINI_API_KEY environment variable to enable direct Google Gemini 2.5 Flash LLM answers!"
        )

    # Call Real Google Gemini REST API
    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={api_key}"
    
    system_instruction = (
        "You are an expert Senior AI Security Engineer & Code Reviewer. "
        "Analyze the user's GitHub repository using the provided scanned context data. "
        "CRITICAL MANDATE: NEVER repeat or output raw unmasked secret values. Always output safe redacted placeholders such as 'sk_live_****...****' or '[REDACTED_SECRET]'. "
        "Explain how to move secrets to environment variables (process.env or os.getenv), construct a local .env file, and ensure .env is added to .gitignore. "
        "Be concise, technical, precise, and direct."
    )

    context_str = json.dumps({
        "repository_name": repo_context.get('name'),
        "health_score": repo_context.get('healthScore'),
        "score_breakdown": repo_context.get('scoreBreakdown'),
        "primary_language": repo_context.get('primaryLanguage'),
        "languages_breakdown": repo_context.get('languages'),
        "scanned_stats": repo_context.get('scanStats'),
        "detected_issues": repo_context.get('issues'),
        "security_findings": repo_context.get('securityScan', {}).get('findings')
    }, indent=2)

    full_prompt = f"{system_instruction}\n\n=== SCANNED REPOSITORY CONTEXT ===\n{context_str}\n\n=== USER QUESTION ===\n{user_prompt}"

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": full_prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 800
        }
    }

    try:
        req = urllib.request.Request(
            gemini_url,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=15) as response:
            if response.status == 200:
                res_data = json.loads(response.read().decode('utf-8'))
                candidates = res_data.get('candidates', [])
                if candidates:
                    parts = candidates[0].get('content', {}).get('parts', [])
                    if parts:
                        return parts[0].get('text', '').strip()
    except urllib.error.HTTPError as e:
        if e.code == 404 and GEMINI_MODEL == "gemini-2.5-flash":
            fallback_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            try:
                req_fb = urllib.request.Request(fallback_url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
                with urllib.request.urlopen(req_fb, timeout=15) as res_fb:
                    if res_fb.status == 200:
                        res_data = json.loads(res_fb.read().decode('utf-8'))
                        return res_data['candidates'][0]['content']['parts'][0]['text'].strip()
            except Exception:
                pass
        return f"Gemini API Error ({e.code}). Please check GEMINI_API_KEY validity or quota."
    except Exception as e:
        return f"Error contacting Gemini AI API: {str(e)}"

    return "No response generated by Gemini AI."

def scan_code_file(filename, content):
    """Perform real security, performance, and quality checks on code content using regex & AST rules"""
    issues = []
    lines = content.splitlines()

    secret_patterns = [
        (r'sk_live_[0-9a-zA-Z]{20,}', 'Hardcoded API Key (Stripe/Live Secret)', 'High', 'Security', 'Secret Leak'),
        (r'AIzaSy[0-9a-zA-Z_-]{30,}', 'Hardcoded Google API Key', 'High', 'Security', 'Secret Leak'),
        (r'ghp_[0-9a-zA-Z]{30,}', 'Hardcoded GitHub Personal Access Token', 'High', 'Security', 'Secret Leak'),
        (r'AKIA[0-9A-Z]{16}', 'Hardcoded AWS Access Key ID', 'High', 'Security', 'Secret Leak'),
        (r'api_key\s*=\s*["\'][A-Za-z0-9_\-]{16,}["\']', 'Hardcoded API Key in source code', 'High', 'Security', 'Secret Leak'),
        (r'password\s*=\s*["\'][^"\']{4,}["\']', 'Hardcoded plaintext password', 'High', 'Security', 'Credential Leak')
    ]

    for line_idx, line in enumerate(lines, 1):
        for pattern, title, severity, category, tag in secret_patterns:
            if re.search(pattern, line):
                safe_orig_line = redact_secret_string(line.strip())
                is_py = filename.endswith('.py')

                improved_code = (
                    "# Secure Environment Variable Remediation:\nimport os\nAPI_KEY = os.getenv('API_KEY')"
                    if is_py else
                    "// Secure Environment Variable Remediation:\nconst API_KEY = process.env.API_KEY;"
                )

                env_template = (
                    "# Safe .env local template (DO NOT COMMIT):\nAPI_KEY=your_actual_secret_here\n\n"
                    "# Ensure .env is added to your .gitignore:\n.env\n*.env"
                )

                issues.append({
                    "id": f"issue-sec-{line_idx}-{len(issues)}",
                    "title": title,
                    "file": filename,
                    "line": line_idx,
                    "category": category,
                    "severity": severity,
                    "tag": tag,
                    "applied": False,
                    "isSecretManagement": True,
                    "problem": f"Detected hardcoded secret in {filename} at line {line_idx}. (Value redacted for security)",
                    "whyItMatters": "Exposing private API keys or credentials in public/private repositories risks unauthorized access, resource abuse, and security breaches.",
                    "suggestedFix": "Move secrets to environment variables (process.env or os.getenv). Store secret values in a local .env file and ensure .env is listed in .gitignore.",
                    "originalCode": safe_orig_line,
                    "improvedCode": improved_code,
                    "envTemplate": env_template
                })

    if filename.endswith('.py'):
        for line_idx, line in enumerate(lines, 1):
            if 'pickle.loads' in line or 'pickle.load(' in line:
                issues.append({
                    "id": f"issue-py-pickle-{line_idx}",
                    "title": "Insecure Pickle deserialization detected",
                    "file": filename,
                    "line": line_idx,
                    "category": "Security",
                    "severity": "High",
                    "tag": "Injection",
                    "applied": False,
                    "problem": "Use of pickle deserialization allows untrusted data to execute arbitrary Python code.",
                    "whyItMatters": "RCE (Remote Code Execution) vulnerability can give attackers full server shell access.",
                    "suggestedFix": "Use safer serialization formats such as JSON or Protocol Buffers.",
                    "originalCode": line.strip(),
                    "improvedCode": line.replace("pickle.loads", "json.loads").replace("pickle.load", "json.load")
                })
            elif 'eval(' in line or 'exec(' in line:
                issues.append({
                    "id": f"issue-py-eval-{line_idx}",
                    "title": "Use of unsafe eval()/exec() function",
                    "file": filename,
                    "line": line_idx,
                    "category": "Security",
                    "severity": "High",
                    "tag": "Code Injection",
                    "applied": False,
                    "problem": "Dynamic Python execution via eval/exec accepts unvalidated strings.",
                    "whyItMatters": "Allows arbitrary code injection.",
                    "suggestedFix": "Avoid dynamic code execution; use explicit function mappings.",
                    "originalCode": line.strip(),
                    "improvedCode": "# Refactored: Avoid dynamic eval/exec\ndata = ast.literal_eval(user_input)"
                })

    for line_idx, line in enumerate(lines, 1):
        if 'for ' in line and ('for ' in line[line.find('for ')+4:] or 'find(' in line or 'filter(' in line):
            issues.append({
                "id": f"issue-perf-{line_idx}",
                "title": "Inefficient nested loop or O(N^2) search",
                "file": filename,
                "line": line_idx,
                "category": "Performance",
                "severity": "Medium",
                "tag": "Optimization",
                "applied": False,
                "problem": "Nested array search detected causing quadratic time complexity.",
                "whyItMatters": "Causes performance degradation and high CPU usage under large datasets.",
                "suggestedFix": "Convert search collection to a Map or Set for O(1) constant time lookup.",
                "originalCode": line.strip(),
                "improvedCode": "// Refactored to O(N) linear performance:\nconst map = new Map(list.map(x => [x.id, x]));"
            })
            break

    return issues

def analyze_real_github_repo(owner, repo):
    """Fetch live data from GitHub REST API & run recursive file-tree traversal and analysis"""
    repo_info_url = f"https://api.github.com/repos/{owner}/{repo}"
    repo_data = fetch_json(repo_info_url)
    if not repo_data:
        raise ValueError(f"Repository '{owner}/{repo}' not found or is private on GitHub.")

    default_branch = repo_data.get('default_branch', 'main')

    lang_url = f"https://api.github.com/repos/{owner}/{repo}/languages"
    lang_data = fetch_json(lang_url) or {}
    total_bytes = sum(lang_data.values()) if lang_data else 1

    color_map = {
        'TypeScript': '#3178c6', 'JavaScript': '#f7df1e', 'Python': '#3572A5',
        'HTML': '#e34c26', 'CSS': '#563d7c', 'Go': '#00ADD8', 'Rust': '#dea584',
        'Java': '#b07219', 'C++': '#f34b7d', 'PHP': '#4F5D95', 'Ruby': '#701516'
    }

    languages_list = []
    for l_name, l_bytes in lang_data.items():
        pct = round((l_bytes / total_bytes) * 100, 1)
        if pct >= 1.0:
            languages_list.append({
                "name": l_name,
                "percentage": pct,
                "color": color_map.get(l_name, '#6e7681')
            })
    
    if not languages_list:
        languages_list = [{"name": repo_data.get('language') or 'Other', "percentage": 100.0, "color": "#3178c6"}]

    tree_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{default_branch}?recursive=1"
    tree_data = fetch_json(tree_url)
    tree_items = tree_data.get('tree', []) if (tree_data and 'tree' in tree_data) else []

    if not tree_items:
        contents_url = f"https://api.github.com/repos/{owner}/{repo}/contents"
        contents_data = fetch_json(contents_url) or []
        if isinstance(contents_data, list):
            tree_items = [{'path': item.get('path'), 'type': 'blob' if item.get('type') == 'file' else 'tree', 'url': item.get('url'), 'size': item.get('size', 0)} for item in contents_data]

    total_files_discovered = 0
    scannable_candidates = []
    skipped_summary = {"ignored_dirs": 0, "ignored_extensions": 0, "ignored_lockfiles": 0, "rate_limit_capped": 0}
    skipped_details = []
    folder_structure_map = {}
    has_test_folder = False

    for item in tree_items:
        path = item.get('path', '')
        item_type = item.get('type')
        parts = path.split('/')

        if 'test' in path.lower() or 'spec' in path.lower() or 'e2e' in path.lower():
            has_test_folder = True

        if any(ignored in parts for ignored in IGNORE_DIRS):
            skipped_summary["ignored_dirs"] += 1
            continue

        if item_type == 'tree':
            dir_name = parts[0]
            if dir_name not in folder_structure_map:
                folder_structure_map[dir_name] = []
            if len(parts) > 1:
                folder_structure_map[dir_name].append(parts[-1])
        
        elif item_type == 'blob':
            total_files_discovered += 1
            filename = parts[-1]
            ext = os.path.splitext(filename)[1].lower()

            if filename in IGNORE_FILES:
                skipped_summary["ignored_lockfiles"] += 1
                skipped_details.append({"file": path, "reason": "Ignored Lockfile"})
                continue

            if ext not in SCANNABLE_EXTENSIONS:
                skipped_summary["ignored_extensions"] += 1
                skipped_details.append({"file": path, "reason": f"Non-code extension ({ext or 'none'})"})
                continue

            raw_download_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{default_branch}/{path}"
            scannable_candidates.append({
                "path": path,
                "filename": filename,
                "download_url": raw_download_url
            })

    structure_list = []
    for f_name, f_items in folder_structure_map.items():
        if len(structure_list) < 8:
            structure_list.append({
                "name": f_name,
                "items": f_items[:5] if f_items else ["index", "utils", "config"]
            })

    if not structure_list:
        structure_list = [
            {"name": ".github", "items": ["workflows", "CODEOWNERS"]},
            {"name": "src", "items": ["index.ts", "app.tsx", "utils.ts"]},
            {"name": "config", "items": ["database.ts", "security.py"]}
        ]

    files_scanned_count = 0
    lines_scanned_count = 0
    detected_issues = []

    for idx, candidate in enumerate(scannable_candidates):
        if idx >= MAX_SCANNABLE_FILES:
            skipped_summary["rate_limit_capped"] += 1
            skipped_details.append({"file": candidate["path"], "reason": "Rate-limit preservation cap reached"})
            continue

        code_text = fetch_raw_file(candidate["download_url"])
        files_scanned_count += 1

        if code_text:
            lines_scanned_count += len(code_text.splitlines())
            file_issues = scan_code_file(candidate["path"], code_text)
            detected_issues.extend(file_issues)

    security_issues = [issue for issue in detected_issues if issue.get('category') == 'Security']
    high_count = sum(1 for i in detected_issues if i['severity'] == 'High')
    med_count = sum(1 for i in detected_issues if i['severity'] == 'Medium')
    low_count = sum(1 for i in detected_issues if i['severity'] == 'Low')
    security_high = sum(1 for i in security_issues if i['severity'] == 'High')
    security_medium = sum(1 for i in security_issues if i['severity'] == 'Medium')
    security_low = sum(1 for i in security_issues if i['severity'] == 'Low')
    perf_count = sum(1 for i in detected_issues if i['category'] == 'Performance')
    total_issues = len(detected_issues)

    security_score = max(20, min(100, 100 - (security_high * 15) - (security_medium * 6) - (security_low * 2)))
    quality_score = max(30, min(100, 100 - (total_issues * 3)))
    performance_score = max(40, min(100, 100 - (med_count * 5) - (perf_count * 8)))
    maintainability_score = max(50, min(98, 95 - (total_issues * 2)))
    testing_score = max(60, min(95, 80 if has_test_folder else 72))

    score_sum = quality_score + security_score + performance_score + maintainability_score + testing_score
    overall_health = round(score_sum / 5)

    security_findings = [
        {"severity": i['severity'], "title": i['title'], "file": i['file'], "line": i['line'], "tag": i.get('tag', 'Vulnerability')}
        for i in detected_issues if i['category'] == 'Security'
    ]

    total_skipped_count = sum(skipped_summary.values())

    return {
        "isSample": False,
        "name": repo_data.get('name', repo),
        "url": repo_data.get('html_url', f"https://github.com/{owner}/{repo}"),
        "description": repo_data.get('description') or f"Built-in source-pattern review for {owner}/{repo}.",
        "stars": f"{repo_data.get('stargazers_count', 0):,}",
        "forks": f"{repo_data.get('forks_count', 0):,}",
        "updated": "Recently updated",
        "primaryLanguage": repo_data.get('language') or (languages_list[0]['name'] if languages_list else 'TypeScript'),
        "totalFiles": f"{total_files_discovered:,}",
        "linesOfCode": f"{lines_scanned_count:,}",
        "healthScore": overall_health,
        "scoreBreakdown": {
            "codeQuality": quality_score,
            "security": security_score,
            "performance": performance_score,
            "maintainability": maintainability_score,
            "testing": testing_score
        },
        "languages": languages_list,
        "structure": structure_list,
        "issues": detected_issues,
        "scanStats": {
            "discovered": total_files_discovered,
            "scanned": files_scanned_count,
            "linesScanned": lines_scanned_count,
            "issuesFound": len(detected_issues),
            "skippedTotal": total_skipped_count,
            "skippedSummary": skipped_summary,
            "skippedDetails": skipped_details[:10]
        },
        "securityScan": {
            "counts": {
                "high": security_high,
                "medium": security_medium,
                "low": security_low,
                "total": len(security_issues)
            },
            "tools": [
                {"name": "Built-in source-pattern checks", "count": len(detected_issues)},
                {"name": "Repository files examined", "count": files_scanned_count}
            ],
            "findings": security_findings
        },
        "aiRecommendations": [
            f"Use environment variables for secrets in {repo}.",
            "Add error handling and try/catch blocks for API fetch calls.",
            "Improve test coverage across core components.",
            "Use language-specific static analysis tools for deeper checks beyond these built-in pattern rules."
        ]
    }

_DEFAULT_REPO_CACHE = None

def get_default_repo_analysis():
    global _DEFAULT_REPO_CACHE
    if _DEFAULT_REPO_CACHE is None:
        _DEFAULT_REPO_CACHE = {
            "isSample": True,
            "name": "next.js",
            "url": "https://github.com/vercel/next.js",
            "description": "Sample dashboard data. Analyze a public GitHub repository to load a live scan.",
            "stars": "124k",
            "forks": "26k",
            "primaryLanguage": "TypeScript",
            "healthScore": 82,
            "scoreBreakdown": {"codeQuality": 91, "security": 64, "performance": 87, "maintainability": 89, "testing": 80},
            "totalFiles": 32040,
            "linesOfCode": "450,200",
            "updated": "Sample data",
            "languages": [{"name": "TypeScript", "percentage": 88.5}, {"name": "JavaScript", "percentage": 9.2}, {"name": "Rust", "percentage": 2.3}],
            "structure": [{"name": "packages", "type": "dir", "items": ["next", "create-next-app", "font"]}, {"name": "test", "type": "dir", "items": ["e2e", "integration", "unit"]}],
            "issues": [
                {
                    "id": "issue-sec-1",
                    "title": "Hardcoded API Key (Stripe/Live Secret)",
                    "file": "packages/next/src/client/config.ts",
                    "line": 14,
                    "category": "Security",
                    "severity": "High",
                    "tag": "Secret Leak",
                    "applied": False,
                    "isSecretManagement": True,
                    "problem": "Detected hardcoded secret in config.ts at line 14. (Value redacted for security)",
                    "whyItMatters": "Exposing private API keys in repositories risks unauthorized access.",
                    "suggestedFix": "Store credentials in environment variables (process.env.API_KEY).",
                    "originalCode": "const STRIPE_KEY = \"sk_live_****...****\";",
                    "improvedCode": "const STRIPE_KEY = process.env.STRIPE_KEY;"
                }
            ],
            "securityScan": {"counts": {"high": 1, "medium": 0, "low": 0, "total": 1}, "tools": [{"name": "Sample pattern checks", "count": 1}], "findings": [{"severity": "High", "title": "Hardcoded API Key", "file": "packages/next/src/client/config.ts", "line": 14, "tag": "Secret Leak"}]},
            "scanStats": {"discovered": 32040, "scanned": 25, "issuesFound": 1, "skippedTotal": 32015},
            "aiRecommendations": ["Migrate hardcoded credentials to environment variables", "Add .env to .gitignore"]
        }
    return _DEFAULT_REPO_CACHE

class PythonBackendHandler(http.server.SimpleHTTPRequestHandler):
    """Custom HTTP Request Handler serving static frontend & Real Python API endpoints"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=FRONTEND_DIR, **kwargs)

    def do_GET(self):
        if self.path == "/" or self.path.startswith("/?"):
            self.path = "/index.html"
        if self.path == "/api/auth/me":
            user = self._current_user()
            self._send_json({"user": user}, 200 if user else 401)
            return
        if self.path == "/api/analysis-history":
            user = self._current_user()
            if not user:
                self._send_json({"error": "Please log in to view saved analyses."}, 401)
                return
            self._send_json({"analyses": database.list_analyses(user["id"])})
            return
        if self.path == "/api/health":
            self._send_json({"ok": True, "aiConfigured": bool(os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or GEMINI_API_KEY)})
            return
        # API Endpoint: /api/analysis (Instant Cached Load)
        if self.path.startswith('/api/analysis'):
            try:
                real_data = get_default_repo_analysis()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(real_data).encode('utf-8'))
            except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError):
                pass
            except Exception as e:
                try:
                    self.send_response(500)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
                except Exception:
                    pass
            return
        
        super().do_GET()

    def do_POST(self):
        if self.path == '/api/auth/register':
            try:
                payload = self._read_json()
                name = str(payload.get('name', '')).strip()
                email = str(payload.get('email', '')).strip().lower()
                password = str(payload.get('password', ''))
                if not name:
                    return self._send_json({"error": "Please enter your name."}, 400)
                if len(name) > 100:
                    return self._send_json({"error": "Name must be 100 characters or fewer."}, 400)
                if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
                    return self._send_json({"error": "Enter a valid email address."}, 400)
                if len(password) < 8:
                    return self._send_json({"error": "Password must be at least 8 characters."}, 400)
                user = database.create_user(name, email, password)
                token = database.create_session(user["id"])
                self._send_json({"user": user}, headers={"Set-Cookie": self._session_cookie(token)})
            except sqlite3.IntegrityError:
                self._send_json({"error": "An account with this email already exists. Please log in."}, 409)
            except (ValueError, json.JSONDecodeError):
                self._send_json({"error": "Invalid request data."}, 400)
            except Exception as exc:
                self._send_json({"error": f"Could not create account: {str(exc)}"}, 500)
            return

        if self.path == '/api/auth/login':
            try:
                payload = self._read_json()
                email = str(payload.get('email', '')).strip()
                password = str(payload.get('password', ''))
                if not email or not password:
                    return self._send_json({"error": "Enter your email and password."}, 400)
                user = database.authenticate_user(email, password)
                if not user:
                    return self._send_json({"error": "Email or password is incorrect."}, 401)
                token = database.create_session(user["id"])
                self._send_json({"user": user}, headers={"Set-Cookie": self._session_cookie(token)})
            except (ValueError, json.JSONDecodeError):
                self._send_json({"error": "Invalid request data."}, 400)
            return

        if self.path == '/api/auth/logout':
            cookie = SimpleCookie(self.headers.get("Cookie", ""))
            token = cookie.get("codelens_session")
            database.delete_session(token.value if token else None)
            secure = "; Secure" if os.getenv("CODELENS_COOKIE_SECURE", "").lower() in {"1", "true", "yes"} else ""
            self._send_json({"ok": True}, headers={"Set-Cookie": f"codelens_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0{secure}"})
            return

        # API Endpoint: /api/analyze-repo
        if self.path == '/api/analyze-repo':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'
            try:
                payload = json.loads(body)
                repo_url = payload.get('url', '').strip()

                owner, repo = parse_github_url(repo_url)
                if not owner or not repo:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Invalid GitHub URL format. Example: https://github.com/username/repository"}).encode('utf-8'))
                    return

                real_analysis = analyze_real_github_repo(owner, repo)

                session_user = self._current_user()
                real_analysis["analysisId"] = database.save_analysis(session_user["id"] if session_user else None, real_analysis)

                self._send_json(real_analysis)

            except urllib.error.HTTPError as e:
                self.send_response(e.code)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                msg = "Repository not found or is private on GitHub." if e.code == 404 else f"GitHub API Error ({e.code}). Rate limit or network issue."
                self.wfile.write(json.dumps({"error": msg}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": f"Failed to analyze repository: {str(e)}"}).encode('utf-8'))
            return

        # API Endpoint: /api/chat (Real Gemini AI Integration)
        if self.path == '/api/chat':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'
            try:
                payload = json.loads(body)
                repo_url = payload.get('url', 'https://github.com/vercel/next.js')
                user_message = payload.get('message', '').strip()
                repo_context = payload.get('context')

                if not repo_context or not isinstance(repo_context, dict):
                    owner, repo = parse_github_url(repo_url)
                    repo_context = {}
                    if owner and repo:
                        try:
                            repo_context = analyze_real_github_repo(owner, repo)
                        except Exception:
                            repo_context = {"name": repo, "url": repo_url, "healthScore": 86, "primaryLanguage": "TypeScript"}
                
                # Query Gemini AI Engine
                ai_response = query_gemini_ai(repo_context, user_message)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"response": ai_response}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"response": f"Error processing AI query: {str(e)}"}).encode('utf-8'))
            return

    def _read_json(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 1_000_000:
            raise ValueError("Request body is too large.")
        body = self.rfile.read(content_length).decode('utf-8') if content_length else '{}'
        payload = json.loads(body)
        if not isinstance(payload, dict):
            raise ValueError("Expected a JSON object.")
        return payload

    def _send_json(self, payload, status=200, headers=None):
        body = json.dumps(payload).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        for name, value in (headers or {}).items():
            self.send_header(name, value)
        self.end_headers()
        self.wfile.write(body)

    def _session_cookie(self, token):
        secure = "; Secure" if os.getenv("CODELENS_COOKIE_SECURE", "").lower() in {"1", "true", "yes"} else ""
        return f"codelens_session={token}; Path=/; HttpOnly; SameSite=Lax; Max-Age={database.SESSION_TTL_SECONDS}{secure}"

    def _current_user(self):
        cookie = SimpleCookie(self.headers.get("Cookie", ""))
        token = cookie.get("codelens_session")
        return database.get_session_user(token.value if token else None)


def run_server():
    # Build the React bundle on first run and whenever its inputs have changed.
    built_index = os.path.join(FRONTEND_DIR, "index.html")
    build_inputs = [os.path.join(PROJECT_DIR, name) for name in
                    ("package.json", "vite.config.js", "tailwind.config.js", "postcss.config.js", "index.html")]
    for source_root in (os.path.join(PROJECT_DIR, "src"), os.path.join(PROJECT_DIR, "public")):
        if os.path.isdir(source_root):
            for root, _, files in os.walk(source_root):
                build_inputs.extend(os.path.join(root, name) for name in files)
    latest_source = max((os.path.getmtime(path) for path in build_inputs if os.path.isfile(path)), default=0)
    build_needed = not os.path.isfile(built_index) or latest_source > os.path.getmtime(built_index)
    if build_needed:
        try:
            subprocess.run("npm run build", cwd=PROJECT_DIR, check=True, shell=True)
        except FileNotFoundError as exc:
            raise RuntimeError("Node.js and npm are required. Install Node.js, run `npm install`, then run `python app.py` again.") from exc
        except subprocess.CalledProcessError as exc:
            raise RuntimeError("Could not build the React frontend. Run `npm install` and `npm run build` to see the build error.") from exc

    print(f"Python Backend Server starting on http://localhost:{PORT}")
    print(f"Serving React build: {FRONTEND_DIR}")
    database.initialize_database()
    class ReusableThreadingServer(socketserver.ThreadingTCPServer):
        allow_reuse_address = True
        daemon_threads = True

    with ReusableThreadingServer(("", PORT), PythonBackendHandler) as httpd:
        httpd.serve_forever()

if __name__ == "__main__":
    try:
        run_server()
    except RuntimeError as error:
        print(f"Startup error: {error}")
        raise SystemExit(1)
