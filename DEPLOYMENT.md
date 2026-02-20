# Deployment Plan: Turbo Notes

Deploy **frontend** on **Vercel** and **backend** on **Railway**. All API calls go through the Next.js server, so the browser only talks to Vercel; the Next.js server on Vercel calls the Railway API.

---

## 1. Backend (Railway)

### 1.1 Create project and service

- Create a new project at [railway.app](https://railway.app).
- Add a **Web Service** (your Django app).
- Add **PostgreSQL** from the Railway dashboard (recommended; SQLite is ephemeral on Railway).

### 1.2 Connect repo and configure build

- Connect your Git repo.
- **Root directory**: `apps/backend` (required so `manage.py`, `requirements.txt`, and `Procfile` are in the working directory).
- **Build command**: `pip install -r requirements.txt` (or leave empty and let Railway/Nixpacks detect the Python app and install deps).
- **Start command**: Leave **empty** so Railway uses the `Procfile` (migrations + gunicorn). Do **not** use `pnpm --filter backend dev` — that runs the Django dev server and won’t bind to `$PORT`. If you set it manually, use:
  ```bash
  python manage.py migrate --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
  ```
- **Watch paths**: `apps/backend/**` (so only backend changes trigger deploys).

Do not use pnpm/Node for the backend on Railway: this service is Python/Django. Use Root directory `apps/backend`, pip for build, and the Procfile (or the gunicorn command above) for start.

### 1.3 Environment variables (Railway dashboard → Variables)

| Variable | Required | Example / notes |
|----------|----------|------------------|
| `SECRET_KEY` | Yes | Long random string (e.g. `openssl rand -base64 48`) |
| `DEBUG` | Yes | `False` in production |
| `ALLOWED_HOSTS` | Yes | Your Railway host, e.g. `turbo-notes-production.up.railway.app` (no `https://`) |
| `DATABASE_URL` | Yes (if using Postgres) | Set automatically if you added the PostgreSQL plugin; otherwise copy from Railway’s Postgres service |
| `CORS_ALLOWED_ORIGINS` | Yes | Your Vercel frontend URL, e.g. `https://turbo-notes.vercel.app` (comma-separated if you have multiple) |

### 1.4 Migrations

The `Procfile` runs `migrate --noinput` before starting gunicorn, so migrations run on each deploy. For the first deploy, ensure the Postgres service is linked so `DATABASE_URL` is set.

### 1.5 Get the backend URL

- In Railway, open your Web Service → **Settings** → **Networking** → **Generate Domain** (or use a custom domain).
- Copy the public URL (e.g. `https://turbo-notes-production.up.railway.app`). You’ll use this as `NEXT_PUBLIC_API_URL` in Vercel.

---

## 2. Frontend (Vercel)

### 2.1 Create project and connect repo

- At [vercel.com](https://vercel.com), import your Git repo.
- **Root Directory**: `apps/frontend`
- **Framework Preset**: Next.js (auto-detected).
- **Build Command**: leave default (`next build` or `pnpm run build`; Vercel runs from `apps/frontend` so `pnpm run build` is correct if you have a root `package.json` that delegates, or set it to `cd ../.. && pnpm run build --filter frontend` if building from monorepo root—see 2.3).
- **Output Directory**: leave default (e.g. `.next`).
- **Install Command**: `pnpm install` (or leave default).

### 2.2 Environment variables (Vercel → Settings → Environment Variables)

| Variable | Required | Example |
|----------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | Your Railway backend URL, e.g. `https://turbo-notes-production.up.railway.app` (no trailing slash) |

Add it for **Production** (and Preview if you want preview deployments to hit the same API).

### 2.3 Monorepo build on Vercel

- If **Root Directory** is `apps/frontend`, the build runs inside that app. Ensure dependencies install correctly: either use a root `package.json` and run from repo root with **Root Directory** empty and **Build Command** something like `pnpm run build --filter frontend`, or keep Root Directory `apps/frontend` and ensure `pnpm install` installs workspace deps (e.g. run from repo root in the build or use a custom install that includes the `types` package).
- If your types package is built as part of the frontend build, ensure the build step that generates or uses `@turbo-notes/types` runs (e.g. `pnpm run generate:types` before `next build` if the schema is fetched from an API; otherwise the existing generated types in the repo are enough).

### 2.4 Redeploy

After setting `NEXT_PUBLIC_API_URL`, trigger a new deployment so the value is baked into the build.

---

## 3. Checklist

### Backend (Railway)

- [ ] Repo connected, root directory `apps/backend`
- [ ] PostgreSQL added and `DATABASE_URL` set (or provided by plugin)
- [ ] `SECRET_KEY` set (strong, random)
- [ ] `DEBUG=False`
- [ ] `ALLOWED_HOSTS` = Railway host (and custom domain if any)
- [ ] `CORS_ALLOWED_ORIGINS` = Vercel frontend URL(s)
- [ ] `gunicorn` in `requirements.txt` and start command uses `$PORT`
- [ ] Migrations run at least once (`python manage.py migrate`)

### Frontend (Vercel)

- [ ] Repo connected, root directory `apps/frontend` (or monorepo build configured)
- [ ] `NEXT_PUBLIC_API_URL` = Railway backend URL (no trailing slash)
- [ ] Redeploy after changing env vars

### After go-live

- [ ] Register / log in from the Vercel URL and create a note to confirm end-to-end flow.
- [ ] If you use a custom domain for frontend or backend, add it to `ALLOWED_HOSTS` and/or `CORS_ALLOWED_ORIGINS` as needed.

---

## 4. Env summary

**Backend (Railway)** — see also `apps/backend/.env.example`:

```env
SECRET_KEY=<random-secret>
DEBUG=False
ALLOWED_HOSTS=turbo-notes-production.up.railway.app
DATABASE_URL=postgres://...   # from Railway Postgres plugin
CORS_ALLOWED_ORIGINS=https://turbo-notes.vercel.app
```

**Frontend (Vercel)** — see also `apps/frontend/env.example`:

```env
NEXT_PUBLIC_API_URL=https://turbo-notes-production.up.railway.app
```

---

## 5. Optional: types and OpenAPI

- If you use `generate:types` against a live API, point the script at your production API URL (or a staging backend) when generating; otherwise the checked-in types in `packages/types` are sufficient for the build.
- No extra env vars are required for deployment beyond `NEXT_PUBLIC_API_URL` and the backend env vars above.
