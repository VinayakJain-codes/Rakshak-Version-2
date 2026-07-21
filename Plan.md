## Phase 0 — Foundations & Environment Setup
 
**Goal:** a working, empty, secure skeleton — no features yet, but nothing insecure either.
 
- Create the Supabase project. Immediately note: **never** commit the project URL, anon key, or service-role key into git. Set up `.env.local` from day one and put it in `.gitignore` before the first commit, not after.
- Scaffold the Next.js app (App Router, TypeScript). Decide the route-group structure up front so every role has an isolated area:
  - `(portals)/admin/*` — Super Admin
  - `(portals)/org/*` — Client Owner
  - `(portals)/ops/*` — Supervisor
  - `(portals)/guard/*` — Guard
  - `auth/*` — login/signup/consent flows shared by everyone
- Install and configure `@supabase/ssr` (server client, browser client, and middleware helper) — this is the piece that makes cookies/session work correctly across server components, client components, and middleware. Get this right before writing any feature code; retrofitting auth plumbing later is painful.
- Set up environment separation: a **local/dev Supabase project** separate from the eventual production one, so testing account creation, RLS policies, and payment webhooks never touches real user data. Decide this now — most teams regret not doing it from day one.
- Initialize git, initial commit, push to a **private** repo (not public) until you're deliberately ready to open it up.
**Done when:** `npm run dev` shows a blank Next.js app connected to a Supabase project, with no secrets committed, and the four portal route groups exist as empty shells.
 