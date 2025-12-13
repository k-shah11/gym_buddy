# Gym Buddy Accountability App

## Overview

A full-stack web application for tracking daily gym workouts with friends through a gamified "honey pot" competition system. Users swipe daily to log workouts, accumulate shared pots with buddies when they miss workouts, and compete weekly to avoid paying out accumulated coins. The app combines productivity tracking with playful, Duolingo-inspired engagement patterns.

**Core Concept:** Each user tracks one global daily workout status (worked/missed). Missing a workout adds 20 coins to all shared pots with buddies. Weekly competitions settle pots when exactly one partner fails to meet the 4-day workout minimum.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React with TypeScript using Vite as the build tool

**Routing:** Wouter for lightweight client-side routing with three main pages:
- `/` - Landing page with authentication
- `/home` - Daily swipe interface for logging workouts
- `/buddies` - Buddy management and pot overview
- `/dashboard` - Weekly calendar grid showing workout history

**State Management:** 
- TanStack Query (React Query) for server state with aggressive caching (staleTime: Infinity)
- Local React state for UI interactions
- Custom hooks for auth state (`useAuth`) and toast notifications (`useToast`)

**UI Components:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library (New York style) with custom Tailwind configuration
- Design system featuring Inter (body) and Nunito (headings) fonts
- Card-based layouts with rounded-2xl to rounded-3xl styling
- Hybrid design approach: productivity app clarity + playful personality

**Styling:**
- Tailwind CSS with CSS variables for theming
- Custom color system using HSL values for light/dark mode support
- Elevation system using box shadows (elevate-1, elevate-2)
- Responsive spacing primitives (2, 4, 6, 8, 12, 16)

**Responsive Design:**
- Mobile-first approach using Tailwind sm: breakpoint (640px+)
- Mobile layouts: Stacked vertically, icon-only buttons, compact spacing
- Desktop layouts: Horizontal grids, text buttons, expanded spacing
- Key responsive components:
  - WeekGrid: Stacks week label + count on top, days grid below on mobile; horizontal on desktop
  - BuddyCard: Avatar/info on top, pot/badge below on mobile; horizontal on desktop
  - AddBuddyDialog: Icon-only trigger on mobile, text button on desktop
  - Invitation cards: Stacked layout on mobile, horizontal on desktop
- All icon-only buttons have aria-labels for accessibility

### Backend Architecture

**Server Framework:** Express.js with TypeScript running on Node.js

**Development vs Production:**
- Development: Vite middleware for HMR and dev server (`server/index-dev.ts`)
- Production: Pre-built static files served via Express (`server/index-prod.ts`)

**API Design:**
- RESTful endpoints under `/api` namespace
- Session-based authentication with express-session
- Request/response logging with duration tracking
- Error handling with 401 redirects for unauthorized requests

**Key API Routes:**
- `GET /api/auth/user` - Fetch authenticated user
- `POST /api/workouts` - Log daily workout
- `GET /api/buddies` - Get user's buddy pairs
- `POST /api/buddies` - Add new buddy
- `GET /api/invitations/*` - Manage buddy invitations
- `GET /api/workouts/history` - Fetch weekly workout data
- `POST /api/buddies/:pairId/pause-request` - Request to pause/resume competition
- `GET /api/pause-requests` - Get pending pause requests
- `POST /api/buddies/:pairId/reset-pot-request` - Request to reset pot balance
- `GET /api/reset-pot-requests` - Get pending reset pot requests

**Authentication Strategy:**
- Replit Auth using OpenID Connect (OIDC) with passport.js
- Session storage in PostgreSQL using connect-pg-simple
- User data synced from OIDC claims to database

### Data Storage

**Database:** PostgreSQL with Drizzle ORM

**Schema Design:**

**Users Table:**
- Stores user accounts from Replit Auth
- Fields: id, email, firstName, lastName, profileImageUrl, timestamps

**Pairs Table:**
- Represents buddy relationships with shared honey pots
- Fields: id, userAId, userBId, potBalance (integer coins), timestamps
- Unique constraint ensures no duplicate pairs (normalized: userA < userB)
- Indexes on both user ID columns for efficient lookups

**Workouts Table:**
- Global daily workout status per user (not per pair)
- Fields: id, userId, date, status (enum: 'worked' | 'missed'), timestamps
- Unique constraint on (userId, date) prevents duplicate entries
- Indexes on userId and date for weekly queries

**Settlements Table:**
- Records weekly pot settlements between pairs
- Fields: id, pairId, weekStartDate, winnerId, loserId, amount, timestamps
- Tracks competition outcomes when one partner fails 4-day minimum

**Buddy Invitations Table:**
- Manages pending buddy requests
- Fields: id, inviterId, inviteeEmail, status, timestamps
- Allows inviting users who haven't signed up yet

**Sessions Table:**
- Stores express-session data for Replit Auth
- Fields: sid (primary key), sess (jsonb), expire (timestamp)

**Connection Management:**
- Node-postgres connection pool (max: 20 connections)
- Connection timeout: 2000ms
- Idle timeout: 30000ms
- Error handling for connection failures

**Database Initialization:**
- Schema creation on first startup via `initializeDatabase()`
- Timeout protection (10s) for connection attempts
- Graceful handling of existing schemas

### Business Logic

**Workout Flow:**
1. User logs workout via swipe gesture or button (worked/missed)
2. Single daily status stored in workouts table
3. If missed: increment potBalance by 20 for ALL pairs where user is a member
4. Update triggers invalidation of buddies and stats queries

**Weekly Settlement Logic:**
1. Week defined as Monday-Sunday
2. Count workouts per user per week
3. For each pair:
   - Both ≥4 days: pot continues accumulating
   - Exactly one <4 days: that person loses, pot paid out and reset
   - Both <4 days: no settlement, pot continues
4. Settlement recorded in settlements table with winner/loser/amount

**Pot Calculation:**
- Base: 20 coins per missed workout
- Accumulates across multiple weeks if both partners meet 4-day minimum
- Resets to 0 after settlement
- Displayed in UI with currency symbol (₹ for rupees)

## External Dependencies

**UI Framework:**
- React 18+ with TypeScript
- Wouter for routing
- TanStack Query for server state management

**Component Libraries:**
- Radix UI primitives (@radix-ui/react-*)
- shadcn/ui components built on Radix
- lucide-react for icons

**Styling:**
- Tailwind CSS with PostCSS
- class-variance-authority for component variants
- clsx and tailwind-merge for class merging

**Backend Framework:**
- Express.js with TypeScript
- Node.js runtime

**Authentication:**
- Replit Auth (OpenID Connect) via openid-client and passport
- express-session for session management
- connect-pg-simple for PostgreSQL session storage

**Database:**
- PostgreSQL (compatible with Neon and Railway)
- Drizzle ORM for type-safe queries
- drizzle-kit for migrations
- node-postgres (pg) for connection pooling

**Development Tools:**
- Vite for frontend bundling and dev server
- esbuild for production server bundling
- tsx for running TypeScript in development
- Playwright for E2E testing

**Deployment Platforms:**
- Vercel (frontend hosting option)
- Railway (backend/database hosting)
- Replit (primary development environment)

**Build Configuration:**
- TypeScript with strict mode
- ESNext modules
- Path aliases (@/, @shared/, @assets/)
- Incremental compilation with build cache

**Testing:**
- Playwright configured for Chromium
- E2E tests for auth, buddy management, workouts, settlements
- Test data IDs throughout components for reliable selectors