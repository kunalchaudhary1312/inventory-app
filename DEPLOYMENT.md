# Inventory App — Windows Deployment Guide

Step-by-step commands to run locally with Docker, push to GitHub & Docker Hub, and deploy to production.

---

## What you will deploy

| Service   | Local (Docker)        | Production              |
|-----------|-----------------------|-------------------------|
| Database  | PostgreSQL container  | Supabase (free)         |
| Backend   | http://localhost:8000 | Render.com (free)       |
| Frontend  | http://localhost:3001 | Vercel (free)           |
| Code      | —                     | GitHub                  |
| Docker image | —                  | Docker Hub              |

---

## PART 1 — Install prerequisites (Windows)

### 1.1 Install Git
```powershell
winget install --id Git.Git -e --source winget
git --version
```

### 1.2 Install Docker Desktop
1. Download: https://www.docker.com/products/docker-desktop/
2. Install and **open Docker Desktop**
3. Wait until it says **"Docker Desktop is running"**
4. Verify:
```powershell
docker --version
docker compose version
```

### 1.3 Install Node.js (optional — only for manual frontend dev)
Download LTS from https://nodejs.org or:
```powershell
winget install OpenJS.NodeJS.LTS
node --version
npm --version
```

### 1.4 Install Python (optional — only for manual backend dev)
Download from https://www.python.org/downloads/ or:
```powershell
winget install Python.Python.3.11
python --version
pip --version
```

---

## PART 2 — Run locally with Docker

### 2.1 Open project folder
```powershell
cd C:\path\to\inventory-app
```

> Replace `C:\path\to\inventory-app` with your actual folder path.

### 2.2 Create environment files
```powershell
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Default values work with Docker — no edits needed for local run.

### 2.3 Start all services
```powershell
docker compose up --build
```

First run takes 3–5 minutes (downloads images + builds).

**Run in background (optional):**
```powershell
docker compose up --build -d
```

### 2.4 Open in browser

| URL | What |
|-----|------|
| http://localhost:3001 | Frontend (React app) |
| http://localhost:8000 | Backend API |
| http://localhost:8000/docs | Swagger API docs |
| http://localhost:8000/health | Health check |

> Frontend uses port **3001** (not 3000) to avoid conflicts with other apps like Grafana.

### 2.5 Verify with curl (PowerShell)
```powershell
curl http://localhost:8000/health
```
Expected: `{"status":"healthy"}`

### 2.6 Useful Docker commands
```powershell
# Check running containers
docker compose ps

# View logs
docker compose logs -f
docker compose logs -f backend

# Stop all services
docker compose down

# Stop and delete database data (fresh start)
docker compose down -v

# Rebuild after code changes
docker compose up --build
```

---

## PART 3 — Push code to GitHub

### 3.1 Create GitHub account & repo
1. Go to https://github.com → Sign up / Log in
2. Click **New Repository**
3. Name: `inventory-app`
4. Keep it **Public**
5. Do **NOT** add README, .gitignore, or license
6. Click **Create repository**
7. Copy the repo URL: `https://github.com/YOUR_USERNAME/inventory-app.git`

### 3.2 Initialize git and push
```powershell
cd C:\path\to\inventory-app

git init
git add .
git commit -m "feat: Initial commit - Inventory & Order Management System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/inventory-app.git
git push -u origin main
```

> Replace `YOUR_USERNAME` with your GitHub username.

**Submission link #1:** `https://github.com/YOUR_USERNAME/inventory-app`

### 3.3 Push future changes
```powershell
git add .
git commit -m "fix: describe your change"
git push
```

---

## PART 4 — Push backend image to Docker Hub

### 4.1 Create Docker Hub account
1. Go to https://hub.docker.com → Sign up
2. Remember your username (e.g. `johndoe`)

### 4.2 Build and push
```powershell
cd C:\path\to\inventory-app

docker login
docker build -t YOUR_DOCKERHUB_USERNAME/inventory-backend:latest ./backend
docker push YOUR_DOCKERHUB_USERNAME/inventory-backend:latest
```

Example:
```powershell
docker build -t johndoe/inventory-backend:latest ./backend
docker push johndoe/inventory-backend:latest
```

**Submission link #2:** `https://hub.docker.com/r/YOUR_DOCKERHUB_USERNAME/inventory-backend`

---

## PART 5 — Deploy to production

### 5.1 Database — Supabase (free PostgreSQL)

1. Go to https://supabase.com → Sign up
2. **New Project** → pick region → set DB password (save it!)
3. Wait for project to finish setting up
4. Go to **Settings → Database → Connection string**
5. Select **URI** tab
6. Copy the connection string:
   ```
   postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
7. Replace `[YOUR-PASSWORD]` with your actual password

Save this as your production `DATABASE_URL`.

---

### 5.2 Backend — Render.com (free)

1. Go to https://render.com → Sign up with **GitHub**
2. Click **New +** → **Web Service**
3. Connect your `inventory-app` GitHub repo
4. Configure:

| Setting | Value |
|---------|-------|
| Name | `inventory-backend` |
| Region | closest to you |
| Branch | `main` |
| Root Directory | `backend` |
| Runtime | **Docker** |
| Instance Type | **Free** |
| Build Command | *(leave empty)* |
| Start Command | *(leave empty)* |

5. **Environment Variables** → Add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | your Supabase connection string |

6. Click **Create Web Service**
7. Wait 2–5 minutes for deploy to finish
8. Copy your URL: `https://inventory-backend-xxxx.onrender.com`

**Test:**
```powershell
curl https://inventory-backend-xxxx.onrender.com/health
```
Expected: `{"status":"healthy"}`

**Submission link #4:** `https://inventory-backend-xxxx.onrender.com`

> **Note:** Render free tier sleeps after 15 min idle. First request after sleep takes ~30–60 seconds.

---

### 5.3 Frontend — Vercel (free)

1. Go to https://vercel.com → Sign up with **GitHub**
2. Click **New Project**
3. Import your `inventory-app` repo
4. Configure:

| Setting | Value |
|---------|-------|
| Framework Preset | Create React App |
| Root Directory | `frontend` |

5. **Environment Variables** → Add:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://inventory-backend-xxxx.onrender.com/api` |

> Use your actual Render URL from step 5.2. Must end with `/api`.

6. Click **Deploy**
7. Wait 1–2 minutes
8. Copy your URL: `https://inventory-app-xxxx.vercel.app`

**Submission link #3:** `https://inventory-app-xxxx.vercel.app`

---

## PART 6 — Test production

Open your Vercel URL and verify:

1. Dashboard loads
2. Create a **Product** (SKU, name, price, stock)
3. Create a **Customer** (name, email)
4. Create an **Order** (select customer + products)
5. Check stock reduced after order

**Test API directly:**
```powershell
# Health
curl https://inventory-backend-xxxx.onrender.com/health

# Create product
curl -X POST https://inventory-backend-xxxx.onrender.com/api/products/ `
  -H "Content-Type: application/json" `
  -d '{\"sku\": \"PROD-001\", \"name\": \"Laptop\", \"price\": 999.99, \"stock\": 50}'
```

---

## PART 7 — Final submission checklist

| # | What to submit | Example |
|---|----------------|---------|
| 1 | GitHub Repository | `https://github.com/yourusername/inventory-app` |
| 2 | Docker Hub Image | `https://hub.docker.com/r/yourusername/inventory-backend` |
| 3 | Frontend URL (Vercel) | `https://inventory-app-xxxx.vercel.app` |
| 4 | Backend API URL (Render) | `https://inventory-backend-xxxx.onrender.com` |

---

## PART 8 — Troubleshooting

### Docker Desktop not running
```
error: connect to docker API ... docker.sock
```
**Fix:** Open Docker Desktop and wait until it is fully running, then retry.

### Port already in use
```powershell
# Find what is using port 8000
netstat -ano | findstr :8000

# Kill process (replace PID with number from above)
taskkill /PID <PID> /F
```

### Frontend shows CORS or network errors
- Check `REACT_APP_API_URL` on Vercel ends with `/api`
- Redeploy Vercel after changing env vars

### Render backend fails to connect to database
- Double-check `DATABASE_URL` on Render
- Try Supabase **Session mode** string (port 5432) instead of pooler

### Render backend is slow on first load
- Normal on free tier — service was sleeping, wait 30–60 seconds

### Reset local Docker completely
```powershell
docker compose down -v
docker system prune -f
docker compose up --build
```

---

## Quick command cheat sheet

```powershell
# LOCAL
docker compose up --build              # Start everything
docker compose up --build -d           # Start in background
docker compose down                    # Stop everything
docker compose ps                      # Check status
docker compose logs -f backend         # View backend logs

# GIT
git add . && git commit -m "msg" && git push

# DOCKER HUB
docker login
docker build -t USERNAME/inventory-backend:latest ./backend
docker push USERNAME/inventory-backend:latest

# TEST
curl http://localhost:8000/health
curl https://YOUR-RENDER-URL.onrender.com/health
```

---

## Recommended order

```
1. Install Docker Desktop + Git
2. Run locally:  docker compose up --build
3. Test:         http://localhost:3001
4. Push GitHub
5. Setup Supabase (database)
6. Deploy Render (backend)
7. Push Docker Hub (image)
8. Deploy Vercel (frontend)
9. Test production URLs
10. Submit all 4 links
```
