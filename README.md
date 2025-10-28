# Padel Game Manager (Dorobats)

A comprehensive web application for managing padel game nights, including player registrations, draw generation, results tracking, and automatic ranking with a 5-week moving average.

## 🏗️ Architecture

This is a **Turborepo monorepo** with the following structure:

\`\`\`
padel-game-manager/
├── apps/
│   ├── web/          # Next.js 16 frontend (App Router)
│   └── api/          # NestJS backend
├── packages/
│   ├── types/        # Shared TypeScript types
│   └── config/       # Shared ESLint & TypeScript configs
\`\`\`

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- Docker & Docker Compose (for PostgreSQL)

### Installation

1. **Clone and install dependencies:**

\`\`\`bash
pnpm install
\`\`\`

2. **Start PostgreSQL:**

\`\`\`bash
docker-compose up -d
\`\`\`

3. **Setup environment variables:**

\`\`\`bash
# API
cp apps/api/.env.example apps/api/.env

# Web
cp apps/web/.env.example apps/web/.env
\`\`\`

Edit the `.env` files with your configuration.

4. **Run database migrations:**

\`\`\`bash
cd apps/api
pnpm prisma migrate dev
\`\`\`

5. **Seed the database:**

\`\`\`bash
cd apps/api
pnpm prisma db seed
\`\`\`

6. **Start development servers:**

\`\`\`bash
# From root directory
pnpm dev
\`\`\`

- Frontend: http://localhost:3000
- API: http://localhost:4000
- Prisma Studio: `cd apps/api && pnpm prisma studio`

## 🎮 Demo Credentials

After seeding, you can login with:

- **Admin**: admin@dorobats.com / admin123
- **Editor**: tiago@dorobats.com / editor123
- **Player**: ana.costa@dorobats.com / player123

## 📊 Key Features

### 1. RSVP System (FCFS + Waitlist)

- First-come-first-served registration
- Automatic waitlist management
- Auto-promotion of waitlisted players on cancellations
- Cutoff enforcement with editor override

### 2. Draw Generation

- Seeded algorithm for reproducibility
- Constraints: avoid recent partners/opponents (last 4 sessions)
- Tier-based balancing (Masters/Explorers)
- Manual override with audit logging

### 3. Ranking System

**Scoring Rules:**

- **Masters**: Winner = 300 + 20×sets_won | Loser = 20×sets_won
- **Explorers**: Winner = 200 + 15×sets_won | Loser = 15×sets_won
- **Ties**: No base points, only per-set points
- Points split equally between team members

**Rating Calculation:**

- Weekly score = average points per round played
- Rating = simple average of last 5 weeks (scores > 0)
- Tier promotion at 300+ rating

### 4. Role-Based Access

- **Viewer**: Register, view draws/results, check rankings
- **Editor**: Manage events, generate draws, submit results
- **Admin**: Full system configuration and user management

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State**: React Query + Zustand
- **Auth**: NextAuth.js v5
- **PWA**: next-pwa (planned)

### Backend

- **Framework**: NestJS
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (access + refresh tokens)
- **Validation**: class-validator

### DevOps

- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Database**: Docker Compose
- **CI/CD**: GitHub Actions (planned)

## 📝 Available Scripts

\`\`\`bash
# Development
pnpm dev              # Start all apps in dev mode
pnpm build            # Build all apps
pnpm lint             # Lint all packages
pnpm format           # Format code with Prettier

# Database
pnpm db:migrate       # Run Prisma migrations
pnpm db:seed          # Seed database with test data
pnpm db:studio        # Open Prisma Studio
\`\`\`

## 🎨 Design System

- **Mobile-first** responsive design
- **Dark mode** support (system preference)
- **Accessibility**: WCAG 2.2 AA compliant
- **Components**: shadcn/ui library
- **Colors**: Green primary (#16a34a) with neutral grays

## 📱 User Flows

### Player Flow

1. Login → View upcoming events
2. Register for event (IN) → Get confirmed or waitlisted
3. View draw when published
4. Check results after event
5. View ranking and personal stats

### Editor Flow

1. Login → Admin panel
2. Create event with venue, capacity, RSVP windows
3. Publish event → Players can register
4. Freeze RSVPs → Generate draw
5. Enter match results → Publish
6. System auto-calculates rankings

## 🔐 Authentication

The system supports:

- **Email + Password** (with bcrypt hashing)
- **Google OAuth** (via NextAuth)
- **JWT tokens** (access 15m + refresh 7d)
- **2FA** (TOTP, optional - Phase 2)

## 📧 Notifications

Email notifications for:

- RSVP opening announcements
- Registration confirmations
- Waitlist promotions
- Draw publication
- Results publication

**Provider**: Postmark (stub implementation, ready for integration)

## 🗺️ Roadmap

### ✅ M1 (MVP - Completed)

- RSVP system with waitlist
- Draw generation engine
- Results submission
- Automatic ranking calculation
- Email notifications (stub)
- Mobile-responsive UI

### 📋 M2 (Phase 2)

- [ ] WhatsApp integration
- [ ] Push notifications (PWA)
- [ ] No-show policy enforcement
- [ ] Advanced metrics & reports
- [ ] Email service integration (Postmark)

### 🚀 M3 (Phase 3)

- [ ] Stripe payment integration
- [ ] Additional game formats
- [ ] Tournament brackets
- [ ] Multi-venue support

## 🧪 Testing

\`\`\`bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e
\`\`\`

## 📦 Deployment

### Frontend (Vercel)

\`\`\`bash
cd apps/web
vercel
\`\`\`

### Backend (Fly.io / Render)

\`\`\`bash
cd apps/api
# Follow platform-specific deployment guide
\`\`\`

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `pnpm lint` and `pnpm type-check`
4. Submit a pull request

## 📄 License

MIT

## 👥 Team

- **Owner**: Tiago Moreira
- **Version**: 0.1 (MVP)
- **Date**: 28-10-2025

---

Built with ❤️ for the Dorobats padel community
