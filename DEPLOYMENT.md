# 🚩 Shree Amar Ganesh Mitra Mandal — Production Deployment & Public Launch Guide

**Festival:** Ganeshotsav 2026 (सुवर्णमहोत्सवी वर्ष)  
**Financial Year:** 2026-27  
**Official Repository:** [https://github.com/tejasborse29/shree-amar-ganesh-mandal](https://github.com/tejasborse29/shree-amar-ganesh-mandal)

---

## 1. System Architecture

```
[ Public Users & Committee Members ]
                │
                ▼ (HTTPS / SSL)
   [ Cloudflare Pages / Vercel / Custom Domain (shree-amar-ganesh-mandal.pages.dev) ]
                   (React 18 + Vite SPA)
                │
                ▼ (REST API / JWT Auth)
       [ Render.com Web Service ]
        (Python 3.11 + Flask WSGI)
                │
                ▼ (TLS Encrypted Connection)
     [ MongoDB Atlas Cloud Cluster ]
       (shree_amar_ganesh_db)
```

---

## 2. Production Services & Hosting

| Component | Platform | Production Endpoint / Configuration |
| :--- | :--- | :--- |
| **Frontend (Option A - Cloudflare)** | **Cloudflare Pages** | `https://shree-amar-ganesh-mandal.pages.dev` |
| **Frontend (Option B - Vercel)** | **Vercel** | `https://shree-amar-ganesh-mandal.vercel.app` (or custom `https://shreeamarganesh.in`) |
| **Backend API** | **Render.com** | `https://shree-amar-ganesh-api.onrender.com` |
| **Database** | **MongoDB Atlas** | AWS / GCP Cluster (`shree_amar_ganesh_db`) |
| **PDF Engine** | **ReportLab + Mukta** | Registered Devanagari TrueType Fonts (`Mukta-Regular.ttf`, `Mukta-Bold.ttf`) |

---

## 3. Environment Variables

### Backend (`render.yaml` or Render Dashboard > Environment Variables)

| Variable | Value / Description | Required |
| :--- | :--- | :--- |
| `MONGO_URI` | `mongodb+srv://amarganesh11:amarganesh11@cluster0.wmuzdt1.mongodb.net/shree_amar_ganesh_db?retryWrites=true&w=majority&appName=Cluster0` | **Yes** |
| `DB_NAME` | `shree_amar_ganesh_db` | **Yes** |
| `JWT_SECRET_KEY` | `AMGM_JWT_SECRET_TOKEN_AUTH_2026_SECURE_SHA256_KEY` | **Yes** |
| `PYTHON_VERSION` | `3.11.9` | **Yes** |
| `DEFAULT_FESTIVAL_YEAR` | `2026` | Optional (default: 2026) |

### Frontend (Cloudflare Pages / Vercel > Environment Variables)

| Variable | Value / Description | Required |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://shree-amar-ganesh-api.onrender.com/api` | **Yes** |
| `VITE_SITE_URL` | `https://shree-amar-ganesh-mandal.pages.dev` | Optional |

---

## 4. Step-by-Step Deployment Instructions

### A. Deploy Frontend on Cloudflare Pages (`shree-amar-ganesh-mandal.pages.dev`) ⚡

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/) and go to **Compute (Workers & Pages)** → **Pages** (or click **Create Application** → **Pages**).
2. Click **Connect to Git** and select your GitHub account.
3. Select the repository: **`tejasborse29/shree-amar-ganesh-mandal`**.
4. Configure Build Settings:
   - **Project Name:** `shree-amar-ganesh-mandal` *(gives you `shree-amar-ganesh-mandal.pages.dev`)*
   - **Production Branch:** `main`
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Build Output Directory:** `dist`
5. Under **Environment Variables (Production)**:
   - Variable Name: `VITE_API_URL`
   - Value: `https://shree-amar-ganesh-api.onrender.com/api`
   - Variable Name: `NODE_VERSION`
   - Value: `20`
6. Click **Save and Deploy**.
7. In ~45 seconds, your website will be live at:  
   👉 **`https://shree-amar-ganesh-mandal.pages.dev`** with global CDN caching, free SSL, and DDoS protection!

---

### B. Deploy Backend on Render.com

1. Go to [https://dashboard.render.com/](https://dashboard.render.com/) and Sign In with GitHub.
2. Click **New +** → **Web Service**.
3. Connect your repository: `tejasborse29/shree-amar-ganesh-mandal`.
4. Configure the settings:
   - **Name:** `shree-amar-ganesh-api`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn "app:create_app()"`
   - **Instance Type:** `Free`
5. Under **Environment Variables**, add:
   - `MONGO_URI` = `mongodb+srv://amarganesh11:amarganesh11@cluster0.wmuzdt1.mongodb.net/shree_amar_ganesh_db?retryWrites=true&w=majority&appName=Cluster0`
   - `JWT_SECRET_KEY` = `AMGM_JWT_SECRET_TOKEN_AUTH_2026_SECURE_SHA256_KEY`
   - `DB_NAME` = `shree_amar_ganesh_db`
   - `PYTHON_VERSION` = `3.11.9`
6. Click **Deploy Web Service**.
7. Verify health: visit `https://shree-amar-ganesh-api.onrender.com/api/health` -> should return `{"status": "healthy", "dbConnected": true}`.

---

### C. Deploy Frontend on Vercel (Alternative)

1. Go to [https://vercel.com/](https://vercel.com/) and Sign In with GitHub.
2. Click **Add New...** → **Project**.
3. Select the repository: `tejasborse29/shree-amar-ganesh-mandal`.
4. In Project Configuration:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Under **Environment Variables**, add `VITE_API_URL` = `https://shree-amar-ganesh-api.onrender.com/api`.
6. Click **Deploy**.

---

## 5. Custom Domain Setup

To connect a custom domain like `shreeamarganesh.in`:
- **In Cloudflare Pages:** Go to **Custom Domains** → click **Set up a domain** → enter `shreeamarganesh.in`.
- Cloudflare automatically routes the traffic, issues universal SSL (🔒), and manages DNS.

---

## 6. Role-Based Access Credentials

| Role | Username | Default Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin` | `Admin@AMGM2026` | Full system access, audit logs, settings, user management, festival creation |
| **Treasurer (खजिनदार)** | `treasurer` | `Treasurer@AMGM2026` | Vargani, receipts, income, expenses, general ledger, financial reports |
| **Receipt Manager (पावती प्रमुख)** | `receipt_mgr` | `Receipt@AMGM2026` | Vargani collection, member management, digital receipts |
| **Event Manager (कार्यक्रम प्रमुख)** | `event_mgr` | `Events@AMGM2026` | Events, photo gallery, announcements, social activities |
| **Volunteer / Worker (कार्यकर्ता)** | `volunteer1` | `Volunteer@AMGM2026` | Assigned tasks, quick collection, dashboard view |

---

## 7. Database Backups & Restoration

1. **Manual Backup via `mongodump`:**
   ```bash
   mongodump --uri="mongodb+srv://amarganesh11:amarganesh11@cluster0.wmuzdt1.mongodb.net/shree_amar_ganesh_db" --out=./backup_$(date +%Y%m%d)
   ```
2. **Database Restore via `mongorestore`:**
   ```bash
   mongorestore --uri="mongodb+srv://amarganesh11:amarganesh11@cluster0.wmuzdt1.mongodb.net/shree_amar_ganesh_db" --drop ./backup_YYYYMMDD/shree_amar_ganesh_db
   ```
3. **Database Cleanup Script (Reset sample data for fresh launch):**
   ```bash
   cd backend
   python clear_sample_data.py
   ```
