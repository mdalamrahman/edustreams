# SDETube / EduStream — Deployment Strategy & Verification Runbook

This document defines the complete end-to-end deployment workflow for SDETube:
1. **Backend Deployment to GitHub** (triggering automated Render builds).
2. **Frontend Deployment to Cloudflare Pages via Wrangler CLI**.
3. **Backend Verification & Health Checks via Render CLI and API**.

---

## 1. System Architecture Overview

| Component | Platform / Host | Technology Stack | Location / URL |
| :--- | :--- | :--- | :--- |
| **Monorepo** | GitHub | Git | [`github.com/mdalamrahman/edustreams`](https://github.com/mdalamrahman/edustreams) |
| **Frontend** | Cloudflare Pages | React 18, Vite, TypeScript, Tailwind | [https://sdetube.pages.dev](https://sdetube.pages.dev) |
| **Core Backend** | Render Web Service | Python 3.11, FastAPI, Uvicorn, SQLite/R2 | [https://edustream-backend-90vm.onrender.com](https://edustream-backend-90vm.onrender.com) |
| **Serverless API** | Vercel / Pages Proxy | Node.js Serverless Functions | `api/leetcode/*`, `api/potd/*` |
| **Admin Portal** | Vercel | React 18, Vite, TypeScript | Admin workspace in `admin-portal/` |

---

## 2. Deploying Backend Code to GitHub

The backend resides in the `backend/` and `api/` directories of the repository. Render monitors the `main` branch of `https://github.com/mdalamrahman/edustreams` and automatically triggers a build whenever changes are pushed.

### Step-by-Step Push Workflow

1. **Verify git status:**
   ```powershell
   git status
   ```

2. **Stage modified and newly created backend/frontend files:**
   ```powershell
   git add -A
   ```

3. **Commit with a conventional commit message:**
   ```powershell
   git commit -m "feat(backend): add your feature description"
   ```

4. **Push to GitHub `main`:**
   ```powershell
   git push origin main
   ```

> [!NOTE]
> Render automatically detects commits to the `main` branch. If the commit affects files in `backend/`, Render kicks off an automatic build using:
> - **Build Command:** `pip install -U pip && pip install -r requirements.txt`
> - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## 3. Deploying Frontend to Cloudflare Pages (Wrangler CLI)

The student frontend is hosted on Cloudflare Pages under the project name **`sdetube`**.

### Standard Deployment Command (Recommended)

Run the preconfigured deployment script from the project root:

```powershell
npm run deploy:student
```

This single command automatically performs the full 3-step pipeline:
1. `tsc` — Performs complete TypeScript compilation and type-safety verification.
2. `vite build` — Produces the minified production client bundle in `dist/`.
3. `python scripts/copy_dist_assets.py` — Copies large data files (such as `company_problems.json`) into `dist/data/`.
4. `npx wrangler pages deploy dist --project-name sdetube --branch main --commit-dirty=true` — Uploads and deploys the assets to Cloudflare Pages.

### Manual Two-Step Deployment

If you prefer building and deploying separately:

```powershell
# Step A: Build production bundle
npm run build:student

# Step B: Deploy build folder using Wrangler
npx wrangler pages deploy dist --project-name sdetube --branch main --commit-dirty=true
```

### Deployment Verification
- **Production URL:** [https://sdetube.pages.dev](https://sdetube.pages.dev)
- **Direct Preview URL:** Printed in the terminal output at completion (e.g., `https://<hash>.sdetube.pages.dev`).

---

## 4. Backend Verification Using Render CLI & Render API

Render provides both a CLI tool (`render-cli`) and a REST API (`api.render.com/v1`) for inspecting services, environment variables, and deployment status.

### Authentication Setup

Set your Render API token in your current terminal session:

```powershell
# PowerShell
$env:RENDER_TOKEN = "rnd_a3YkUrijIg5fDNtAPObhmpTD0qfY"

# Bash / Zsh
export RENDER_TOKEN="rnd_a3YkUrijIg5fDNtAPObhmpTD0qfY"
```

*(Token is also stored in `~/.render/cli.yaml` for persistent CLI access).*

### Render CLI Commands

#### 1. List All Registered Services
```powershell
render-cli list
```
*Outputs a table showing Service Name, Service ID, and Live URL.*

#### 2. Find the EduStream Backend Service
```powershell
render-cli find-service -sn edustream-backend
```
- **Service Name:** `edustream-backend`
- **Service ID:** `srv-d9nn8qm417fc73doitrg`
- **Live URL:** `https://edustream-backend-90vm.onrender.com`

#### 3. Inspect Service Environment Variables
```powershell
render-cli list-env -sn edustream-backend
```
*Displays all active environment variables (e.g. `PYTHON_VERSION`, `MISTRAL_API_KEY`, `TELEGRAM_*`, etc.).*

#### 4. Update an Environment Variable
```powershell
render-cli set-env -sid srv-d9nn8qm417fc73doitrg -k NEW_VAR_KEY -v NEW_VAR_VALUE
```

---

## 5. Deployment Verification & Live Health Checks

### Check Latest Deployment Status on Render

Query the Render API to verify if the latest deployment succeeded (`live`):

```powershell
python -c "import urllib.request, json, os; token = os.getenv('RENDER_TOKEN', 'rnd_a3YkUrijIg5fDNtAPObhmpTD0qfY'); req = urllib.request.Request('https://api.render.com/v1/services/srv-d9nn8qm417fc73doitrg/deploys?limit=1', headers={'Authorization': 'Bearer ' + token}); res = urllib.request.urlopen(req); d = json.loads(res.read())[0]['deploy']; print(f'Deploy ID: {d[\"id\"]}\nStatus: {d[\"status\"]}\nCommit: {d[\"commit\"][\"id\"][:8]} - {d[\"commit\"][\"message\"]}')"
```

Expected output:
```text
Deploy ID: dep-xxxxxxxxxxxxxxxx
Status: live
Commit: xxxxxxxx - feat: ...
```

### Trigger a Manual Deploy via Render API

If you need to force an immediate redeployment without a new git commit:

```powershell
python -c "import urllib.request, os; token = os.getenv('RENDER_TOKEN', 'rnd_a3YkUrijIg5fDNtAPObhmpTD0qfY'); req = urllib.request.Request('https://api.render.com/v1/services/srv-d9nn8qm417fc73doitrg/deploys', headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'}, data=b'{}', method='POST'); res = urllib.request.urlopen(req); print('Triggered Deploy HTTP Status:', res.status)"
```

### Verify Live HTTP Endpoints (Health Check)

Ping the FastAPI documentation and API health routes:

```powershell
# 1. Check Swagger OpenAPI documentation (Returns HTTP 200)
curl -I https://edustream-backend-90vm.onrender.com/docs

# 2. Check POTD serverless proxy route
curl -I https://sdetube.pages.dev/api/potd/leetcode
```

---

## 6. Release Checklist / Runbook

```markdown
- [ ] 1. Run local type-check: `npx tsc --noEmit`
- [ ] 2. Stage & commit changes: `git add -A && git commit -m "..."`
- [ ] 3. Push to GitHub: `git push origin main`
- [ ] 4. Deploy frontend via Wrangler: `npm run deploy:student`
- [ ] 5. Set Render token: `$env:RENDER_TOKEN = "rnd_a3YkUrijIg5fDNtAPObhmpTD0qfY"`
- [ ] 6. Verify service in Render CLI: `render-cli find-service -sn edustream-backend`
- [ ] 7. Confirm deployment status: Verify Render deploy status is `live`
- [ ] 8. Verify live site: Visit https://sdetube.pages.dev
```
