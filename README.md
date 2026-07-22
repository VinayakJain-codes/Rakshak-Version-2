# 🛡️ Rakshak Security (Version 2)
> **Next-Generation Enterprise Security Workforce Management & Real-Time Dispatch Platform**

Rakshak Security V2 is a full-stack, multi-tenant enterprise web application designed for security agencies, field supervisors, property managers, and security officers. It provides real-time shift tracking, automated recurring check-ins, instant emergency alert resolution, and camera-verified patrol duty logging.

---

## 🌟 Key Application Portals

### 1. 🛡️ Super Admin Portal (`/admin`)
* **Multi-Tenant Management**: Provision security tenant accounts with customized guard and property site capacity limits.
* **Platform Metrics**: High-level platform telemetry including total active tenants, total enrolled guards, active sites, and emergency incident volumes.
* **Tier & Billing Controls**: Configure free, basic, and enterprise billing tiers for client agencies.

### 2. 🏢 Client Owner Portal (`/org`)
* **Property Site Management**: Assign and manage secured client properties, assets, and per-site security coverage.
* **Supervisor Provisioning**: Onboard and manage Field Supervisors with automated account credential generation.
* **Billing & Usage**: Live telemetry tracking tenant guard capacity vs. active roster usage with dynamic invoice generation.
* **Audit & Compliance**: System-wide immutable audit trail logging administrative actions, login events, and operational state changes.

### 3. ⚡ Supervisor / Field Operations Portal (`/ops`)
* **Live Command Center (`/ops`)**: Real-time KPI metrics, active security roster status, and an inline emergency alert resolution stream.
* **Guard Roster (`/ops/guards`)**: Manage security officers, monitor shift statuses (`ON_DUTY` vs `OFF_DUTY`), and provision guard login accounts.
* **Guard Scheduling (`/ops/schedule`)**:
  * **One-Off Check-Ins**: Schedule single, specific patrol duties for guards at target dates and times.
  * **Recurring Schedule Rules**: Set automated recurring check-in intervals (*30m, 1h, 2h, 4h, 8h*). The platform automatically generates upcoming due duties as each interval occurs.
* **Emergency Alert Stream (`/ops/alerts`)**: Live SOS alert ticket queue with severity highlights (`HIGH`, `MEDIUM`, `LOW`) and single-click resolution controls.
* **Signal Dispatch Console (`/ops/ping`)**:
  * **Manual "Send Signal Now"**: Immediately ping specific guards to report in for ad-hoc safety checks.
  * **Broadcast Pings**: Transmit operational notices to all active guards on shift simultaneously.
  * **Quick Presets**: One-click dispatch presets (*Urgent Check-in*, *Perimeter Patrol Audit*, *Shift Handover Notice*, *All-Clear Status Ping*).

### 4. 📱 Guard Officer Mobile Portal (`/guard`)
* **Mobile Duty Dashboard (`/guard`)**: Mobile-optimized shift view featuring today's scheduled duties, unread signals counter, and active duty status pills.
* **Camera Verification Check-In**: Guards complete scheduled check-ins by launching an in-app camera modal to upload photo proof of post inspection.
* **Real-Time Signal Alerts (`/guard/notifications`)**: Instant WebSocket notifications for supervisor pings with unread indicators and mark-as-read controls.
* **Emergency SOS Dispatch (`/guard/alerts`)**: One-touch high-priority emergency alert trigger sending immediate location and incident details to the Supervisor Command Center.

---

## 🎨 Design System & Aesthetics

* **Brand Color Palette**: Deep Emerald (`#059669` / `#10b981`) & Cyber Teal (`#0d9488` / `#14b8a6`) gradients with sleek dark and cream accents.
* **Dual Theme Engine**: Seamless user-controlled toggle supporting:
  * **Creamish Premium Light Mode** (`--background: #fdfbf7`)
  * **Black Premium Dark Mode** (`--background: #09090b`)
* **Visual Styling**: Glassmorphic cards (`glass-card`), smooth micro-animations, glowing status pills, responsive tables, and mobile-first bottom navigation.

---

## 🛠️ Technology Stack

* **Framework**: Next.js 16 (App Router, Server Actions, Turbopack)
* **Language**: TypeScript
* **Styling**: Tailwind CSS, Vanilla CSS Variables (`globals.css`), Lucide React Icons
* **Database**: Supabase Postgres with Row Level Security (RLS) policies
* **Authentication**: Supabase Auth with custom role JWT claims hook
* **Real-Time Engine**: Supabase Realtime Channels (WebSockets) for instant signal broadcasts
* **Storage**: Supabase Storage buckets for guard check-in photo evidence

---

## 📁 Repository Structure

```
rakshak-security-v2/
├── rakshak-web/                # Next.js Application Source
│   ├── src/
│   │   ├── app/
│   │   │   ├── (portals)/
│   │   │   │   ├── admin/      # Super Admin Portal
│   │   │   │   ├── org/        # Client Owner Portal
│   │   │   │   ├── ops/        # Supervisor Operations Portal
│   │   │   │   └── guard/      # Guard Officer Portal
│   │   │   ├── actions/        # Next.js Server Actions (auth, ops, org)
│   │   │   ├── globals.css     # Global CSS Variables & Design System Tokens
│   │   │   └── page.tsx        # Public Marketing Landing Page
│   │   ├── components/         # Shared UI Components (Sidebar, TopNav, ThemeToggle)
│   │   └── utils/              # Supabase Client Utilities & Auth Verification
├── schema_migrations/          # SQL Database Schema & RLS Policies
├── README.md                   # Project Overview & Instructions
└── .gitignore                  # Git Ignore Rules
```

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18.x or 20.x+
* npm or yarn
* Supabase Project Instance

### Environment Setup
Create a `.env.local` file inside the `rakshak-web` directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### Installation

1. Clone the repository and navigate to the application directory:
   ```bash
   cd rakshak-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the database migration script in your Supabase SQL Editor:
   ```sql
   -- Run schema_migrations/final_schema.sql in Supabase Dashboard
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security & Architecture

* **Role-Based Access Control (RBAC)**: Enforced via `getUserWithRole()` utility across four distinct roles (`SUPER_ADMIN`, `CLIENT_OWNER`, `SUPERVISOR`, `GUARD`).
* **Row Level Security (RLS)**: Postgres RLS policies restrict multi-tenant data access strictly to users matching the tenant ID.
* **Audit Logging**: Operations write audit logs to the `audit_logs` table for compliance tracking.

---

## 📄 License
Copyright © 2026 Rakshak Security. All rights reserved.
