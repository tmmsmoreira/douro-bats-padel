# Project Context Prompt

You are working on **Padel Game Manager (Douro Bats)**, a comprehensive web application for managing padel game nights for the Dorobats padel community.

## Architecture Overview

This is a **Turborepo monorepo** with the following structure:

```
padel-game-manager/
├── apps/
│   ├── web/          # Next.js 16 frontend (App Router)
│   └── api/          # NestJS backend
├── packages/
│   ├── types/        # Shared TypeScript types
│   └── config/       # Shared ESLint & TypeScript configs
```

## Tech Stack

### Frontend (apps/web/)

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **State Management**: React Query + Zustand
- **Authentication**: NextAuth.js v5
- **Internationalization**: next-intl (supports English and Portuguese via `[lang]` routes)
- **PWA**: next-pwa (enabled in production)
- **Design**: Mobile-first, dark mode support, WCAG 2.2 AA compliant
- **Colors**: Green primary (#16a34a) with neutral grays

### Backend (apps/api/)

- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (access tokens: 15m, refresh tokens: 7d)
- **Email**: Resend with React Email templates
- **Validation**: class-validator

### DevOps

- **Monorepo**: Turborepo
- **Package Manager**: pnpm >= 8
- **Database**: Docker Compose
- **Deployment**: Vercel (frontend) + Fly.io/Render (backend)

## Core Features

### 1. RSVP System (First-Come-First-Served)

- Players register for events with capacity limits
- Automatic waitlist management
- Auto-promotion when confirmed players cancel
- RSVP cutoff enforcement with editor override capability
- Email notifications for confirmations and waitlist promotions

### 2. Smart Draw Generation

- **Seeded algorithm** for reproducibility (seed format: `{eventId}-{timestamp}-{random}`)
- **Constraints**: Avoids recent partners/opponents from last 4 sessions
- **Tier-based balancing**: Masters and Explorers tiers
- **Round-robin scheduling**: All teams play each other across multiple rounds
- **Court assignment**: Tier-specific courts (e.g., Masters: 8PM-9:30PM, Explorers: 9:30PM-11PM)
- Manual override capability with audit logging
- Each tier has independent round numbering starting from 1

### 3. Ranking System

**Scoring Rules:**

- **Masters Matches**: Winner = 300 + (20 × sets_won) | Loser = 20 × sets_won
- **Explorers Matches**: Winner = 200 + (15 × sets_won) | Loser = 15 × sets_won
- **Ties**: No base points, only per-set points
- Points split equally between team members

**Rating Calculation:**

- Weekly score = average points per round played in that week
- Rating = simple average of last 5 weeks (only weeks with scores > 0)
- Stored in `WeeklyScore` table with `weekStart` timestamp

**Tier Assignment (Dynamic Per Event):**

- Tiers are **NOT** a ranking category
- Assigned **per event** based on current ratings
- Players sorted by rating (highest to lowest)
- Top-rated players → Masters tier (better time slots/courts)
- Lower-rated players → Explorers tier
- A player's tier can change week-to-week based on relative performance

### 4. Role-Based Access Control

- **VIEWER**: Register for events, view draws/results, check rankings
- **EDITOR**: Manage events, generate draws, submit results
- **ADMIN**: Full system configuration, user management, send invitations

## Database Schema (Key Models)

### User

- Authentication (email/password + Google OAuth)
- Email verification (emailVerified, emailVerificationToken, emailVerificationExpires)
- Password reset (resetPasswordToken, resetPasswordExpires)
- Roles: VIEWER, EDITOR, ADMIN (array)
- One-to-one with PlayerProfile

### PlayerProfile

- rating: Int (current rating)
- status: String (ACTIVE/INACTIVE)
- Relations: rsvps, weeklyScores, rankingSnapshots

### Event

- State machine: DRAFT → OPEN → FROZEN → DRAWN → PUBLISHED
- RSVP windows: rsvpOpensAt, rsvpClosesAt
- Capacity management
- tierRules: JSON (defines mastersCourts, explorersCourts arrays)
- Relations: venue, draws, matches, rsvps, eventCourts

### RSVP

- Status: CONFIRMED, WAITLISTED, DECLINED, CANCELLED
- Tier assignment: MASTERS, EXPLORERS (assigned during draw generation)
- position: Int (for waitlist ordering)

### Draw

- seed: String (for reproducibility)
- constraints: JSON (avoidRecentSessions, etc.)
- isManual: Boolean (audit trail)

### Match

- round: Int (per-tier numbering, starts at 1)
- tier: MASTERS or EXPLORERS
- Results: teamAScore, teamBScore, winner
- Relations: court, event, draw

### WeeklyScore

- playerId + weekStart (composite unique key)
- score: Float (average points per round that week)

### Venue & Court

- Venues have multiple courts
- Courts assigned to events via EventCourt junction table

### Invitation

- Token-based user invitation system
- Status: PENDING, ACCEPTED, REVOKED, EXPIRED
- Sent by admins to invite new users

## User Flows

### Player Flow

1. Login → View upcoming events
2. Register (IN) → Get CONFIRMED or WAITLISTED
3. View draw when published (see court, round, partner, opponents)
4. Check results after event
5. View leaderboard and personal stats

### Editor Flow

1. Login → Admin panel
2. Create event (venue, capacity, RSVP windows, tier rules)
3. Publish event (DRAFT → OPEN) → Players can register
4. Freeze RSVPs (OPEN → FROZEN) → No more registrations
5. Generate draw (FROZEN → DRAWN) → Matchups created
6. Enter match results → Publish (DRAWN → PUBLISHED)
7. System auto-calculates rankings and updates ratings

## Email Notifications

Sent via Resend with React Email templates:

- RSVP opening announcements
- Registration confirmations
- Waitlist promotions
- Draw publication
- Results publication
- Email verification
- Password reset
- User invitations

## Development Commands

```bash
# Install dependencies
pnpm install

# Start PostgreSQL
docker-compose up -d

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Start dev servers (frontend + backend)
pnpm dev

# Build all apps
pnpm build

# Lint
pnpm lint

# Format code
pnpm format

# Prisma Studio
pnpm db:studio
```

## Demo Credentials (After Seeding)

- **Admin**: admin@dorobats.com / admin123
- **Editor**: tiago@dorobats.com / editor123
- **Player**: ana.costa@dorobats.com / player123

## Important Implementation Notes

1. **Event State Machine**: Always follow DRAFT → OPEN → FROZEN → DRAWN → PUBLISHED
2. **Tier Assignment**: Happens during draw generation, not stored permanently on players
3. **Round Numbering**: Each tier (Masters/Explorers) has independent round numbering starting from 1
4. **Ranking Updates**: Only triggered when event moves to PUBLISHED state
5. **RSVP Cutoff**: Enforced by comparing current time with rsvpClosesAt
6. **Draw Constraints**: Uses recent match history (last 4 sessions) to avoid repetitive pairings
7. **Internationalization**: All routes use `[lang]` parameter (e.g., `/en/events`, `/pt/events`)

## Current Status

- **M1 (MVP)**: ✅ Completed - Full RSVP, draw generation, results, and ranking system
- **M2 (Phase 2)**: 📋 Planned - WhatsApp integration, PWA notifications, advanced metrics
- **M3 (Phase 3)**: 🚀 Future - Stripe payments, tournaments, multi-venue support

When working on this project, always consider the role-based permissions, event state machine, and the dynamic tier assignment system. Maintain consistency with the existing architecture and follow the established patterns in both frontend and backend code.
