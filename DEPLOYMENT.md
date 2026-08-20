# 🚩 Shree Amar Ganesh Mitra Mandal — Production Deployment & Public Launch Guide

**Festival:** Ganeshotsav 2026 (सुवर्णमहोत्सवी वर्ष)  
**Financial Year:** 2026-27  
**Official Repository:** [https://github.com/tejasborse29/shree-amar-ganesh-mandal](https://github.com/tejasborse29/shree-amar-ganesh-mandal)

---

## 1. System Architecture

```
[ Public Users & Committee Members ]
                │
                ▼ (HTTPS)
   [ Vercel / Custom Domain (shreeamarganesh.in) ]
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
| **Frontend** | Vercel | `https://shree-amar-ganesh-mandal.vercel.app` (or custom domain `https://shreeamarganesh.in`) |
| **Backend API** | Render.com | `https://shree-amar-ganesh-api.onrender.com` |
| **Database** | MongoDB Atlas | AWS / GCP Cluster (`shree_amar_ganesh_db`) |
| **PDF Engine** | ReportLab + Mukta | Registered Devanagari TrueType Fonts (`Mukta-Regular.ttf`, `Mukta-Bold.ttf`) |

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

### Frontend (Vercel Dashboard > Project Settings > Environment Variables)

| Variable | Value / Description | Required |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://shree-amar-ganesh-api.onrender.com/api` | **Yes** |
| `VITE_SITE_URL` | `https://shreeamarganesh.in` | Optional |

---

## 4. Step-by-Step Deployment Instructions

### A. Deploy Backend on Render.com (1-Click Blueprint or Manual)

1. Go to [https://dashboard.render.com/](https://dashboard.render.com/) and Sign In with GitHub.
2. Click **New +** → **Web Service**.
3. Connect your repository: `tejasborse29/shree-amar-ganesh-mandal`.
4. Configure the settings:
   - **Name:** `shree-amar-ganesh-api`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn "app:create_app()"`
   - **Instance Type:** `Free` (or Starter for high availability)
5. Under **Environment Variables**, add:
   - `MONGO_URI` = `mongodb+srv://amarganesh11:amarganesh11@cluster0.wmuzdt1.mongodb.net/shree_amar_ganesh_db?retryWrites=true&w=majority&appName=Cluster0`
   - `JWT_SECRET_KEY` = `AMGM_JWT_SECRET_TOKEN_AUTH_2026_SECURE_SHA256_KEY`
   - `DB_NAME` = `shree_amar_ganesh_db`
   - `PYTHON_VERSION` = `3.11.9`
6. Click **Deploy Web Service**.
7. Verify health: visit `https://shree-amar-ganesh-api.onrender.com/api/health` -> should return `{"status": "healthy", "dbConnected": true}`.

---

### B. Deploy Frontend on Vercel (1-Click)

1. Go to [https://vercel.com/](https://vercel.com/) and Sign In with GitHub.
2. Click **Add New...** → **Project**.
3. Select the repository: `tejasborse29/shree-amar-ganesh-mandal`.
4. In Project Configuration:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click `Edit` and select `frontend`.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://shree-amar-ganesh-api.onrender.com/api`
6. Click **Deploy**.
7. Your frontend will be live at `https://shree-amar-ganesh-mandal.vercel.app`!

---

## 5. Custom Domain Setup (`shreeamarganesh.in`)

To connect your custom domain:

1. **In Vercel:** Go to **Project Settings** → **Domains** → Add `shreeamarganesh.in` and `www.shreeamarganesh.in`.
2. **In your Domain DNS Manager (GoDaddy / Hostinger / Namecheap / Cloudflare):**
   - **Type A Record:**
     - Name: `@`
     - Value: `76.76.21.21` (Vercel IP)
   - **Type CNAME Record:**
     - Name: `www`
     - Value: `cname.vercel-dns.com`
3. Vercel will automatically provision a free **SSL / HTTPS Certificate** and enforce automatic **HTTP → HTTPS redirection**.

---

## 6. Role-Based Access Credentials

| Role | Username | Default Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin` | `Admin@AMGM2026` | Full system access, audit logs, settings, user management, festival creation |
| **Treasurer (खजिनदार)** | `treasurer` | `Treasurer@AMGM2026` | Vargani, receipts, income, expenses, general ledger, financial reports |
| **Receipt Manager (पावती प्रमुख)** | `receipt_mgr` | `Receipt@AMGM2026` | Vargani collection, member management, digital receipts |
| **Event Manager (कार्यक्रम प्रमुख)** | `event_mgr` | `Events@AMGM2026` | Events, photo gallery, announcements, social activities |
| **Volunteer / Worker (कार्यकर्ता)** | `volunteer1` | `Volunteer@AMGM2026` | Assigned tasks, quick collection, dashboard view |

*(Note: Change passwords after first login via Admin Settings)*

---

## 7. Database Backups & Restoration

MongoDB Atlas maintains automatic continuous snapshots:

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

---

## 8. Security & Data Protection Checklist

- [x] **No hardcoded secrets** in client-side code.
- [x] **Decimal-safe monetary calculations** on server (`Balance = Income - Expenses`).
- [x] **Digital Receipt Uniqueness**: Atomic counter sequence (`AMGM-2026-000001`).
- [x] **Bilingual Devanagari PDF**: ReportLab configured with Unicode NFC and Mukta TrueType fonts.
- [x] **Audit Trail**: All receipts, reversals, and role updates logged in `audit_logs` collection.
- [x] **File Security**: Whitelist of allowed extensions (`.pdf`, `.png`, `.jpg`, `.jpeg`), size capped at 16MB.
- [x] **SPA Routing**: `vercel.json` and `_redirects` ensure deep URLs like `/admin/dashboard` never 404.
