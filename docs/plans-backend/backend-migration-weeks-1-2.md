# Backend Migration Plan: Weeks 1-2
## Next.js + Neon Postgres + Drizzle + BetterAuth

**Goal:** Migrate from AWS Cognito backend to Next.js full-stack with BetterAuth (email/password), Neon Postgres, and Drizzle ORM. Establish database foundation and authentication system.

**Scope:** Week 1 (Database Setup) + Week 2 (Authentication & API Routes)

---

## Week 1: Project Setup & Database Foundation

### 1.1 Install Dependencies ✅

**New dependencies added:**
- `better-auth` - Authentication library (v1.3.4)
- `@neondatabase/serverless` - Neon Postgres client
- `drizzle-orm` - ORM (v0.36.0)
- `drizzle-kit` - Migration tool (dev, v0.31.0)
- `tsx` - TypeScript execution for seed scripts (dev)
- `dotenv` - Environment variables (dev)

**Scripts added:**
- `db:generate` - Generate migration files
- `db:migrate` - Run migrations
- `db:push` - Push schema to database
- `db:studio` - Open Drizzle Studio
- `db:seed` - Run seed script

### 1.2 Database Configuration ✅

**Files created:**
- `drizzle.config.ts` - Drizzle configuration with Neon provider support
- `lib/db/index.ts` - Database client initialization with Neon serverless
- `lib/db/schema/index.ts` - Schema exports

### 1.3 Database Schema ✅

**Schema files created:**
- `lib/db/schema/users.ts` - Users table with BetterAuth tables (accounts, sessions, verificationTokens)
- `lib/db/schema/mentors.ts` - Mentors and expertise tables
- `lib/db/schema/mentees.ts` - Mentees table
- `lib/db/schema/sessions.ts` - Office sessions and availability tables
- `lib/db/schema/events.ts` - Events/audit log table

**Relations defined:**
- User → Mentor (one-to-one)
- User → Mentee (one-to-one)
- Mentor → Expertise (one-to-many)
- Mentor → Availability (one-to-many)
- Mentor → OfficeSessions (one-to-many)
- Mentee → OfficeSessions (one-to-many)

### 1.4 Database Migrations ✅

**Migration process:**
- Use `npm run db:generate` to create migration files
- Migrations stored in `lib/db/migrations/` (auto-generated)
- Use `npm run db:push` for development or `npm run db:migrate` for production

### 1.5 Database Seeding ✅

**Files created:**
- `lib/db/seed.ts` - Seed script for development data
- `lib/db/seed-data.ts` - Seed data constants

**Seed data includes:**
- 1 admin user
- 5 mentor users with profiles, expertise, and availability
- 5 mentee users with profiles

### 1.6 Constants & Utilities ✅

**Files created:**
- `lib/constants/db.ts` - Database-related constants
- `lib/constants/auth.ts` - Auth-related constants (roles, statuses, visibility, session status)
- `lib/utils/db-errors.ts` - Database error handling utilities
- `lib/utils/api-errors.ts` - API error response utilities

---

## Week 2: Authentication & Core API Routes

### 2.1 BetterAuth Setup ✅

**Files created:**
- `lib/auth/config.ts` - BetterAuth configuration with Drizzle adapter
- `app/api/auth/[...all]/route.ts` - BetterAuth API route handler

**Configuration:**
- Email/password authentication enabled
- No email verification (requireEmailVerification: false)
- Auto sign-in after sign-up
- Drizzle adapter with PostgreSQL provider

### 2.2 Auth Utilities & Helpers ✅

**Files created:**
- `lib/auth/server.ts` - Server-side auth helpers (getSession, requireAuth, requireRole)
- `lib/auth/client.ts` - Client-side auth helpers

**Files updated:**
- `lib/hooks/useAuth.ts` - Updated to use BetterAuth instead of Cognito
- `lib/api/auth.ts` - Updated API calls to use BetterAuth endpoints

### 2.3 API Client Updates ✅

**Files updated:**
- `lib/api/client.ts` - Updated to use BetterAuth session (cookies) instead of Cognito tokens
- Removed Cognito-specific interceptors
- Added withCredentials for cookie-based auth

### 2.4 Profile API Routes ✅

**Files created:**
- `app/api/profiles/[id]/route.ts` - GET/PUT profile by ID
- `app/api/profiles/me/route.ts` - GET current user profile
- `app/api/profiles/route.ts` - GET all profiles (admin only)
- `lib/validations/profiles.ts` - Zod schemas for profile validation

**Route handlers:**
- GET `/api/profiles/[id]` - Get profile by ID (with relations)
- PUT `/api/profiles/[id]` - Update own profile (authorization check)
- GET `/api/profiles/me` - Get current user profile
- GET `/api/profiles` - List all profiles (admin only)

### 2.5 Type Updates

**Files to update:**
- `types/index.ts` - Update User type to match BetterAuth + database schema

### 2.6 Environment Variables ✅

**Required environment variables:**
- `DATABASE_URL` - Neon Postgres connection string
- `BETTER_AUTH_SECRET` - Secret for BetterAuth (min 32 chars)
- `BETTER_AUTH_URL` - Base URL for auth callbacks
- `NEXT_PUBLIC_BETTER_AUTH_URL` - Public URL for client-side auth (optional, defaults to BETTER_AUTH_URL)
- `NODE_ENV` - Environment (development/production)

---

## Implementation Details

### Version Compatibility

**Verified Compatible Versions:**
- Next.js 14.2.0 ✅
- Better Auth v1.3.x ✅
- Drizzle ORM v0.36.0 ✅
- Neon Serverless latest ✅
- React 18.2.0 ✅

**Key Compatibility Notes:**
1. Better Auth's Drizzle adapter works out-of-the-box with PostgreSQL/Neon
2. Neon serverless driver works in both Edge and Node.js runtimes
3. Drizzle Kit supports Neon via `provider: 'neon'` config option
4. No additional password hashing libraries needed (Better Auth handles this)

### Database Schema Notes

**Users table:**
- Extends BetterAuth user schema
- Additional fields: role, status, lastLoginAt
- Role enum: 'mentor', 'mentee', 'admin', 'pm'
- Status enum: 'active', 'inactive', 'suspended'

**BetterAuth Integration:**
- Sessions stored in database (via Drizzle adapter)
- Password hashing handled automatically by Better Auth
- No manual bcrypt needed

### Error Handling Strategy

**Centralized error handling:**
- Database errors → map to user-friendly messages
- API errors → consistent error response format
- Validation errors → return Zod error details
- Auth errors → return appropriate HTTP status codes

**Error response format:**
```typescript
{
  error: string;
  code?: string;
  details?: unknown;
}
```

### Code Reuse Patterns

**Reusable utilities:**
- Database query helpers (safe query execution)
- Response formatters (consistent API responses)
- Validation helpers (Zod schema reuse)
- Auth middleware (requireAuth, requireRole)

---

## File Structure

```
lib/
  db/
    schema/
      users.ts ✅
      mentors.ts ✅
      mentees.ts ✅
      sessions.ts ✅
      events.ts ✅
      index.ts ✅
    migrations/
      (auto-generated)
    seed.ts ✅
    seed-data.ts ✅
    index.ts ✅
  auth/
    config.ts ✅
    server.ts ✅
    client.ts ✅
  constants/
    db.ts ✅
    auth.ts ✅
    roles.ts (existing)
  utils/
    db-errors.ts ✅
    api-errors.ts ✅
  api/
    auth.ts (updated) ✅
    client.ts (updated) ✅
  hooks/
    useAuth.ts (updated) ✅
  validations/
    profiles.ts ✅

app/
  api/
    auth/
      [...all]/
        route.ts ✅
    profiles/
      [id]/
        route.ts ✅
      me/
        route.ts ✅
      route.ts ✅

drizzle.config.ts ✅
package.json (updated) ✅
```

---

## Success Criteria

**Week 1:**
- ✅ Database schema created
- ✅ Seed script created
- ✅ Constants and utilities created
- ⏳ Migrations need to be run (requires DATABASE_URL)
- ⏳ Seed script needs to be tested (requires DATABASE_URL)

**Week 2:**
- ✅ BetterAuth configured
- ✅ Auth utilities created
- ✅ Profile API routes created
- ✅ API client updated
- ✅ useAuth hook updated
- ⏳ Testing required (requires DATABASE_URL and BETTER_AUTH_SECRET)

---

## Next Steps

1. **Set up environment variables:**
   - Create `.env.local` with DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL
   - Run `npm install` to install new dependencies

2. **Run migrations:**
   - `npm run db:generate` - Generate migration files
   - `npm run db:push` - Push schema to database (development)
   - Or `npm run db:migrate` - Run migrations (production)

3. **Seed database:**
   - `npm run db:seed` - Populate with test data

4. **Test authentication:**
   - Test sign up flow
   - Test sign in flow
   - Test profile API routes
   - Test authorization checks

5. **Update frontend:**
   - Update signup/login pages to use BetterAuth
   - Remove Cognito dependencies
   - Test end-to-end flows

---

## Notes

- BetterAuth handles password hashing automatically - no bcryptjs needed
- Sessions are stored in database via Drizzle adapter
- Email verification is disabled for now (can be enabled later)
- Profile API routes include proper authorization checks
- Error handling is centralized and consistent

