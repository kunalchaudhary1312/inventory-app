# 📦 Inventory & Order Management System

A full-stack Inventory & Order Management System built with **FastAPI**, **React**, **PostgreSQL**, and **Docker**.

## 🏗 Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python) |
| Frontend | React 18 |
| Database | PostgreSQL 15 |
| ORM | SQLAlchemy |
| Containers | Docker + Docker Compose |

## ✅ Features

- **Products**: CRUD with unique SKU enforcement
- **Customers**: CRUD with unique email enforcement
- **Orders**: Create orders with multiple items, automatic stock validation & reduction
- **Dashboard**: Overview stats and recent orders

## 🚀 Local Development

### Prerequisites
- Docker & Docker Compose installed

### Run with Docker (Recommended)
```bash
# Clone the repo
git clone <your-repo-url>
cd inventory-app

# Start all services
docker-compose up --build

# App will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Run without Docker

**Backend:**
```bash
cd backend
pip install -r requirements.txt
# Set your DATABASE_URL in .env
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
# Set REACT_APP_API_URL in .env
npm start
```

## 🌐 Deployment

### Backend → Render.com (Free)
1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo, select `backend/` as root
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variable: `DATABASE_URL` (from Supabase or Render PostgreSQL)
7. Deploy → copy the URL

### Database → Supabase (Free PostgreSQL)
1. Go to [supabase.com](https://supabase.com) → New Project
2. Go to Settings → Database → Connection string
3. Use that as `DATABASE_URL` in Render

### Frontend → Vercel (Free)
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo, set **Root Directory** to `frontend`
3. Add environment variable: `REACT_APP_API_URL=https://your-backend.onrender.com/api`
4. Deploy → copy the URL

### Docker Hub (Backend Image)
```bash
docker build -t yourdockerhub/inventory-backend:latest ./backend
docker push yourdockerhub/inventory-backend:latest
```

## 📋 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/products/ | List all products |
| POST | /api/products/ | Create product (unique SKU) |
| PUT | /api/products/{id} | Update product |
| DELETE | /api/products/{id} | Delete product |
| GET | /api/customers/ | List all customers |
| POST | /api/customers/ | Create customer (unique email) |
| PUT | /api/customers/{id} | Update customer |
| DELETE | /api/customers/{id} | Delete customer |
| GET | /api/orders/ | List all orders |
| POST | /api/orders/ | Create order (validates & reduces stock) |
| PUT | /api/orders/{id} | Update order status |
| DELETE | /api/orders/{id} | Delete order |

## 📝 Submission Links Needed

- GitHub Repository Link (Frontend + Backend)
- Backend Docker Hub Image Link
- Frontend Hosted URL (Vercel)
- Backend API Hosted URL (Render)
