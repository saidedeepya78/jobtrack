# JobTrack

A responsive job and internship application tracker built for college students. Add opportunities, update their status, search and filter your pipeline, and see your interview, offer, and rejection counts at a glance.

**Stack:** React 19 + Vite 8 + Supabase (PostgreSQL) + plain CSS. Deployable to Vercel.

---

## What works

- Professional blue-and-white responsive dashboard
- Statistics for total applications, interviews, offers, and rejections
- Add applications with company, role, job URL, application date, and status
- List, edit, and delete applications
- Search by company name or role
- Filter by status with live counts
- Form validation, inline errors, success/error toasts
- Clearly labeled sample records with a one-click remove action
- Real Supabase CRUD when configured
- Clearly labeled localStorage demo fallback when Supabase is not configured or unavailable
- Production build verified

---

## Quick start (works immediately, no database required)

**Prerequisite:** Node.js 22 or newer.

```bash
cd jobtrack
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

With no environment variables, JobTrack starts in **Demo mode**:

- Five sample applications are preloaded and marked with a `Sample` badge.
- Data is stored in the browser's `localStorage`.
- **localStorage is not a backend.** It is per-browser, per-device, not shared with anyone, and can be erased by clearing site data or using private browsing.

To check the production build:

```bash
npm run build
npm run preview
```

---

## Connect Supabase (real persistent database)

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**.
3. Choose an organization, name (for example `jobtrack`), a database password, and a region close to you.
4. Wait for the project to finish provisioning.

### 2. Run the database schema

1. In the Supabase dashboard, open **SQL Editor**.
2. Click **New query**.
3. Copy the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) into the editor.
4. Click **Run**.
5. You should see a success message and a `public.applications` table in **Table Editor**.

The full schema is in `supabase/schema.sql`. It creates the applications table, validation constraints, indexes, an `updated_at` trigger, and RLS policies. Read the security comments at the top of that file.

### 3. Copy the public API credentials

In Supabase, open **Project Settings → API** (newer dashboards may call part of this **API Keys**):

- Copy the **Project URL**
- Copy the **anon public** key (or the newer **publishable** key)

Do **not** copy the `service_role` or secret key. A service-role key bypasses Row Level Security and must never be shipped in frontend code.

### 4. Create `.env.local`

Copy the example file in the project root:

**PowerShell / Windows**

```powershell
Copy-Item .env.example .env.local
notepad .env.local
```

**macOS / Linux**

```bash
cp .env.example .env.local
```

Set the two values:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_OR_PUBLISHABLE_KEY
```

No quotes around the values. Do not commit `.env.local`; it is already excluded by `.gitignore`.

### 5. Restart the dev server

Vite reads environment variables at startup.

```bash
# Stop the current server with Ctrl+C, then:
npm run dev
```

When the connection is healthy, the header pill says **Supabase connected**. Add, edit, and delete an application, refresh the page, and verify the row changes in **Supabase → Table Editor → applications**.

### 6. Add the sample records to Supabase (optional)

A new Supabase table starts empty. Use **Load sample records** in the empty state to insert the labeled sample rows. You can remove them at any time with **Remove samples** in the banner; your own rows are left untouched.

### How the connection fallback works

At startup, the app checks the Supabase credentials and makes a small read request:

- **Credentials missing or placeholders** → Demo mode using `localStorage`.
- **Credentials present but database unreachable/table missing/RLS blocked** → An amber/red banner explains the error and says data is now in `localStorage`. The **Retry connection** button re-checks the database. This keeps the product usable while you fix the backend.
- **Credentials present and read succeeds** → All operations use Supabase CRUD. No demo data is silently mixed into the database.

`VITE_*` variables are compiled into the frontend bundle. That is normal for the Supabase **anon/publishable** key, which is designed to be public. Your database must be protected with RLS. Never use `VITE_` for a service-role or secret key.

---

## Database schema summary

Table: `public.applications`

| Column             | Type          | Notes                                               |
| ------------------ | ------------- | --------------------------------------------------- |
| `id`               | `uuid`        | Primary key, generated with `gen_random_uuid()`     |
| `company`          | `text`        | Required, 1–120 characters                          |
| `role`             | `text`        | Required, 1–120 characters                          |
| `job_url`          | `text`        | Optional, max 500 characters                         |
| `application_date` | `date`        | Required, defaults to the current date               |
| `status`           | `text`        | `Applied`, `Interview`, `Offer`, or `Rejected`        |
| `is_sample`        | `boolean`     | Used to label and remove sample records              |
| `created_at`       | `timestamptz` | Automatically set                                    |
| `updated_at`       | `timestamptz` | Updated automatically by a trigger                   |

---

## Security notes

- The frontend only uses the public anon/publishable key. No service-role key is used anywhere.
- `.env` and `.env.local` are ignored by Git; `.env.example` contains placeholders only.
- The included RLS policies are **intentionally open for a no-auth classroom demo**. Anyone with the deployed site's public anon key could read or modify the data. Do not store real personal data in this deployment.
- For real users, add Supabase Authentication, add a `user_id` column referencing `auth.users`, and change every RLS policy to require `auth.uid() = user_id`. Also add per-user uniqueness/validation as needed.
- Never commit `.env.local`, service-role keys, database passwords, or Supabase access tokens.

---

## Deploy to GitHub and Vercel

### A. Push the project to GitHub

1. Install Git if needed. On Windows, install [Git for Windows](https://git-scm.com/download/win) or use GitHub Desktop, then reopen your terminal. (If `git --version` is not recognized, Git is not installed.)
2. On [github.com/new](https://github.com/new), create an **empty** repository named `jobtrack`. Do not add a README, `.gitignore`, or license.
3. Open a terminal in this project folder and run:

```bash
cd C:\Users\CRKANAND\OneDrive\Desktop\jobtrack
git init
git add .
git status --short
git commit -m "Build JobTrack application tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/jobtrack.git
git push -u origin main
```

4. Before or after committing, verify secrets are not staged:

```bash
git check-ignore -v .env.local
git ls-files
```

The first command should confirm `.env.local` is ignored (if that file exists). `git ls-files` should only show `.env.example`, never `.env` or `.env.local`.

5. If Git asks for credentials, sign in through the browser or use a GitHub personal access token. GitHub Desktop is also fine: **Add local repository → publish repository**.

Subsequent updates:

```bash
git add .
git commit -m "Describe your change"
git push
```

### B. Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Find and **Import** your `jobtrack` repository.
3. Configure the project:
   - **Framework Preset:** Vite (Vercel usually detects this automatically)
   - **Root Directory:** leave as `./` if the repository root is this project
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Open **Environment Variables** and add both values from your `.env.local`:

   | Name                     | Value                                      |
   | ------------------------ | ------------------------------------------ |
   | `VITE_SUPABASE_URL`      | `https://YOUR_PROJECT_REF.supabase.co`     |
   | `VITE_SUPABASE_ANON_KEY` | Your anon/publishable key                  |

   Add them to **Production**, **Preview**, and **Development**. Do not add a service-role key.
5. Click **Deploy** and wait for the build.
6. Open the generated Vercel URL. The header should say **Supabase connected** if the environment variables and database are correct.
7. Test the deployed app: add an application, refresh, edit it, delete it, and confirm the changes in Supabase Table Editor.

**If you change environment variables later**, trigger a new deployment: **Vercel → Project → Deployments → latest deployment → ⋯ → Redeploy**. Environment changes are not applied to an existing build automatically.

You can deploy in demo-only mode without variables, but every visitor will get their own browser-local data and nothing will be shared or persisted server-side. For the assignment's real backend requirement, connect Supabase.

Optional Vercel CLI flow:

```bash
npm install -g vercel
vercel login
vercel
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel --prod
```

---

## Project structure

```text
jobtrack/
├─ public/
│  └─ favicon.svg
├─ src/
│  ├─ components/
│  │  ├─ ApplicationForm.jsx
│  │  ├─ ApplicationList.jsx
│  │  ├─ ConfirmDialog.jsx
│  │  ├─ Icons.jsx
│  │  ├─ ModeBanner.jsx
│  │  ├─ StatsCards.jsx
│  │  └─ Toast.jsx
│  ├─ lib/
│  │  ├─ constants.js
│  │  ├─ dataStore.js      # Supabase CRUD + localStorage fallback
│  │  ├─ format.js
│  │  ├─ samples.js
│  │  └─ validation.js
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ styles.css
├─ supabase/
│  └─ schema.sql
├─ .env.example
├─ .gitignore
├─ index.html
├─ package.json
├─ README.md
└─ vite.config.js
```

---

## Scripts

| Command         | Purpose                                  |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start the Vite development server         |
| `npm run build` | Create the production build in `dist/`    |
| `npm run preview` | Preview the production build locally    |

---

## Troubleshooting

**The header says "Demo mode" after I added Supabase values.**  
Make sure the file is named `.env.local` in the project root, the values are not placeholders, and restart `npm run dev`. Vite only reads env files at startup. On Vercel, add the variables and redeploy.

**The banner says the applications table was not found.**  
Run the entire `supabase/schema.sql` file in the Supabase SQL Editor for the correct project.

**The banner says Supabase rejected the API key.**  
Copy the anon/publishable key again. Do not use the service-role key. Restart or redeploy after changing it.

**The app fell back to localStorage even with credentials.**  
Open the banner message. Common causes: wrong project URL, table missing, RLS policy not applied, network/extension blocking requests, or the Supabase project being paused. Fix the issue and click **Retry connection**.

**The Vercel site is in demo mode.**  
The Vercel deployment does not have the environment variables, or you changed them without redeploying. Add both variables to all environments and redeploy.

**My data disappeared in demo mode.**  
localStorage data belongs to a single browser profile and origin. Clearing site data, private windows, different browsers/devices, or a different Vercel preview URL will show different data. Connect Supabase for durable storage.

**`git` is not recognized.**  
Install Git for Windows (or use GitHub Desktop) and reopen the terminal. The app itself does not need Git.

---

## Known limitations

- No authentication or multi-user accounts (single shared demo dataset in Supabase).
- The included Supabase RLS policies are open by design for this assignment. See the security section before using real data.
- No pagination; this is intended for a student's application list.
- No email reminders or resume uploads; these are not part of the assignment requirements.
