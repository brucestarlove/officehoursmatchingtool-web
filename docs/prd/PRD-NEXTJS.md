# Technical Product Requirements Document (T-PRD)
## AI-Powered Office Hours Matching Platform
## Next.js Full-Stack Implementation

**Project:** CF Mentor-Mentee Matching System  
**Audience:** AI Engineer (for phased implementation)  
**Focus:** Intelligent matching system with beautiful, intuitive UX  
**Architecture:** Next.js full-stack on Vercel

---

## Vision & Core Philosophy

Build an AI-powered matching platform that feels **effortless and delightful** for users while delivering **exceptionally accurate mentor-mentee pairings**. The system should handle complexity invisibly—users experience simplicity, while sophisticated matching logic, embedding strategies, and data orchestration work behind the scenes.

**Design Principle:** Beautiful UI/UX is non-negotiable. Every interaction should feel intuitive, responsive, and purposeful.

**Technical Ambition:** Master intelligent matching through vector embeddings, hybrid search strategies, and multi-signal ranking algorithms that continuously improve.

---

## Success Metrics (Recap)

- **Mentor Utilization:** >90% (from current <75%)
- **Match Quality:** Average session feedback ≥4.5/5
- **Platform Growth:** 30% increase in booked sessions within 6 months
- **Adoption:** 70% of existing mentors/mentees active within Q1
- **Engagement Distribution:** Even utilization across expertise areas

---

## Technical Stack

### Frontend & Backend (Unified)
- **Framework:** Next.js 14+ with App Router and TypeScript
- **Deployment:** Vercel (with Edge Runtime where beneficial)
- **State Management:** TanStack Query (server state), Zustand (UI state)
- **Auth:** NextAuth.js v5 (Auth.js)
- **API:** Next.js API Routes (Route Handlers)

### Data Layer
- **Primary DB:** PostgreSQL (Vercel Postgres, Supabase, or Neon)
- **ORM:** Drizzle ORM
- **Vector Store:** Upstash Vector (via Vercel integration)
- **Cache:** Upstash Redis (via Vercel integration)
- **File Storage:** Vercel Blob Storage

### Background Jobs & Workers
- **Cron Jobs:** Vercel Cron
- **Long-running Tasks:** Inngest (or Trigger.dev)
- **Queue:** Upstash QStash for deferred tasks

### AI & Matching
- **Framework:** Vercel AI SDK
- **Embeddings:** OpenAI text-embedding-3-small
- **Vector Search:** Upstash Vector (cosine similarity)
- **LLM:** OpenAI GPT-4o-mini for query processing

### Integrations
- **CRM:** Airtable (webhook sync via API routes)
- **Email:** Resend (Vercel-native email service)
- **Calendar:** Google Calendar/Outlook via OAuth (Phase 3)
- **SMS:** Twilio (Phase 3)

### Infrastructure & DevOps
- **Hosting:** Vercel
- **Secrets:** Vercel Environment Variables (encrypted)
- **Monitoring:** Vercel Analytics + Sentry
- **Logs:** Vercel Logs + Axiom (optional)

---

## System Architecture Overview

```
┌─────────────────────────────────────────────┐
│         Next.js App (Vercel)                │
│  ┌─────────────┐      ┌─────────────────┐  │
│  │  React UI   │ ───> │  API Routes     │  │
│  │  (App Dir)  │      │  /api/*         │  │
│  └─────────────┘      └─────────────────┘  │
│         │                      │            │
│         │                      ▼            │
│         │         ┌────────────────────┐   │
│         └────────>│   NextAuth.js      │   │
│                   └────────────────────┘   │
└──────────────────────┬──────────────────────┘
                       │
         ┌─────────────┼─────────────────┐
         │             │                 │
         ▼             ▼                 ▼
  ┌───────────┐  ┌──────────┐    ┌──────────────┐
  │ PostgreSQL│  │ Upstash  │    │   Upstash    │
  │ (Drizzle) │  │  Vector  │    │    Redis     │
  └───────────┘  └──────────┘    └──────────────┘
         │
         ▼
  ┌──────────────┐
  │   Airtable   │
  │  (Webhook)   │
  └──────────────┘
```

**Key Data Flows:**
1. **Profile Updates:** Airtable webhook → `/api/webhooks/airtable` → Postgres upsert → Inngest job → Embedding builder
2. **Matching:** User query → `/api/match` → Embed query → Upstash Vector search → Business rules/rerank → Results
3. **Session Booking:** UI → `/api/sessions/book` → Postgres transaction → QStash enqueue → Email confirmation
4. **Analytics:** Vercel Cron → Refresh materialized views → Dashboard queries

---

## Core Features & Phased Implementation

### Phase 1: Foundation & Basic Matching (MVP)
**Goal:** Establish data infrastructure, basic AI matching, and core booking flow

**Features:**
- User authentication (NextAuth.js)
- Profile management (sync with Airtable)
- Basic availability calendar for mentors
- **Simple vector search matching**: Mentee goals/description → embedding → Upstash Vector cosine similarity search with metadata filters
- Session booking flow (create, confirm, cancel)
- Email notifications (booking confirmations, reminders via Resend)
- Admin dashboard (basic session list, mentor utilization metrics)

**Deliverables:**
- Drizzle schema with migrations
- Upstash Vector index setup
- API routes: `/api/auth/*`, `/api/profiles/*`, `/api/availability/*`, `/api/sessions/*`, `/api/match`
- Next.js UI: Onboarding, profile, search/match results, booking
- Airtable webhook integration via API route
- Background workers: Inngest functions for `airtable-sync`, `embedding-builder`, `email-sender`

**AI/Matching Focus:**
- Text embedding pipeline (mentor bios, expertise, mentee goals)
- Upstash Vector index with metadata filtering
- Basic cosine similarity search with filters

---

### Phase 2: Intelligent Matching & Feedback Loop
**Goal:** Enhance matching accuracy with hybrid search, reranking, and feedback integration

**Features:**
- **Hybrid search**: Vector similarity + PostgreSQL full-text search + structured filters
- **Multi-signal ranking**: Combine vector score with:
  - Recency of mentor activity
  - Historical session quality scores
  - Mentor load balancing (promote underutilized mentors)
  - Mutual connection strength (if applicable)
- Post-session feedback system (structured ratings + optional comments)
- Feedback → embedding update loop
- Enhanced admin analytics (match quality trends, feedback analysis)
- Export functionality (session data, feedback reports)

**Deliverables:**
- Advanced matching algorithm with reranking logic
- Feedback schema + API routes: `/api/sessions/[id]/feedback`
- Analytics materialized views (or cron-refreshed tables)
- Vercel Cron for nightly analytics refresh
- UI improvements: Match result explanations, feedback forms

**AI/Matching Focus:**
- LLM-based query expansion (GPT-4o-mini for parsing mentee goals)
- Weighted scoring: `final_score = α·vector_similarity + β·recency + γ·feedback_score + δ·availability_match`
- A/B test framework for ranking algorithm iterations
- Embedding refresh strategy (triggers via Inngest)

---

### Phase 3: Advanced Features & Optimization
**Goal:** Calendar integration, proactive matching, performance optimization

**Features:**
- **Google Calendar / Outlook sync** (two-way availability sync)
- **Auto-meeting generation** (Google Meet invites)
- SMS notifications for urgent reminders (Twilio)
- **Proactive matching suggestions**: Daily recommendation emails
- **Mentor discovery mode**: Browse curated mentor recommendations
- Advanced search filters
- Performance optimizations (Redis caching, query tuning)

**Deliverables:**
- Calendar API integrations (OAuth flows via NextAuth providers)
- SMS provider integration (Twilio)
- Recommendation engine (Vercel Cron generates daily suggestions)
- Upstash Redis for hot query cache and rate limiting
- Edge runtime optimization for critical paths

**AI/Matching Focus:**
- Session outcome prediction model (collaborative filtering)
- Temporal matching (time-sensitive needs, urgent requests)
- Cold-start problem solving (new mentors/mentees with minimal data)

---

## Database Schema (Drizzle ORM)

### Core Tables

```typescript
// schema/users.ts
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  emailVerified: timestamp('email_verified'),
  image: text('image'),
  role: text('role', { enum: ['mentee', 'mentor', 'admin', 'pm'] }).default('mentee'),
  status: text('status', { enum: ['active', 'inactive', 'suspended'] }).default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
});

export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => ({
  compoundKey: unique().on(account.provider, account.providerAccountId),
}));

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionToken: text('session_token').notNull().unique(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  expires: timestamp('expires').notNull(),
});

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires').notNull(),
}, (vt) => ({
  compoundKey: unique().on(vt.identifier, vt.token),
}));

// schema/mentors.ts
export const mentors = pgTable('mentors', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  airtableRecordId: text('airtable_record_id').unique(),
  headline: text('headline'),
  bio: text('bio'),
  company: text('company'),
  title: text('title'),
  industry: text('industry'),
  stage: text('stage'),
  timezone: text('timezone'),
  visibility: text('visibility', { enum: ['public', 'private', 'limited'] }).default('public'),
  loadCapPerWeek: integer('load_cap_per_week').default(5),
  active: boolean('active').default(true),
  photoUrl: text('photo_url'),
  linkedinUrl: text('linkedin_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Full-text search vector (generated column in SQL)
// ALTER TABLE mentors ADD COLUMN search_vector tsvector GENERATED ALWAYS AS ...

export const expertise = pgTable('expertise', {
  id: uuid('id').defaultRandom().primaryKey(),
  mentorId: uuid('mentor_id').references(() => mentors.id, { onDelete: 'cascade' }).notNull(),
  area: text('area').notNull(),
  subarea: text('subarea'),
  weight: real('weight').default(1.0),
});

// schema/mentees.ts
export const mentees = pgTable('mentees', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  company: text('company'),
  stage: text('stage'),
  industry: text('industry'),
  goals: text('goals'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// schema/availability.ts
export const availability = pgTable('availability', {
  id: uuid('id').defaultRandom().primaryKey(),
  mentorId: uuid('mentor_id').references(() => mentors.id, { onDelete: 'cascade' }).notNull(),
  startsAt: timestamp('starts_at').notNull(),
  endsAt: timestamp('ends_at').notNull(),
  capacity: integer('capacity').default(1),
  location: text('location').default('virtual'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// schema/sessions.ts
export const officeSessions = pgTable('office_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  mentorId: uuid('mentor_id').references(() => mentors.id, { onDelete: 'cascade' }).notNull(),
  menteeId: uuid('mentee_id').references(() => mentees.id, { onDelete: 'cascade' }).notNull(),
  startsAt: timestamp('starts_at').notNull(),
  endsAt: timestamp('ends_at').notNull(),
  status: text('status', { 
    enum: ['pending', 'booked', 'completed', 'cancelled', 'no_show'] 
  }).default('booked'),
  meetingUrl: text('meeting_url'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sessionFeedback = pgTable('session_feedback', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').references(() => officeSessions.id, { onDelete: 'cascade' }).notNull(),
  submitterRole: text('submitter_role', { enum: ['mentor', 'mentee'] }).notNull(),
  overallRating: integer('overall_rating'),
  expertiseRating: integer('expertise_rating'),
  communicationRating: integer('communication_rating'),
  helpfulnessRating: integer('helpfulness_rating'),
  feedbackText: text('feedback_text'),
  topicsDiscussed: text('topics_discussed').array(),
  goalsAchieved: boolean('goals_achieved'),
  wouldRecommend: boolean('would_recommend'),
  followUpNeeded: boolean('follow_up_needed'),
  positiveTags: text('positive_tags').array(),
  improvementTags: text('improvement_tags').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (sf) => ({
  uniqueSubmission: unique().on(sf.sessionId, sf.submitterRole),
}));

// schema/events.ts
export const events = pgTable('events', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  occurredAt: timestamp('occurred_at').defaultNow().notNull(),
  actorUserId: uuid('actor_user_id').references(() => users.id),
  type: text('type').notNull(),
  entity: text('entity'),
  entityId: uuid('entity_id'),
  props: jsonb('props').default({}),
});
```

### Upstash Vector Storage

Instead of storing embeddings in PostgreSQL, we'll use Upstash Vector:

```typescript
// lib/vector.ts
import { Index } from '@upstash/vector';

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

export interface MentorEmbedding {
  id: string; // mentor_id
  vector: number[]; // 1536-dim embedding
  metadata: {
    mentorId: string;
    model: string;
    industry?: string;
    stage?: string;
    expertise: string[];
    active: boolean;
    updatedAt: string;
  };
}

export async function upsertMentorEmbedding(embedding: MentorEmbedding) {
  await index.upsert({
    id: embedding.id,
    vector: embedding.vector,
    metadata: embedding.metadata,
  });
}

export async function searchMentors(
  queryVector: number[],
  filters?: {
    industry?: string;
    stage?: string;
    expertise?: string[];
  },
  topK: number = 20
) {
  // Upstash Vector supports metadata filtering
  const filter = filters ? buildMetadataFilter(filters) : undefined;
  
  const results = await index.query({
    vector: queryVector,
    topK,
    filter,
    includeMetadata: true,
  });
  
  return results.map(r => ({
    mentorId: r.metadata?.mentorId,
    similarity: r.score,
    metadata: r.metadata,
  }));
}

function buildMetadataFilter(filters: any) {
  // Upstash Vector filter syntax
  const conditions = [];
  
  if (filters.industry) {
    conditions.push(`industry = "${filters.industry}"`);
  }
  if (filters.stage) {
    conditions.push(`stage = "${filters.stage}"`);
  }
  if (filters.expertise?.length) {
    conditions.push(`expertise IN [${filters.expertise.map((e: string) => `"${e}"`).join(',')}]`);
  }
  conditions.push('active = true');
  
  return conditions.join(' AND ');
}
```

---

## API Routes Structure

```
/app/api/
  ├── auth/
  │   └── [...nextauth]/
  │       └── route.ts          # NextAuth configuration
  ├── profiles/
  │   ├── [id]/
  │   │   └── route.ts          # GET, PUT profile
  │   └── route.ts              # GET all (admin)
  ├── availability/
  │   ├── [mentorId]/
  │   │   └── route.ts          # GET, PUT availability
  │   └── check-conflicts/
  │       └── route.ts          # POST conflict detection
  ├── match/
  │   ├── route.ts              # POST search/match
  │   └── suggestions/
  │       └── route.ts          # GET recommendations (Phase 3)
  ├── sessions/
  │   ├── route.ts              # GET list, POST create
  │   ├── [id]/
  │   │   ├── route.ts          # GET, PUT, DELETE session
  │   │   └── feedback/
  │   │       └── route.ts      # POST feedback
  │   └── upcoming/
  │       └── route.ts          # GET upcoming sessions
  ├── admin/
  │   ├── analytics/
  │   │   └── route.ts          # GET dashboard metrics
  │   ├── mentors/
  │   │   └── route.ts          # GET all mentors, metrics
  │   └── export/
  │       └── route.ts          # GET CSV exports
  ├── webhooks/
  │   └── airtable/
  │       └── route.ts          # POST Airtable updates
  └── cron/
      ├── refresh-analytics/
      │   └── route.ts          # GET refresh materialized views
      └── daily-recommendations/
          └── route.ts          # GET generate recommendations
```

---

## Background Jobs with Inngest

Instead of SQS/Lambda workers, we'll use Inngest for reliable background jobs:

```typescript
// inngest/client.ts
import { Inngest } from 'inngest';

export const inngest = new Inngest({ 
  id: 'mentor-matcher',
  eventKey: process.env.INNGEST_EVENT_KEY,
});

// inngest/functions/embedding-builder.ts
import { inngest } from '../client';
import { generateEmbedding } from '@/lib/openai';
import { upsertMentorEmbedding } from '@/lib/vector';
import { db } from '@/lib/db';

export const buildMentorEmbedding = inngest.createFunction(
  { id: 'build-mentor-embedding' },
  { event: 'mentor/updated' },
  async ({ event, step }) => {
    const { mentorId } = event.data;
    
    // Fetch mentor profile
    const mentor = await step.run('fetch-mentor', async () => {
      return await db.query.mentors.findFirst({
        where: (mentors, { eq }) => eq(mentors.id, mentorId),
        with: {
          expertise: true,
          user: true,
        },
      });
    });
    
    if (!mentor) return { error: 'Mentor not found' };
    
    // Build embedding text
    const embeddingText = await step.run('build-text', async () => {
      return [
        mentor.headline,
        mentor.bio,
        `Company: ${mentor.company}`,
        `Title: ${mentor.title}`,
        `Industry: ${mentor.industry}`,
        `Stage: ${mentor.stage}`,
        mentor.expertise.map(e => e.area).join(', '),
      ].filter(Boolean).join('\n\n');
    });
    
    // Generate embedding
    const embedding = await step.run('generate-embedding', async () => {
      return await generateEmbedding(embeddingText);
    });
    
    // Store in Upstash Vector
    await step.run('store-embedding', async () => {
      await upsertMentorEmbedding({
        id: mentorId,
        vector: embedding,
        metadata: {
          mentorId,
          model: 'text-embedding-3-small',
          industry: mentor.industry || undefined,
          stage: mentor.stage || undefined,
          expertise: mentor.expertise.map(e => e.area),
          active: mentor.active,
          updatedAt: new Date().toISOString(),
        },
      });
    });
    
    return { success: true, mentorId };
  }
);

// inngest/functions/email-sender.ts
export const sendSessionEmail = inngest.createFunction(
  { id: 'send-session-email' },
  { event: 'session/booked' },
  async ({ event, step }) => {
    const { sessionId } = event.data;
    
    const session = await step.run('fetch-session', async () => {
      return await db.query.officeSessions.findFirst({
        where: (sessions, { eq }) => eq(sessions.id, sessionId),
        with: {
          mentor: { with: { user: true } },
          mentee: { with: { user: true } },
        },
      });
    });
    
    if (!session) return { error: 'Session not found' };
    
    // Send to mentee
    await step.run('email-mentee', async () => {
      await sendEmail({
        to: session.mentee.user.email,
        subject: `Session Confirmed with ${session.mentor.user.name}`,
        template: 'booking-confirmation-mentee',
        data: {
          menteeName: session.mentee.user.name,
          mentorName: session.mentor.user.name,
          startsAt: session.startsAt,
          meetingUrl: session.meetingUrl,
        },
      });
    });
    
    // Send to mentor
    await step.run('email-mentor', async () => {
      await sendEmail({
        to: session.mentor.user.email,
        subject: `New Session Booked with ${session.mentee.user.name}`,
        template: 'booking-confirmation-mentor',
        data: {
          mentorName: session.mentor.user.name,
          menteeName: session.mentee.user.name,
          startsAt: session.startsAt,
          menteeGoals: session.mentee.goals,
        },
      });
    });
    
    return { success: true, sessionId };
  }
);
```

Expose Inngest handler:

```typescript
// app/api/inngest/route.ts
import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { buildMentorEmbedding, sendSessionEmail } from '@/inngest/functions';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    buildMentorEmbedding,
    sendSessionEmail,
    // ... other functions
  ],
});
```

---

## Email Service (Resend)

```typescript
// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(params: {
  to: string;
  subject: string;
  template: string;
  data: any;
}) {
  const html = await renderEmailTemplate(params.template, params.data);
  
  await resend.emails.send({
    from: 'Office Hours <noreply@capitalfactory.com>',
    to: params.to,
    subject: params.subject,
    html,
  });
}

async function renderEmailTemplate(template: string, data: any): Promise<string> {
  // Use React Email templates
  const templates = {
    'booking-confirmation-mentee': BookingConfirmationMentee,
    'booking-confirmation-mentor': BookingConfirmationMentor,
    'feedback-request': FeedbackRequest,
    'daily-recommendations': DailyRecommendations,
  };
  
  const Template = templates[template];
  if (!Template) throw new Error(`Unknown template: ${template}`);
  
  const { render } = await import('@react-email/render');
  return render(<Template {...data} />);
}
```

---

## Cron Jobs (Vercel Cron)

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/refresh-analytics",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/daily-recommendations",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/cron/session-reminders",
      "schedule": "0 * * * *"
    }
  ]
}
```

```typescript
// app/api/cron/refresh-analytics/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  // Refresh materialized views (or recompute analytics tables)
  await db.execute(sql`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_mentor_utilization`);
  await db.execute(sql`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_mentor_feedback`);
  await db.execute(sql`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_match_quality_daily`);
  
  return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
}
```

---

## Caching with Upstash Redis

```typescript
// lib/cache.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function cachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // Try cache first
  const cached = await redis.get<T>(key);
  if (cached) return cached;
  
  // Cache miss: fetch and store
  const data = await fetcher();
  await redis.setex(key, ttlSeconds, data);
  
  return data;
}

export async function invalidateCache(pattern: string) {
  // Upstash Redis supports SCAN for key patterns
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// Rate limiting
export async function rateLimit(
  identifier: string,
  limit: number = 100,
  windowSeconds: number = 60
): Promise<{ success: boolean; remaining: number }> {
  const key = `ratelimit:${identifier}`;
  
  const requests = await redis.incr(key);
  
  if (requests === 1) {
    await redis.expire(key, windowSeconds);
  }
  
  return {
    success: requests <= limit,
    remaining: Math.max(0, limit - requests),
  };
}
```

---

## File Storage (Vercel Blob)

```typescript
// lib/storage.ts
import { put, del } from '@vercel/blob';

export async function uploadProfilePhoto(file: File, userId: string): Promise<string> {
  const blob = await put(`profiles/${userId}/${file.name}`, file, {
    access: 'public',
  });
  
  return blob.url;
}

export async function deleteProfilePhoto(url: string): Promise<void> {
  await del(url);
}
```

---

## NextAuth Configuration

```typescript
// lib/auth.ts
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { db } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};

// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

---

## Deployment Configuration

### Environment Variables (Vercel)

```bash
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://... # For migrations

# Upstash
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
UPSTASH_VECTOR_REST_URL=https://...
UPSTASH_VECTOR_REST_TOKEN=...

# Auth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Email
RESEND_API_KEY=...

# AI
OPENAI_API_KEY=...

# Airtable
AIRTABLE_API_KEY=...
AIRTABLE_BASE_ID=...
AIRTABLE_WEBHOOK_SECRET=...

# Inngest
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

# Cron
CRON_SECRET=...

# Storage
BLOB_READ_WRITE_TOKEN=...
```

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "pnpm drizzle-kit generate && pnpm build",
  "framework": "nextjs",
  "regions": ["iad1"],
  "crons": [
    {
      "path": "/api/cron/refresh-analytics",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/daily-recommendations",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/cron/session-reminders",
      "schedule": "0 * * * *"
    }
  ]
}
```

---

## Migration Strategy from AWS

### Data Migration

1. **Export from Aurora PostgreSQL:**
   ```bash
   pg_dump -h aurora-endpoint -U user -d mentor_matcher > backup.sql
   ```

2. **Import to new PostgreSQL:**
   ```bash
   psql $DATABASE_URL < backup.sql
   ```

3. **Run Drizzle migrations:**
   ```bash
   pnpm drizzle-kit push
   ```

4. **Rebuild embeddings in Upstash Vector:**
   - Run one-time script to fetch all mentors
   - Generate embeddings via OpenAI
   - Upsert to Upstash Vector

### Code Migration

1. **Lambda → API Routes:**
   - Convert each Lambda handler to a Next.js Route Handler
   - Move shared utilities to `/lib`

2. **SQS/EventBridge → Inngest:**
   - Convert SQS consumers to Inngest functions
   - Replace EventBridge cron with Vercel Cron

3. **S3 → Vercel Blob:**
   - Migrate existing profile photos
   - Update upload logic

4. **SES → Resend:**
   - Port email templates to React Email
   - Update sending logic

---

## Performance Considerations

### Edge Runtime Optimization

```typescript
// app/api/match/route.ts
export const runtime = 'edge'; // Deploy to edge for low latency
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Match endpoint benefits from edge deployment
  // Quick vector search + reranking
}
```

### ISR for Static Content

```typescript
// app/mentors/[id]/page.tsx
export const revalidate = 60; // ISR: revalidate every 60 seconds

export async function generateStaticParams() {
  const mentors = await db.query.mentors.findMany({
    where: (mentors, { eq }) => eq(mentors.active, true),
  });
  
  return mentors.map(m => ({ id: m.id }));
}
```

### Caching Strategy

- **Match results:** 5 minutes (user-specific cache key)
- **Mentor profiles:** 1 hour
- **Analytics:** 1 day
- **Search suggestions:** 1 week

---

## Testing Strategy

### Unit Tests (Vitest)

```typescript
// __tests__/lib/vector.test.ts
import { describe, it, expect } from 'vitest';
import { searchMentors } from '@/lib/vector';

describe('Vector Search', () => {
  it('should return mentors matching filters', async () => {
    const results = await searchMentors(
      mockEmbedding,
      { industry: 'AI', stage: 'Seed' },
      10
    );
    
    expect(results).toHaveLength(10);
    expect(results[0]).toHaveProperty('mentorId');
    expect(results[0]).toHaveProperty('similarity');
  });
});
```

### Integration Tests (Playwright)

```typescript
// e2e/booking-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete booking flow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Sign In');
  
  // Search for mentor
  await page.fill('[name="query"]', 'Help with fundraising');
  await page.click('button:has-text("Search")');
  
  // View profile
  await page.click('a:has-text("View Profile")').first();
  
  // Book session
  await page.click('[data-testid="availability-slot"]').first();
  await page.click('button:has-text("Confirm Booking")');
  
  await expect(page.locator('text=Session Booked')).toBeVisible();
});
```

---

## Monitoring & Observability

### Vercel Analytics

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Sentry Error Tracking

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.VERCEL_ENV,
});
```

### Custom Logging

```typescript
// lib/logger.ts
export function log(level: string, message: string, meta?: any) {
  const logEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };
  
  console.log(JSON.stringify(logEntry));
  
  // Optional: Send to Axiom or other log aggregator
}
```

---

## Success Criteria

### Phase 1 (MVP)
- ✅ User can sign up, log in, and search for mentors
- ✅ Vector search returns relevant mentors (match scores > 50%)
- ✅ User can book a session with available mentor
- ✅ Email confirmations arrive within 30 seconds
- ✅ PM can edit mentor profile in Airtable; changes sync within 10s
- ✅ No double-bookings possible
- ✅ API response time < 500ms (P95)

### Phase 2 (Intelligent Matching)
- ✅ Hybrid search improves relevance (measured by CTR)
- ✅ Reranking increases bookings from underutilized mentors by 20%
- ✅ Average feedback score ≥ 4.5/5
- ✅ 70% of completed sessions receive feedback within 48 hours
- ✅ Analytics dashboard used weekly by admin team

### Phase 3 (Advanced Features)
- ✅ Calendar sync reduces manual availability entry
- ✅ Google Meet links auto-generated for all sessions
- ✅ Recommendations increase engagement by 25%
- ✅ Match endpoint P95 latency < 200ms
- ✅ Cache hit rate > 30%

---

## Cost Estimates (Monthly)

**Vercel Pro:** $20/month  
**Vercel Postgres (Hobby):** Free (or Pro at $20/month for production)  
**Upstash Vector:** ~$10-50/month (based on dimension count & queries)  
**Upstash Redis:** ~$10/month (caching + rate limiting)  
**Vercel Blob:** ~$5-20/month (storage + bandwidth)  
**Resend:** Free tier (50k emails) or $20/month  
**OpenAI API:** ~$50-200/month (embeddings + GPT-4o-mini)  
**Inngest:** Free tier or $20/month  

**Total:** ~$100-400/month (vs $500-1000/month on AWS)

---

## Next Steps

1. **Set up Vercel Project**
   - Connect GitHub repo
   - Configure environment variables
   - Set up Postgres, Upstash Vector, Upstash Redis via Vercel integrations

2. **Initialize Drizzle**
   - Create schema files
   - Run migrations
   - Set up Drizzle Studio for DB management

3. **Build Phase 1**
   - Follow phased implementation guide (see PHASE1-NEXTJS.md)
   - Start with authentication
   - Build profile management
   - Implement basic matching

4. **Test & Deploy**
   - Write integration tests
   - Deploy to preview environment
   - Load test matching endpoint
   - Deploy to production

---

**Document Prepared For:** AI Engineer (Autonomous Implementation)  
**Contact:** Bruce "Starlove" Robinson (Founder/CEO, Starscape)  
**Architecture:** Next.js Full-Stack on Vercel  
**Goal:** Build the most intelligent, beautiful mentor-matching platform—serverless, scalable, and cost-effective.
