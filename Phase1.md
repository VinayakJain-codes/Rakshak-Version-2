## Phase 1 — The Trust Model: Auth, Roles, and Tenancy (the most important phase in this entire plan)
 
This is the phase every other phase depends on. Get this wrong and every feature built afterward inherits the flaw — this is the single most common way platforms like this end up insecure.
 
### 1.1 — Design the identity model before writing any code
Decide, on paper, the exact relationship between:
- `auth.users` (Supabase's built-in table — email, password, nothing else you should trust)
- A `public.profiles` table you own — one row per user, storing `role` and `tenant_id`
- A `public.tenants` table — one row per client organization
- A `public.guards` table — one row per guard, linked to both a `profiles.id` (their login) and a `tenants.id` (which client they belong to)
**The rule to commit to from day one:** `role` and `tenant_id` must **never** live in Supabase Auth's `user_metadata`. That field is editable by the signed-in user themselves via the client SDK (`supabase.auth.updateUser()`), by design — it is meant for user-controlled preferences, not access control. If your role/tenant checks ever read from `user_metadata`, any user can promote themselves to Super Admin from the browser console. This single mistake is the most common and most severe way platforms like this get broken, so it deserves being called out before a single line of schema is written.
 
### 1.2 — Build the trusted role/tenant source
- Create `public.profiles` with `id` (FK to `auth.users.id`), `role` (enum: `SUPER_ADMIN`, `CLIENT_OWNER`, `SUPERVISOR`, `GUARD`), `tenant_id` (nullable for Super Admin), `full_name`. This table is writable **only** by server-side code using the service-role key — never by the authenticated client role.
- Set up a Supabase **Custom Access Token Hook** (Postgres function registered in Supabase Auth settings) that injects `role` and `tenant_id` from `profiles` into the JWT at token-issuance time. This is what makes the value trustworthy — it's computed server-side by Postgres, not supplied by the client.
- Write the two Postgres helper functions every RLS policy will use: `auth.user_role()` and `auth.tenant_id()`, both reading from the JWT claims set by the hook above — not from `user_metadata`.
### 1.3 — Row Level Security from the start
- Enable RLS on every table the moment you create it. Never leave a table's RLS off "temporarily" — that's how tenant data leaks happen.
- Every tenant-scoped table gets the same shape of four policies (SELECT/INSERT/UPDATE/DELETE), each checking `tenant_id = auth.tenant_id() OR auth.user_role() = 'SUPER_ADMIN'`.
- For tables where a *specific individual* (not just their tenant) should be the only one who can write — like a guard's own check-in — the policy also needs to check that the row's `guard_id` (or equivalent) matches the calling user's own ID, not just their tenant. (Otherwise any supervisor or guard in the same tenant could insert fabricated data for a different guard.)
### 1.4 — Account creation, the correct way, from the start
- Guards, Supervisors, and Client Owners are never allowed to self-register with a role of their choosing. Every account is created by someone above them in the hierarchy, using a **server-only** action (Next.js Server Action or Route Handler) that uses the Supabase **service-role key** — never exposed to the browser — and calls `supabase.auth.admin.createUser()`.
- Design the credential-handoff flow before building the UI: since Supabase won't let you retrieve a plaintext password later, either (a) generate a strong password server-side and display it exactly once to the creator (Super Admin/Supervisor) to hand off securely, or (b) send a magic-link/invite-email flow where the new user sets their own password on first login. Pick one deliberately — don't let this be an afterthought.
- Every account-creation server action must itself verify the caller's role/tenant server-side (re-check `profiles` for the calling user, don't trust anything passed from the client) before creating the new account — this is a second layer of defense on top of RLS.
### 1.5 — Middleware boundary enforcement
- Write the auth middleware once, correctly: every request checks for a session; if there's no session, redirect to login (except for public/auth routes). If there is a session, read `role` from the JWT claim (set via 1.2, not `user_metadata`), and explicitly allow-list which role can access which top-level route group. No default/fallback role — if `role` is somehow missing, deny access outright and route to an error page. Missing role must never quietly default to a privileged one.
- Every one of the four portal route groups (`admin`, `org`, `ops`, `guard`) gets an explicit boundary check in this same file — don't add them one at a time as an afterthought per phase; write all four now.
**Done when:** you can log in as four different test users (one per role, in two different tenants) and verify: (a) each only sees their own tenant's data, never another tenant's, (b) a guard cannot reach `/ops` or `/admin` routes by typing the URL, (c) attempting `supabase.auth.updateUser({ data: { role: 'SUPER_ADMIN' }})` from the browser console does nothing, because nothing trusts that field. Write this as an actual test checklist and run it before moving on — this is the phase most worth being paranoid about.
 For any ui there is plugin ui ux installed use that 
 Superadmin should have option to create tenant (client) and client should have option to create supervisor and supervisor should have option to create guard within same tenant 
 EVerything should feel modern new minimal look and smooth dyanamic with optiuon of dark and light mode as well
 Dont create any implementation plan this is your plan create tasjs