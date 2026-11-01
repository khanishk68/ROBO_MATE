# ROBO MATES
> **"TWO LEARNERS. TWO SPECIALIZATIONS. ONE ROBOTICS JOURNEY."**

A private, full-stack robotics learning management system and productivity platform built specifically for two co-founders pursuing careers in robotics:
- **Boy Mode**: Robotics Systems Engineer (Python, C++, ROS 2, Embedded ESP32, PID control, Gazebo, OpenCV, SLAM, Autonomous Navigation).
- **Girl Mode**: Industrial Product Designer (Sketching, Perspective, Fusion 360, Blender, CAD assemblies, DFM/DFA, Ergonomics, Human-Robot UX).

---

## 🚀 Key Features

### 1. Dual Personal Design Modes with Light & Dark Themes
- **Boy Mode (Dark)**: Obsidian Black (`#080E1C`), Deep Navy (`#111E32`), Electric Neon Cyan (`#38BDF8`), Technical Grids, subtle glowing borders.
- **Boy Mode (Light)**: Clean Ice Blue (`#F0F6FF`), Crisp Engineering Blue (`#2563EB`).
- **Girl Mode (Light)**: Pearl White (`#FFF8F6`), Soft Cream (`#FFF0F3`), Baby Pink (`#F5B8CC`), Rose Pink (`#D96B91`).
- **Girl Mode (Dark)**: Deep Rose Wine (`#1A0F14`), Neon Blossom Pink (`#F5B8CC`).
- Independent settings for Persona (Boy/Girl) and Theme (Light/Dark).

### 2. 12-Month Sequential Robotics Program (365 Days)
- **Custom Start Date**: The program activates on the user's chosen start date (no hardcoded January–December).
- **12 Monthly Stages**: Full curriculum for both engineering and industrial design paths.
- **52 Weekly Plans & Daily Checklists**: Generated directly from monthly deliverables.
- **Balanced Daily Allocation**: 4–5 hours/day with customized splits:
  - *Boy Mode*: 25% Theory, 25% Programming, 35% Hardware/Practical, 15% Revision.
  - *Girl Mode*: 20% Theory, 25% Sketching, 35% CAD/3D, 20% Prototyping/Portfolio.
- **Automatic Missed-Task Rescheduling**: Overdue tasks automatically reschedule up to 3 per day with excess rolling over; tasks overdue > 7 days flag for replanning.

### 3. Context-Aware Google Gemini AI Personal Tutor
- **Robotics Engineering Mentor (Boy)**: Explains PID, ROS 2 topics, ESP32 timers, C++ memory, and reviews code.
- **Industrial Design Mentor (Girl)**: Explains DFM/DFA tolerances, injection molding drafts, sketching form language, and critiques CAD models.
- **Strict Privacy Isolation**: Each user's conversation history is private and never mixed.
- **End-of-Month AI Reviews**: Analyzes actual database records and assessment scores without hallucinating achievements.

### 4. Shared Robotics Venture: Autonomous Mobile Robot (AMR)
- **Collaborative Project Management**: Tracks the joint physical robot build.
- **Clear Specialization Ownership**:
  - *Boy*: ESP32 firmware, motor control, ROS 2 Nav2, LiDAR SLAM, computer vision.
  - *Girl*: ABS outer enclosure CAD, quick-release battery hatch, chassis packaging, ergonomics, Blender renders.
- **Shared Specs & Repositories**: Integrated code repository and CAD model links.

### 5. Private Two-User Workspace Security
- **Supabase Row Level Security (RLS)**: Enforced on all 22 database tables.
- **Strict 2-Member Limit**: Enforced via PostgreSQL trigger (`check_workspace_member_limit`).
- **Zero Client-Side Impersonation**: Server-side user authorization verified on every request.

### 6. Progressive Web App (PWA) & Web Push Notifications
- **Installable PWA**: App manifest, service worker (`/sw.js`), and offline fallback (`/offline.html`).
- **Web Push Reminders**: Morning study alerts, streak reminders, and overdue alerts powered by VAPID.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lucide React, Recharts |
| **Backend** | Next.js Server Actions & API Routes, Supabase PostgreSQL, Supabase Auth |
| **Security** | PostgreSQL Row Level Security (RLS), Zod validation, Private Workspace Triggers |
| **AI** | Google Gemini API (`@google/genai` v2, `gemini-2.0-flash`) |
| **Notifications** | Web Push API, Service Worker, VAPID |
| **PWA** | Web App Manifest, Service Worker caching, Offline fallback |

---

## 📁 Application Structure

```
robo_mate/
├── public/
│   ├── icons/                 # PWA icons (192x192, 512x512, apple-touch)
│   ├── manifest.json          # Web app manifest
│   ├── sw.js                  # Service worker (caching & web push)
│   └── offline.html           # Offline fallback page
├── src/
│   ├── app/
│   │   ├── (auth)/login/      # Private workspace login & recovery
│   │   ├── dashboard/         # Personal dashboard with stats, checklist, heatmap
│   │   ├── planner/           # Daily study planner with timer & rescheduling
│   │   ├── roadmap/           # 12-month curriculum timeline & activation
│   │   │   └── completion/    # Final 12-month achievement & portfolio page
│   │   ├── ai-tutor/          # Gemini AI tutor chat with code highlighting
│   │   ├── shared-journey/    # Co-founder synergy & peer progress view
│   │   ├── progress/          # Progress analytics, charts & distribution
│   │   ├── projects/          # Shared AMR robotics project manager
│   │   ├── resources/         # Curated textbooks, tutorials, and CAD links
│   │   ├── settings/          # Schedule customization, timezones, push alerts
│   │   └── api/               # Secure server-side routes
│   │       ├── ai/chat/       # Gemini chat endpoint
│   │       ├── ai/review/     # End-of-month AI review endpoint
│   │       ├── tasks/reschedule/ # Idempotent carry-forward scheduler
│   │       ├── roadmaps/activate/ # 365-day program generator
│   │       └── notifications/ # Push subscription & cron sender
│   ├── components/            # Reusable UI primitives & layouts
│   ├── contexts/              # AuthContext and ThemeContext
│   ├── lib/                   # Supabase clients, utils, seed curriculum
│   └── types/                 # Database and domain TypeScript types
├── supabase/
│   ├── migrations/            # 22-table PostgreSQL schema with strict RLS
│   └── seed.sql               # Seed data for 12-month program & AMR project
└── tests/                     # Node.js automated test suite (19 test cases)
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js >= 18 (Node 24 recommended)
- `pnpm` (or `npm`)
- A Supabase project ([supabase.com](https://supabase.com))
- A Google Gemini API Key ([aistudio.google.com](https://aistudio.google.com/app/apikey))

### 2. Installation
```bash
git clone https://github.com/your-username/robo_mate.git
cd robo_mate
pnpm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-2.0-flash

NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:admin@robomates.app

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

*To generate VAPID keys for Web Push, run:*
```bash
npx web-push generate-vapid-keys
```

### 4. Database Setup
1. In your Supabase Dashboard, open the **SQL Editor**.
2. Run the migration file: `supabase/migrations/20261102000000_init_schema.sql`.
3. Run the seed data script: `supabase/seed.sql`.

### 5. Run Automated Tests
```bash
pnpm test
```
*(All 19 unit & integration tests verify auth limits, rescheduling algorithms, AI context isolation, and PWA manifest validity).*

### 6. Start Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Production Build
```bash
pnpm build
pnpm start
```

---

## 🔒 Security & Privacy Guidelines
- **Strict Two-User Enclosure**: The database schema restricts workspace membership to 2 users max. Public registrations are rejected.
- **Service Role Isolation**: `SUPABASE_SERVICE_ROLE_KEY` is only used inside secure server API routes (e.g. background rescheduling) and is never sent to the client.
- **AI Tutor Privacy**: Chat messages and personal study reflections are protected by Row Level Security and are only visible to the user who created them.
