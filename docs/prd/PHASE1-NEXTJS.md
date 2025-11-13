# Phase 1: Foundation & Basic Matching (MVP)
## Next.js Full-Stack Implementation

**Duration:** 4 weeks  
**Goal:** Establish data infrastructure, basic AI matching, and core booking flow on Vercel

---

## Overview

Phase 1 delivers a working MVP with Next

Auth authentication, profile management, basic vector search matching via Upstash Vector, and session booking. Users can sign in, search for mentors using natural language, and book sessions. Program managers can edit profiles in Airtable, which sync to the application.

**Tech Stack:**
- Next.js 14+ (App Router)
- NextAuth.js v5
- Drizzle ORM + PostgreSQL
- Upstash Vector (embeddings)
- Upstash Redis (caching)
- Inngest (background jobs)
- Resend (email)
- Vercel (hosting)

---

## Sprint Breakdown

### Week 1: Project Setup & Database Foundation

#### Project Initialization

**Deliverables:**
- Next.js project with TypeScript
- Drizzle ORM configuration
- Database schema
- NextAuth setup
- Vercel project configuration

**Setup Steps:**

```bash
# Initialize Next.js project (if not already exists)
cd webapp
npm install

# Install core dependencies
npm install drizzle-orm postgres
npm install -D drizzle-kit

# Install auth dependencies
npm install next-auth@beta @auth/drizzle-adapter

# Install AI/Vector dependencies
npm install @upstash/vector @upstash/redis
npm install openai ai

# Install email
npm install resend react-email @react-email/components

# Install background jobs
npm install inngest

# Install utilities
npm install zod date-fns
```

**File Structure:**

```
webapp/
  ├── app/
  │   ├── (auth)/
  │   │   ├── signin/
  │   │   └── signup/
  │   ├── (dashboard)/
  │   │   ├── search/
  │   │   ├── mentors/[id]/
  │   │   ├── sessions/
  │   │   └── profile/
  │   ├── admin/
  │   │   └── analytics/
  │   ├── api/
  │   │   ├── auth/[...nextauth]/
  │   │   ├── profiles/
  │   │   ├── availability/
  │   │   ├── sessions/
  │   │   ├── match/
  │   │   ├── webhooks/airtable/
  │   │   ├── inngest/
  │   │   └── cron/
  │   └── layout.tsx
  ├── components/
  │   ├── auth/
  │   ├── mentor/
  │   ├── sessions/
  │   ├── match/
  │   └── ui/
  ├── lib/
  │   ├── db/
  │   │   ├── schema/
  │   │   │   ├── users.ts
  │   │   │   ├── mentors.ts
  │   │   │   ├── mentees.ts
  │   │   │   ├── sessions.ts
  │   │   │   └── index.ts
  │   │   ├── index.ts
  │   │   └── migrations/
  │   ├── auth.ts
  │   ├── vector.ts
  │   ├── cache.ts
  │   ├── openai.ts
  │   ├── email.ts
  │   └── utils.ts
  ├── inngest/
  │   ├── client.ts
  │   └── functions/
  │       ├── embedding-builder.ts
  │       ├── email-sender.ts
  │       └── airtable-sync.ts
  ├── emails/
  │   ├── booking-confirmation.tsx
  │   ├── feedback-request.tsx
  │   └── daily-recommendations.tsx
  └── drizzle.config.ts
```

---

#### Database Schema Setup

**Drizzle Configuration:**

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema/index.ts',
  out: './lib/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

**Core Schema Files:**

```typescript
// lib/db/schema/users.ts
import { pgTable, uuid, text, timestamp, boolean, unique } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  emailVerified: timestamp('email_verified'),
  image: text('image'),
  role: text('role', { enum: ['mentee', 'mentor', 'admin', 'pm'] }).default('mentee').notNull(),
  status: text('status', { enum: ['active', 'inactive', 'suspended'] }).default('active').notNull(),
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

// lib/db/schema/mentors.ts
import { pgTable, uuid, text, timestamp, boolean, integer, real } from 'drizzle-orm/pg-core';
import { users } from './users';

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
  visibility: text('visibility', { enum: ['public', 'private', 'limited'] }).default('public').notNull(),
  loadCapPerWeek: integer('load_cap_per_week').default(5).notNull(),
  active: boolean('active').default(true).notNull(),
  photoUrl: text('photo_url'),
  linkedinUrl: text('linkedin_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const expertise = pgTable('expertise', {
  id: uuid('id').defaultRandom().primaryKey(),
  mentorId: uuid('mentor_id').references(() => mentors.id, { onDelete: 'cascade' }).notNull(),
  area: text('area').notNull(),
  subarea: text('subarea'),
  weight: real('weight').default(1.0),
});

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

// lib/db/schema/sessions.ts (office hours sessions, not auth sessions)
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { mentors, mentees } from './mentors';

export const officeSessions = pgTable('office_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  mentorId: uuid('mentor_id').references(() => mentors.id, { onDelete: 'cascade' }).notNull(),
  menteeId: uuid('mentee_id').references(() => mentees.id, { onDelete: 'cascade' }).notNull(),
  startsAt: timestamp('starts_at').notNull(),
  endsAt: timestamp('ends_at').notNull(),
  status: text('status', { 
    enum: ['pending', 'booked', 'completed', 'cancelled', 'no_show'] 
  }).default('booked').notNull(),
  meetingUrl: text('meeting_url'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const availability = pgTable('availability', {
  id: uuid('id').defaultRandom().primaryKey(),
  mentorId: uuid('mentor_id').references(() => mentors.id, { onDelete: 'cascade' }).notNull(),
  startsAt: timestamp('starts_at').notNull(),
  endsAt: timestamp('ends_at').notNull(),
  capacity: integer('capacity').default(1).notNull(),
  location: text('location').default('virtual'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// lib/db/schema/events.ts
import { pgTable, bigserial, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const events = pgTable('events', {
  id: bigserial('id', { mode: 'bigint' }).primaryKey(),
  occurredAt: timestamp('occurred_at').defaultNow().notNull(),
  actorUserId: uuid('actor_user_id').references(() => users.id),
  type: text('type').notNull(),
  entity: text('entity'),
  entityId: uuid('entity_id'),
  props: jsonb('props').default({}),
});

// lib/db/schema/index.ts
export * from './users';
export * from './mentors';
export * from './sessions';
export * from './events';

// Export relations for Drizzle queries
import { relations } from 'drizzle-orm';
import { users, accounts, sessions, mentors, mentees, expertise, officeSessions, availability } from './index';

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  mentor: one(mentors, {
    fields: [users.id],
    references: [mentors.userId],
  }),
  mentee: one(mentees, {
    fields: [users.id],
    references: [mentees.userId],
  }),
}));

export const mentorsRelations = relations(mentors, ({ one, many }) => ({
  user: one(users, {
    fields: [mentors.userId],
    references: [users.id],
  }),
  expertise: many(expertise),
  availability: many(availability),
  sessions: many(officeSessions),
}));

export const menteesRelations = relations(mentees, ({ one, many }) => ({
  user: one(users, {
    fields: [mentees.userId],
    references: [users.id],
  }),
  sessions: many(officeSessions),
}));

export const officeSessionsRelations = relations(officeSessions, ({ one }) => ({
  mentor: one(mentors, {
    fields: [officeSessions.mentorId],
    references: [mentors.id],
  }),
  mentee: one(mentees, {
    fields: [officeSessions.menteeId],
    references: [mentees.id],
  }),
}));
```

**Database Connection:**

```typescript
// lib/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Disable prefetch for Vercel
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
```

**Run Migrations:**

```bash
# Generate migration files
npx drizzle-kit generate:pg

# Push to database (or use migrate for production)
npx drizzle-kit push:pg

# Open Drizzle Studio to visualize
npx drizzle-kit studio
```

**Validation:**
- ✅ All tables created successfully
- ✅ Foreign key constraints work
- ✅ Can query via Drizzle Studio
- ✅ Relations work correctly

---

### Week 2: Authentication & Core API Routes

#### NextAuth Setup

**Configuration:**

```typescript
// lib/auth.ts
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';

export const authOptions: AuthOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
  },
  pages: {
    signIn: '/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'database',
  },
};

// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**Auth Utilities:**

```typescript
// lib/auth-utils.ts
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { redirect } from 'next/navigation';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/signin');
  }
  return user;
}

export async function requireRole(role: string | string[]) {
  const user = await requireAuth();
  const roles = Array.isArray(role) ? role : [role];
  
  if (!roles.includes(user.role)) {
    redirect('/');
  }
  
  return user;
}
```

**Validation:**
- ✅ Can sign in with Google
- ✅ Session persists across page reloads
- ✅ User record created in database
- ✅ Role-based access control works

---

#### Profile API Routes

**GET/PUT Profile:**

```typescript
// app/api/profiles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, mentors, mentees } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth-utils';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await db.query.users.findFirst({
      where: eq(users.id, params.id),
      with: {
        mentor: {
          with: {
            expertise: true,
          },
        },
        mentee: true,
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const updateProfileSchema = z.object({
  name: z.string().optional(),
  company: z.string().optional(),
  stage: z.string().optional(),
  industry: z.string().optional(),
  goals: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.id !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const data = updateProfileSchema.parse(body);
    
    // Update user
    if (data.name) {
      await db.update(users)
        .set({ name: data.name })
        .where(eq(users.id, params.id));
    }
    
    // Update mentor or mentee specific fields
    if (currentUser.role === 'mentee') {
      await db.update(mentees)
        .set({
          company: data.company,
          stage: data.stage,
          industry: data.industry,
          goals: data.goals,
          updatedAt: new Date(),
        })
        .where(eq(mentees.userId, params.id));
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Validation:**
- ✅ Can fetch user profile
- ✅ Can update own profile
- ✅ Cannot update other users' profiles
- ✅ Validation works correctly

---

### Week 3: Airtable Integration & Embedding Pipeline

#### Airtable Webhook Handler

**API Route:**

```typescript
// app/api/webhooks/airtable/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, mentors, expertise } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { inngest } from '@/inngest/client';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const signature = request.headers.get('x-airtable-signature');
    const body = await request.text();
    
    const expectedSig = crypto
      .createHmac('sha256', process.env.AIRTABLE_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');
    
    if (signature !== expectedSig) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    const payload = JSON.parse(body);
    const { recordId, fields } = payload;
    
    // Upsert mentor profile
    await upsertMentorProfile(recordId, fields);
    
    // Trigger embedding rebuild via Inngest
    await inngest.send({
      name: 'mentor/updated',
      data: {
        mentorId: recordId,
        fields,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function upsertMentorProfile(airtableRecordId: string, fields: any) {
  // Find or create user by email
  let user = await db.query.users.findFirst({
    where: eq(users.email, fields.Email),
  });
  
  if (!user) {
    [user] = await db.insert(users).values({
      email: fields.Email,
      name: fields.Name,
      role: 'mentor',
    }).returning();
  }
  
  // Upsert mentor
  const mentorData = {
    userId: user.id,
    airtableRecordId,
    headline: fields.Headline,
    bio: fields.Bio,
    company: fields.Company,
    title: fields.Title,
    industry: fields.Industries?.[0],
    stage: fields['Stage Focus']?.[0],
    timezone: fields.Timezone,
    active: fields['Is Active'] ?? true,
    updatedAt: new Date(),
  };
  
  const existing = await db.query.mentors.findFirst({
    where: eq(mentors.airtableRecordId, airtableRecordId),
  });
  
  let mentorId: string;
  
  if (existing) {
    await db.update(mentors)
      .set(mentorData)
      .where(eq(mentors.id, existing.id));
    mentorId = existing.id;
  } else {
    [{ id: mentorId }] = await db.insert(mentors)
      .values(mentorData)
      .returning({ id: mentors.id });
  }
  
  // Update expertise
  if (fields.Expertise) {
    // Delete old expertise
    await db.delete(expertise).where(eq(expertise.mentorId, mentorId));
    
    // Insert new expertise
    for (const area of fields.Expertise) {
      await db.insert(expertise).values({
        mentorId,
        area,
      });
    }
  }
}
```

**Validation:**
- ✅ Webhook signature verification works
- ✅ Mentor profiles sync from Airtable
- ✅ Expertise tags updated correctly
- ✅ Inngest event triggered

---

#### Embedding Builder (Inngest)

**Inngest Client:**

```typescript
// inngest/client.ts
import { Inngest } from 'inngest';

export const inngest = new Inngest({ 
  id: 'mentor-matcher',
  eventKey: process.env.INNGEST_EVENT_KEY,
});
```

**Embedding Builder Function:**

```typescript
// inngest/functions/embedding-builder.ts
import { inngest } from '../client';
import { db } from '@/lib/db';
import { mentors, expertise } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateEmbedding } from '@/lib/openai';
import { upsertMentorEmbedding } from '@/lib/vector';

export const buildMentorEmbedding = inngest.createFunction(
  { 
    id: 'build-mentor-embedding',
    retries: 3,
  },
  { event: 'mentor/updated' },
  async ({ event, step }) => {
    const { mentorId } = event.data;
    
    // Fetch mentor profile with expertise
    const mentor = await step.run('fetch-mentor', async () => {
      return await db.query.mentors.findFirst({
        where: eq(mentors.airtableRecordId, mentorId),
        with: {
          expertise: true,
          user: true,
        },
      });
    });
    
    if (!mentor) {
      return { error: 'Mentor not found' };
    }
    
    // Build embedding text
    const embeddingText = [
      mentor.headline,
      mentor.bio,
      `Company: ${mentor.company}`,
      `Title: ${mentor.title}`,
      `Industry: ${mentor.industry}`,
      `Stage Focus: ${mentor.stage}`,
      mentor.expertise?.map(e => e.area).join(', '),
    ].filter(Boolean).join('\n\n');
    
    // Generate embedding via OpenAI
    const embedding = await step.run('generate-embedding', async () => {
      return await generateEmbedding(embeddingText);
    });
    
    // Store in Upstash Vector
    await step.run('store-embedding', async () => {
      await upsertMentorEmbedding({
        id: mentor.id,
        vector: embedding,
        metadata: {
          mentorId: mentor.id,
          model: 'text-embedding-3-small',
          industry: mentor.industry || undefined,
          stage: mentor.stage || undefined,
          expertise: mentor.expertise.map(e => e.area),
          active: mentor.active,
          updatedAt: new Date().toISOString(),
        },
      });
    });
    
    return { 
      success: true, 
      mentorId: mentor.id,
      embeddingLength: embedding.length,
    };
  }
);
```

**OpenAI Integration:**

```typescript
// lib/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    encoding_format: 'float',
  });
  
  return response.data[0].embedding;
}
```

**Upstash Vector Integration:**

```typescript
// lib/vector.ts
import { Index } from '@upstash/vector';

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

export interface MentorEmbedding {
  id: string;
  vector: number[];
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
  // Build metadata filter for Upstash Vector
  let filter: string | undefined;
  
  if (filters) {
    const conditions: string[] = ['active = true'];
    
    if (filters.industry) {
      conditions.push(`industry = "${filters.industry}"`);
    }
    if (filters.stage) {
      conditions.push(`stage = "${filters.stage}"`);
    }
    if (filters.expertise && filters.expertise.length > 0) {
      const expertiseFilters = filters.expertise
        .map(e => `expertise INCLUDES "${e}"`)
        .join(' OR ');
      conditions.push(`(${expertiseFilters})`);
    }
    
    filter = conditions.join(' AND ');
  }
  
  const results = await index.query({
    vector: queryVector,
    topK,
    filter,
    includeMetadata: true,
  });
  
  return results.map(r => ({
    mentorId: r.id,
    similarity: r.score || 0,
    metadata: r.metadata as MentorEmbedding['metadata'],
  }));
}
```

**Inngest Handler Route:**

```typescript
// app/api/inngest/route.ts
import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { buildMentorEmbedding } from '@/inngest/functions/embedding-builder';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    buildMentorEmbedding,
  ],
});
```

**Validation:**
- ✅ Embeddings generated successfully
- ✅ Stored in Upstash Vector with metadata
- ✅ Can query embeddings by similarity
- ✅ Metadata filtering works

---

### Week 4: Matching & Session Booking

#### Match API Route

```typescript
// app/api/match/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth-utils';
import { generateEmbedding } from '@/lib/openai';
import { searchMentors } from '@/lib/vector';
import { db } from '@/lib/db';
import { mentors, availability } from '@/lib/db/schema';
import { inArray } from 'drizzle-orm';
import { cachedQuery } from '@/lib/cache';

const matchSchema = z.object({
  query: z.string().min(1),
  industries: z.array(z.string()).optional(),
  stages: z.array(z.string()).optional(),
  expertise: z.array(z.string()).optional(),
  limit: z.number().min(1).max(50).default(10),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { query, industries, stages, expertise: expertiseFilter, limit } = matchSchema.parse(body);
    
    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);
    
    // Search Upstash Vector
    const vectorResults = await searchMentors(
      queryEmbedding,
      {
        industry: industries?.[0],
        stage: stages?.[0],
        expertise: expertiseFilter,
      },
      30 // Get top 30 candidates for reranking
    );
    
    if (vectorResults.length === 0) {
      return NextResponse.json({ 
        query,
        matches: [],
        count: 0,
      });
    }
    
    // Fetch full mentor profiles
    const mentorIds = vectorResults.map(r => r.mentorId);
    const mentorProfiles = await db.query.mentors.findMany({
      where: inArray(mentors.id, mentorIds),
      with: {
        user: true,
        expertise: true,
      },
    });
    
    // Enrich with availability
    const enriched = await Promise.all(
      mentorProfiles.map(async (mentor) => {
        const vectorResult = vectorResults.find(r => r.mentorId === mentor.id);
        const matchScore = Math.round((vectorResult?.similarity || 0) * 100);
        
        // Get upcoming availability (next 2 weeks)
        const upcomingSlots = await db.query.availability.findMany({
          where: (availability, { and, eq, gte }) => 
            and(
              eq(availability.mentorId, mentor.id),
              gte(availability.startsAt, new Date())
            ),
          orderBy: (availability, { asc }) => [asc(availability.startsAt)],
          limit: 5,
        });
        
        return {
          id: mentor.id,
          name: mentor.user.name,
          headline: mentor.headline,
          bio: mentor.bio,
          company: mentor.company,
          title: mentor.title,
          photoUrl: mentor.photoUrl,
          expertise: mentor.expertise.map(e => e.area),
          matchScore,
          availability: upcomingSlots.map(slot => ({
            startsAt: slot.startsAt,
            endsAt: slot.endsAt,
          })),
          profileUrl: `/mentors/${mentor.id}`,
        };
      })
    );
    
    // Sort by match score descending
    enriched.sort((a, b) => b.matchScore - a.matchScore);
    
    return NextResponse.json({
      query,
      matches: enriched.slice(0, limit),
      count: enriched.length,
    });
  } catch (error) {
    console.error('Match error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Validation:**
- ✅ Returns relevant mentors
- ✅ Match scores meaningful (0-100)
- ✅ Filters work correctly
- ✅ Response time < 500ms

---

#### Session Booking API

```typescript
// app/api/sessions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { officeSessions, mentees, availability } from '@/lib/db/schema';
import { and, eq, lte, gte, or } from 'drizzle-orm';
import { inngest } from '@/inngest/client';

const bookSessionSchema = z.object({
  mentorId: z.string().uuid(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { mentorId, startsAt, endsAt, notes } = bookSessionSchema.parse(body);
    
    const startsAtDate = new Date(startsAt);
    const endsAtDate = new Date(endsAt);
    
    // Get mentee profile
    const mentee = await db.query.mentees.findFirst({
      where: eq(mentees.userId, user.id),
    });
    
    if (!mentee) {
      return NextResponse.json({ error: 'Mentee profile not found' }, { status: 404 });
    }
    
    // Check for conflicts (double-booking prevention)
    const conflicts = await db.query.officeSessions.findMany({
      where: and(
        eq(officeSessions.mentorId, mentorId),
        eq(officeSessions.status, 'booked'),
        or(
          and(
            lte(officeSessions.startsAt, startsAtDate),
            gte(officeSessions.endsAt, startsAtDate)
          ),
          and(
            lte(officeSessions.startsAt, endsAtDate),
            gte(officeSessions.endsAt, endsAtDate)
          )
        )
      ),
    });
    
    if (conflicts.length > 0) {
      return NextResponse.json({ error: 'Time slot already booked' }, { status: 409 });
    }
    
    // Create session
    const [session] = await db.insert(officeSessions).values({
      mentorId,
      menteeId: mentee.id,
      startsAt: startsAtDate,
      endsAt: endsAtDate,
      status: 'booked',
      notes,
      meetingUrl: generateMeetingUrl(), // Placeholder for now
    }).returning();
    
    // Trigger email notifications via Inngest
    await inngest.send({
      name: 'session/booked',
      data: {
        sessionId: session.id,
      },
    });
    
    return NextResponse.json(session);
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateMeetingUrl(): string {
  // Placeholder - Phase 3 will integrate Google Calendar
  const code = Math.random().toString(36).substring(7);
  return `https://meet.google.com/${code}`;
}

// GET sessions (list for current user)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const sessions = await db.query.officeSessions.findMany({
      where: (officeSessions, { or, eq }) => {
        // Get sessions where user is mentor or mentee
        if (user.role === 'mentor') {
          return eq(officeSessions.mentorId, user.mentor?.id);
        } else {
          return eq(officeSessions.menteeId, user.mentee?.id);
        }
      },
      with: {
        mentor: {
          with: { user: true },
        },
        mentee: {
          with: { user: true },
        },
      },
      orderBy: (officeSessions, { desc }) => [desc(officeSessions.startsAt)],
    });
    
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Fetch sessions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Email Sender (Inngest):**

```typescript
// inngest/functions/email-sender.ts
import { inngest } from '../client';
import { db } from '@/lib/db';
import { officeSessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendEmail } from '@/lib/email';

export const sendSessionEmail = inngest.createFunction(
  { id: 'send-session-email' },
  { event: 'session/booked' },
  async ({ event, step }) => {
    const { sessionId } = event.data;
    
    const session = await step.run('fetch-session', async () => {
      return await db.query.officeSessions.findFirst({
        where: eq(officeSessions.id, sessionId),
        with: {
          mentor: { with: { user: true } },
          mentee: { with: { user: true } },
        },
      });
    });
    
    if (!session) {
      return { error: 'Session not found' };
    }
    
    // Send to mentee
    await step.run('email-mentee', async () => {
      await sendEmail({
        to: session.mentee.user.email!,
        subject: `Session Confirmed with ${session.mentor.user.name}`,
        template: 'booking-confirmation',
        data: {
          recipientName: session.mentee.user.name,
          otherPartyName: session.mentor.user.name,
          startsAt: session.startsAt,
          meetingUrl: session.meetingUrl,
        },
      });
    });
    
    // Send to mentor
    await step.run('email-mentor', async () => {
      await sendEmail({
        to: session.mentor.user.email!,
        subject: `New Session Booked with ${session.mentee.user.name}`,
        template: 'booking-confirmation',
        data: {
          recipientName: session.mentor.user.name,
          otherPartyName: session.mentee.user.name,
          startsAt: session.startsAt,
          meetingUrl: session.meetingUrl,
        },
      });
    });
    
    return { success: true, sessionId };
  }
);
```

**Email Service (Resend):**

```typescript
// lib/email.ts
import { Resend } from 'resend';
import { BookingConfirmation } from '@/emails/booking-confirmation';
import { render } from '@react-email/render';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(params: {
  to: string;
  subject: string;
  template: string;
  data: any;
}) {
  const templates = {
    'booking-confirmation': BookingConfirmation,
  };
  
  const Template = templates[params.template];
  if (!Template) {
    throw new Error(`Unknown template: ${params.template}`);
  }
  
  const html = render(<Template {...params.data} />);
  
  await resend.emails.send({
    from: 'Office Hours <noreply@capitalfactory.com>',
    to: params.to,
    subject: params.subject,
    html,
  });
}
```

**React Email Template:**

```tsx
// emails/booking-confirmation.tsx
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components';
import { format } from 'date-fns';

interface BookingConfirmationProps {
  recipientName: string;
  otherPartyName: string;
  startsAt: Date;
  meetingUrl: string;
}

export function BookingConfirmation({
  recipientName,
  otherPartyName,
  startsAt,
  meetingUrl,
}: BookingConfirmationProps) {
  const formattedDate = format(new Date(startsAt), 'EEEE, MMMM d, yyyy \'at\' h:mm a');
  
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f6f6f6' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', padding: '20px' }}>
          <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>
            Office Hours Confirmed! ✅
          </Text>
          
          <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
            Hi {recipientName},
          </Text>
          
          <Text style={{ fontSize: '16px', lineHeight: '24px' }}>
            Your office hours session with <strong>{otherPartyName}</strong> is confirmed!
          </Text>
          
          <Section style={{ backgroundColor: '#f0f0f0', padding: '16px', borderRadius: '8px', margin: '20px 0' }}>
            <Text style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
              <strong>When:</strong>
            </Text>
            <Text style={{ margin: '0 0 16px 0', fontSize: '16px' }}>
              {formattedDate}
            </Text>
            
            <Button
              href={meetingUrl}
              style={{
                backgroundColor: '#007bff',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Join Meeting
            </Button>
          </Section>
          
          <Hr />
          
          <Text style={{ fontSize: '14px', color: '#666' }}>
            Need to reschedule? Visit your dashboard to manage your sessions.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

**Validation:**
- ✅ Can book available time slot
- ✅ Cannot double-book
- ✅ Email confirmations sent
- ✅ Sessions appear in dashboard

---

## Frontend Implementation

### Search Page

```tsx
// app/(dashboard)/search/page.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MentorCard } from '@/components/mentor/mentor-card';
import { SearchBar } from '@/components/search/search-bar';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['match', query],
    queryFn: async () => {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    },
    enabled: submitted && query.length > 0,
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Find Your Perfect Mentor</h1>
      
      <form onSubmit={handleSearch} className="mb-12">
        <SearchBar 
          value={query}
          onChange={setQuery}
          placeholder="What do you need help with?"
        />
      </form>
      
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Error searching mentors. Please try again.
        </div>
      )}
      
      {data && (
        <>
          <p className="text-lg text-gray-600 mb-6">
            Found {data.count} mentor{data.count !== 1 ? 's' : ''}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.matches.map((mentor: any) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

### Mentor Card Component

```tsx
// components/mentor/mentor-card.tsx
import Link from 'next/link';
import Image from 'next/image';

interface MentorCardProps {
  mentor: {
    id: string;
    name: string;
    headline: string;
    company: string;
    title: string;
    photoUrl?: string;
    expertise: string[];
    matchScore: number;
  };
}

export function MentorCard({ mentor }: MentorCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
      <div className="flex items-start gap-4 mb-4">
        {mentor.photoUrl ? (
          <Image
            src={mentor.photoUrl}
            alt={mentor.name}
            width={64}
            height={64}
            className="rounded-full"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-600">
            {mentor.name[0]}
          </div>
        )}
        
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-1">{mentor.name}</h3>
          <p className="text-sm text-gray-600">
            {mentor.company} &middot; {mentor.title}
          </p>
        </div>
        
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
          {mentor.matchScore}% match
        </div>
      </div>
      
      <p className="text-gray-700 mb-4 line-clamp-2">{mentor.headline}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {mentor.expertise.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
      
      <Link
        href={`/mentors/${mentor.id}`}
        className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        View Profile &amp; Book
      </Link>
    </div>
  );
}
```

---

## Testing & Validation

### E2E Tests (Playwright)

```typescript
// e2e/search-and-book.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Search and Book Flow', () => {
  test('should search for mentors and view profile', async ({ page }) => {
    await page.goto('/search');
    
    // Search
    await page.fill('[placeholder*="What do you need help"]', 'Help with fundraising');
    await page.click('button:has-text("Search")');
    
    // Wait for results
    await expect(page.locator('[data-testid="mentor-card"]').first()).toBeVisible();
    
    // Click first result
    await page.click('[data-testid="mentor-card"]').first();
    
    // Should be on mentor profile page
    await expect(page).toHaveURL(/\/mentors\//);
  });
});
```

---

## Launch Checklist

### Infrastructure
- [ ] Vercel project created and connected
- [ ] Environment variables configured
- [ ] PostgreSQL database provisioned
- [ ] Upstash Vector index created
- [ ] Upstash Redis provisioned
- [ ] Custom domain configured (optional)

### Database
- [ ] Drizzle migrations run
- [ ] Test data seeded
- [ ] Relations working correctly

### Authentication
- [ ] Google OAuth configured
- [ ] Sign in/out works
- [ ] Session persistence works

### Integrations
- [ ] Airtable webhook configured
- [ ] Inngest connected
- [ ] Resend emails working
- [ ] OpenAI API key valid

### Features
- [ ] Can search for mentors
- [ ] Vector search returns results
- [ ] Can view mentor profiles
- [ ] Can book sessions
- [ ] Email confirmations sent

### Testing
- [ ] E2E tests passing
- [ ] Manual testing completed
- [ ] Performance validated (<500ms)

---

## Success Criteria

- ✅ User can sign up, log in, search for mentors
- ✅ Vector search returns relevant mentors (match scores > 50%)
- ✅ User can book a session
- ✅ Email confirmations arrive within 30 seconds
- ✅ Airtable edits sync within 10 seconds
- ✅ No double-bookings possible
- ✅ API response time < 500ms (P95)

---

## Next Phase Preview

Phase 2 will add:
- Hybrid search (vector + PostgreSQL full-text)
- Multi-signal reranking
- Feedback system
- Analytics dashboard
- Match explanations

**Estimated start:** Week 5

