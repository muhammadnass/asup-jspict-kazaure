# ASUP — Jigawa State Polytechnic, ICT Kazaure Chapter

Official chapter website: history, struggles, publications, members, and a
digitized archive, with a simple admin dashboard for CRUD management.

## Tech stack (and why)

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14** (App Router, TypeScript) | Server Components fetch content directly from the DB, no separate API layer to maintain. Deploys free on Vercel. |
| Styling | **Tailwind CSS** | Fast to maintain, no build-step surprises, easy to hand off to another developer later. |
| Database + Auth + File storage | **Supabase** (hosted Postgres) | One free service replaces a database, an auth system, and an image/document host. Row Level Security (RLS) enforces "public can read, only admins can write" directly in the database — the safest place for that rule to live. |
| Admin CRUD | **Next.js Server Actions** | Forms post straight to server functions — no hand-rolled API routes, no client-side fetch/JSON boilerplate. |

This is intentionally **not** a full CMS (no Strapi/WordPress/Sanity). For a
union chapter with a handful of editors and modest traffic, that would be
more infrastructure than the job needs. Supabase's dashboard is also a
perfectly usable admin panel on its own if you ever want to skip this
site's `/admin` pages and edit data directly.

## Color palette

Sourced directly from the ASUP crest you provided (green gear, gold/yellow
ribbon, black text, white ground):

- `#00692D` **Green** — primary. Used for headers, footer, links, buttons.
- `#003D1A` **Green deep** — admin bar, high-contrast backgrounds.
- `#00923F` **Green light** — hover states (this is the exact gear green from the logo).
- `#FFD400` **Gold** — the ribbon yellow. Accents, highlights, primary CTA button.
- `#FFE066` **Gold light** — hover state for gold buttons.
- `#B3261E` **Red** — a deep accent red for links/eyebrows and for delete/destructive actions (not in the logo itself, but a deliberate nod to the union's "struggle" imagery and a near-universal signal for destructive UI actions).
- `#FAFAF7` **Cream** — background, echoes the logo's white ground without being stark.
- `#171717` **Ink** — body text, near-black to match the logo's linework.

These are Tailwind tokens (`green`, `gold`, `red`, `cream`, `ink`) defined
in `tailwind.config.ts` — change the hex values there and the whole site
updates.

Fonts: **Source Serif 4** (display/headings — gives the "official record"
gravitas) paired with **Inter** (body — clean and highly legible). Both
load via `next/font/google`, so no external font requests slow the site
down.

## Project structure

```
asup-jigawa/
├─ app/
│  ├─ layout.tsx              # Root layout: fonts, Navbar, Footer
│  ├─ page.tsx                 # Homepage
│  ├─ globals.css              # Design tokens, seal/ledger motifs
│  ├─ history/page.tsx         # Chapter History (public)
│  ├─ struggles/page.tsx       # Chapter Struggles (public)
│  ├─ publications/page.tsx    # Publication Records (public)
│  ├─ members/page.tsx         # Member directory (public)
│  ├─ archives/page.tsx        # Digitized archive gallery (public)
│  └─ admin/
│     ├─ layout.tsx            # Admin shell + sign-out
│     ├─ login/page.tsx        # Admin sign-in form
│     ├─ dashboard/page.tsx    # Record counts, quick links
│     ├─ members/page.tsx      # Members CRUD (+ photo upload)
│     ├─ content/page.tsx      # History/Struggles/Publications CRUD
│     └─ archives/page.tsx     # Archive digitization CRUD
├─ components/                 # Logo, Navbar, Footer, MemberCard, ContentList
├─ lib/
│  ├─ supabase/client.ts       # Browser Supabase client
│  ├─ supabase/server.ts       # Server Supabase client (cookies-aware)
│  ├─ actions/                 # Server Actions: auth.ts, members.ts, content.ts, archives.ts
│  └─ types.ts
├─ middleware.ts                # Protects /admin/*, redirects signed-in users off /admin/login
├─ supabase/schema.sql          # Tables, RLS policies, storage buckets
└─ public/logo.png              # <- put the real ASUP crest here
```

## Local setup on Ubuntu + VS Code

1. **Install Node.js 20 LTS** (if you don't have it):
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   node -v
   ```

2. **Unzip the project and install dependencies**:
   ```bash
   cd asup-jigawa
   npm install
   ```

3. **Create a free Supabase project**: go to
   [supabase.com](https://supabase.com) → New project → pick a region
   close to Nigeria (e.g. an EU region) → wait for it to provision.

4. **Run the schema**: open your project's **SQL Editor** in Supabase,
   paste the entire contents of `supabase/schema.sql`, and run it. This
   creates the `members`, `content_posts`, `archive_items`, `admins`
   tables, the RLS policies, and the two storage buckets.

5. **Create your admin account**: in Supabase, go to
   **Authentication → Users → Add user**, create the secretary's email +
   password. Copy the new user's UUID, then in the SQL Editor run:
   ```sql
   insert into admins (user_id, full_name)
   values ('paste-the-uuid-here', 'Chapter Secretary');
   ```
   Only user IDs listed in `admins` can create/edit/delete anything —
   everyone else gets read-only access, enforced by the database itself.

6. **Set your environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   from Supabase → **Project Settings → API**.

7. The real ASUP logo is already included at `public/logo.png`.

8. **Run it**:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` for the public site and
   `http://localhost:3000/admin/login` to sign in and manage content.

## Deploying for free (Vercel + Supabase)

Supabase is already hosting your database/auth/storage for free (its free
tier is generous enough for a chapter site: 500MB database, 1GB storage,
50,000 monthly active users). The steps below put the website itself on
Vercel's free tier.

1. **Push the project to GitHub**:
   ```bash
   cd asup-jigawa
   git init
   git add .
   git commit -m "Initial ASUP ICT Kazaure chapter website"
   ```
   Create a new empty repository on GitHub, then:
   ```bash
   git remote add origin https://github.com/<your-username>/asup-ict-kazaure.git
   git branch -M main
   git push -u origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com) → sign in with GitHub →
     **Add New → Project**.
   - Select the `asup-ict-kazaure` repository. Vercel auto-detects
     Next.js — no config needed.

3. **Add environment variables** in the Vercel import screen (or later
   under **Project → Settings → Environment Variables**):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy.** Vercel builds and gives you a live URL like
   `asup-ict-kazaure.vercel.app` within a minute or two.

5. **Optional: custom domain.** Under **Project → Settings → Domains**,
   add a domain (e.g. `asupictkazaure.org.ng`) and follow Vercel's DNS
   instructions. If you don't have a domain yet, the free `.vercel.app`
   subdomain works fine to start.

6. **Every future `git push` to `main` auto-deploys** — this is the whole
   ongoing maintenance workflow: edit code locally, commit, push, done.
   Day-to-day content changes (adding members, posting updates,
   uploading archive scans) don't need any of this — they happen
   entirely through `/admin` on the live site.

### Alternative free hosts
Netlify and Render both also have free tiers and support Next.js. Vercel
is recommended here because it's built by the Next.js team and requires
zero configuration for this project — Netlify would need a
`netlify.toml` with the Next.js runtime plugin, and Render's free tier
is better suited to always-on servers than to a mostly-static content
site like this one.

## Extending it later
- **Search**: Postgres full-text search (`to_tsvector`) can be added to
  `content_posts` and `archive_items` with a small SQL migration if the
  archive grows large.
- **Multiple admins with roles**: the `admins` table can gain a `role`
  column (e.g. `editor` vs `secretary`) and the RLS policies can branch
  on it.
- **Newsletter/email**: Supabase Edge Functions + a transactional email
  provider (Resend has a free tier) if the chapter wants to email
  members about publications.
