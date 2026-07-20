# Deploying Egay's Woodwork to Vercel

Follow these in order. Steps 1–2 are the ones people skip and then wonder why
the live site has an empty gallery.

---

## 1. Get a hosted MySQL database  ← do this first

Your `.env.local` points at `localhost`. **Vercel cannot reach a database on
your PC.** Without this step the live site loads but shows no artworks, and the
admin dashboard is empty.

### Which provider (checked July 2026)

| Provider | Really free? | Notes |
|---|---|---|
| **Aiven** | **Yes — always free, no card** | 1 GB storage / 1 GB RAM / 1 CPU. Real MySQL, so this project is a drop-in. Service powers off after a long idle period. |
| **TiDB Cloud Starter** | **Yes — no card** | 25 GiB storage + 250M request units/month. MySQL *wire-compatible* rather than actual MySQL — foreign keys and some DDL behave differently. |
| Railway | **No** | Free tier was discontinued. You get trial credit, then it's a paid plan (~$5/mo). |
| PlanetScale | **No** | Free tier removed in 2024. |

For a site this size (a few hundred rows of text plus Cloudinary image URLs),
Aiven's 1 GB is far more than enough — the images live on Cloudinary, not in
the database.

Free tiers change often. Check the provider's current pricing page before
committing.

### Railway (what you're using)

1. In your Railway project: **MySQL → Variables**, and copy **`MYSQL_PUBLIC_URL`**.
   It looks like `mysql://root:xxxx@centerbeam.proxy.rlwy.net:23456/railway`.

   > Use the **PUBLIC** URL. `mysql.railway.internal` only resolves inside
   > Railway's own network — Vercel cannot reach it.

2. Add it to `.env.local` (this line is only for the import, and `.env.local`
   is gitignored):

   ```
   REMOTE_MYSQL_URL=mysql://root:xxxx@centerbeam.proxy.rlwy.net:23456/railway
   ```

3. Create the tables — and bring your existing artworks along:

   ```bash
   node scripts/db-import.mjs --with-data
   ```

   Drop `--with-data` for an empty database. The script is safe to re-run:
   tables use `CREATE TABLE IF NOT EXISTS`, and artworks are matched on title
   so you never get duplicates.

4. Refresh Railway's **Data** tab — `artworks`, `inquiries` and `rate_hits`
   should now be listed.

Then map the URL's parts onto the Vercel variables in step 4:

| From `MYSQL_PUBLIC_URL` | Vercel variable |
|---|---|
| `root` | `MYSQL_USER` |
| password (between `:` and `@`) | `MYSQL_PASSWORD` |
| host (e.g. `centerbeam.proxy.rlwy.net`) | `MYSQL_HOST` |
| port (e.g. `23456`) | `MYSQL_PORT` |
| path after the `/` (usually `railway`) | `MYSQL_DATABASE` |

### Aiven (or any other provider)

Identical process — the import script takes any MySQL connection URI:

1. Create the free MySQL service, then copy its **Service URI** from the
   Aiven console (it looks like
   `mysql://avnadmin:password@mysql-xxxx.aivencloud.com:12345/defaultdb`).
2. Put it in `.env.local` as `REMOTE_MYSQL_URL=...`
3. `node scripts/db-import.mjs --with-data`

Switching providers later costs about a minute — the script recreates the
schema and re-copies your artworks anywhere.

With a `mysql` CLI you can instead run:

```bash
mysql -h <host> -P <port> -u <user> -p <database> < schema.sql
```

---

## 2. Put the code on GitHub

This folder is not a git repository yet.

```bash
git init
git add .
git commit -m "Egay's Woodwork"
git branch -M main
git remote add origin https://github.com/<you>/egays-woodwork.git
git push -u origin main
```

`.gitignore` already excludes `.env.local`, so your keys stay off GitHub.
**Check that before pushing** — `git status` must not list `.env.local`.

---

## 3. Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new), sign in with GitHub.
2. Pick the repository → **Import**.
3. Framework preset: **Next.js** (auto-detected). Leave build settings alone.
4. **Do not deploy yet** — add the environment variables first (step 4).

---

## 4. Environment variables

In Vercel: **Project → Settings → Environment Variables**. Add each one with
scope **Production** (tick Preview too if you want preview builds to work).

| Variable | Value |
|---|---|
| `MYSQL_HOST` | host from step 1 |
| `MYSQL_PORT` | usually `3306` |
| `MYSQL_USER` | from step 1 |
| `MYSQL_PASSWORD` | from step 1 |
| `MYSQL_DATABASE` | from step 1 |
| `ADMIN_PASSWORD` | **a new strong password — never a common default** |
| `AUTH_SECRET` | a fresh long random string (different from local) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | same as local |
| `CLOUDINARY_API_KEY` | same as local |
| `CLOUDINARY_API_SECRET` | same as local |
| `GEMINI_API_KEY` | same as local |
| `GEMINI_MODEL` | `gemini-flash-latest` |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-project>.vercel.app` |

Generate a fresh `AUTH_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

Changing `AUTH_SECRET` later instantly logs out every admin session — useful if
you ever think you've been compromised.

---

## 5. Deploy

Hit **Deploy**. First build takes 1–2 minutes. Every later `git push` to `main`
redeploys automatically.

---

## 6. Check it works

- `https://<your-site>.vercel.app/` — hero loads
- `/gallery` — your pieces appear **(if empty, step 1 is wrong)**
- `/contact` — send yourself a test message
- Chat bubble — ask "what do you make?"

---

## 7. Get into the admin panel

Go to:

```
https://<your-site>.vercel.app/admin/login
```

Enter `ADMIN_PASSWORD`. **Bookmark this** — it is deliberately not linked from
anywhere on the public site.

- Sessions last 7 days, then you log in again.
- `/admin/dashboard` redirects to the login page if you aren't signed in.
- "Logout" ends the session immediately.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| Gallery empty, dashboard empty | `MYSQL_*` wrong, or schema not imported (step 1) |
| `ENOTFOUND mysql.railway.internal` | You used Railway's private URL — switch to `MYSQL_PUBLIC_URL` |
| `ETIMEDOUT` / `ECONNREFUSED` on import | Railway public networking (TCP proxy) not enabled for the service |
| Login returns 500 | `AUTH_SECRET` not set in Vercel |
| Login always says "Invalid password" | `ADMIN_PASSWORD` not set, or has a stray space |
| Redirect loop on `/admin/dashboard` | Cookie rejected — confirm you're on `https://` |
| Chat says assistant had a problem | `GEMINI_API_KEY` missing, or the model has no free quota — try another `GEMINI_MODEL` |
| Images don't load | Cloudinary vars missing |

Changed an env var? Vercel needs a **redeploy** for it to take effect
(Deployments → ⋯ → Redeploy).
