## Current implementation: one-way sync (Airtable → Postgres)

Currently implemented:

1. Airtable webhook → Lambda → Postgres
   - Airtable automation triggers on mentor record updates
   - POSTs to `/webhooks/airtable` (API Gateway)
   - Lambda (`webhook-airtable/index.js`) verifies HMAC-SHA256 signature
   - Upserts mentor profile and expertise to Postgres
   - Enqueues embedding rebuild job to SQS

Flow:
```
Airtable (PM edits mentor) 
  → Webhook POST /webhooks/airtable
  → Lambda: webhook-airtable
    → Verify signature
    → Upsert mentors table (via upsert-mentor.js)
    → Upsert expertise table (via upsert-expertise.js)
    → Enqueue embedding rebuild to SQS
  → Postgres (RDS)
```

## Planned but not implemented: bidirectional sync

The architecture documents describe bidirectional sync, but the outbound path is not implemented:

- Outbox table exists in the schema (`db/migrations/002_core_tables.sql`)
- Documentation mentions Postgres → Airtable sync via outbox pattern
- No Lambda worker processes the outbox to sync back to Airtable

Planned flow (not implemented):
```
Postgres update (mentor changes availability in app)
  → Insert into outbox table
  → SQS queue
  → Lambda: Airtable Sync Worker (doesn't exist yet)
    → Batch process outbox items
    → Call Airtable REST API
    → Mark outbox as done
  → Airtable (read-only mirror)
```

## Summary

- Current: one-way sync from Airtable → Lambda → Postgres
- Planned: bidirectional sync (outbound not implemented)

For your Next.js rebuild, you can:
- Keep the webhook endpoint (Next.js API route instead of Lambda)
- Implement the outbox worker pattern if you need bidirectional sync
- Or keep it one-way if PMs only edit in Airtable

Should I help plan the Next.js API route equivalent of the webhook handler?




------

Awesome—here’s exactly where **Airtable** fits and how it plays with **Next.js, a Vector DB, Vercel AI SDK, and AWS** for your mentor–mentee matcher.

# 1) What role does Airtable play?

Use Airtable as the **operations-facing profile CRM** (program managers live here), but keep your **authoritative system of record in Postgres**. That gives you:

* Airtable = human-friendly editing, quick admin workflows.
* Postgres = normalized data for matching, analytics, and audits.

You’ll **sync both ways** with strict rules (below).

# 2) High-level architecture (hybrid Vercel + AWS)

```
[Next.js (Vercel)]
  ├─ UI (TS/React) + App Router
  ├─ Vercel AI SDK (LLM calls, reranking)
  ├─ Edge Middleware (light auth/session routing)
  └─ Route Handlers (Node runtime) -> your AWS API

[AWS]
  ├─ API Gateway  ─>  Lambda “API” (REST/GraphQL) ─>  RDS Postgres (authoritative DB)
  │                                     └─ S3 (avatars/docs) 
  ├─ EventBridge (cron & event bus)
  ├─ Lambda “Airtable Webhook Receiver”  <-- Airtable automations/webhooks
  ├─ SQS “Outbox/Sync queue” (idempotent sync tasks)
  ├─ Lambda “Airtable Sync Worker” (read/write Airtable via REST)
  ├─ Lambda “Embedding Builder” (OpenAI via Vercel AI SDK or OpenAI SDK)
  │         └─ Vector DB (Pinecone or Upstash Vector)
  └─ SES or Resend (email)
```

# 3) Where Airtable integrates (concrete flows)

## Source of Truth model

* **Recommended:** **Postgres** is the **source of truth**; Airtable is a synchronized “operational view.”
* **Why?** You’ll compute embeddings, run joins, enforce constraints/permissions, and scale analytics in Postgres.

## Sync directions

* **Inbound (Airtable → Platform):** PM edits a mentor profile in Airtable → Airtable automation hits your **Airtable Webhook Receiver (Lambda)** → write to **Postgres**, enqueue **re-embed job**.
* **Outbound (Platform → Airtable):** Mentor updates their expertise in the web app → write to **Postgres** → publish an **Outbox event** to **SQS** → **Airtable Sync Worker** applies changes to Airtable.

## Safety & consistency

* **Row identity:** Store `airtable_record_id` alongside your `mentor_id`.
* **Versioning:** Keep `updated_at` and `version` in both systems; **last-writer-wins with source precedence**:

  * For fields PMs manage in Airtable → Airtable wins.
  * For fields users manage in app (availability, consent flags) → Postgres wins.
* **Idempotency:** All sync Lambdas use **idempotency keys** (message ID + record ID).
* **Backfill:** Nightly **EventBridge cron** job runs a reconciliation: diff Airtable vs Postgres, fix drifts, re-embed if necessary.
* **Rate limits:** Batch writes to Airtable (chunk size 10–50), exponential backoff, DLQ for poison messages.

# 4) Data model & Airtable schema (minimal)

**Postgres (RDS)**

* `users(id, role, auth_provider_id, email, …)`
* `mentors(id, user_id, airtable_record_id, headline, bio, company, title, public_flags, updated_at, version, …)`
* `expertise(id, mentor_id, area, subarea, seniority, weight)`
* `availability(id, mentor_id, starts_at, ends_at, location, meeting_url, capacity)`
* `sessions(id, mentor_id, mentee_id, starts_at, ends_at, status, feedback_score, notes)`
* `embeddings(id, entity_type, entity_id, vector, dim, model, hash, updated_at)`
* `outbox(id, type, payload_json, status, attempts)`

**Airtable**

* **Mentors** table: `Record ID`, `Email` (linked), `Name`, `Headline`, `Bio`, `Company`, `Title`, `Expertise (multi-select)`, `Industries (multi-select)`, `Stage Focus (multi-select)`, `Office Hours Slots (linked)`, `Is Active`, `Last Synced`
* **Availability** table: `Mentor (link)`, `Starts`, `Ends`, `Location/Remote`, `Max Slots`
* (Optionally) **Sessions** table for PM visibility

# 5) Matching pipeline (where Vector DB + Vercel AI SDK shine)

1. **Feature preparation**

   * From Postgres, build a **profile text blob** (bio, headline, tags, company, prior session keywords).
   * **Embed** mentors and mentees with OpenAI via **Vercel AI SDK** (server-side Lambda).
   * Upsert vectors to **Pinecone or Upstash Vector** with metadata (`mentor_id`, tags).

2. **Candidate retrieval**

   * Query Vector DB with the mentee’s request (free text or structured → compose a prompt to extract keywords + text).
   * Retrieve top N mentors by cosine similarity with **metadata filters** (industry, stage, location, availability window).

3. **Reranking & rules**

   * **Rerank** candidates via an LLM call (Vercel AI SDK) using structured criteria: expertise match, seniority, conflict of interest, time-zone, load-balancing.
   * Apply **hard constraints** in code (role, permissions, opt-in flags).

4. **Utilization balancing**

   * Maintain mentor utilization metrics in Postgres; bias selection toward under-utilized mentors to hit the **>90%** target.

# 6) Next.js responsibilities

* **App (Vercel)**

  * UI & routing
  * **TanStack Query** for data fetching + cache; **Zustand** for UI state (filters/modals).
  * Route Handlers (Node runtime) for:

    * **Read**: call AWS API → Postgres (don’t run DB from Edge).
    * **Search**: call Vector DB HTTP SDKs (server-side).
    * **Book**: create session, send email, enqueue follow-ups.
* **Edge middleware**

  * Lightweight: geo-based hints, AB tests, auth cookie pre-checks (session lookup from Upstash Redis if you want).
* **Auth**

  * NextAuth (or BetterAuth) tied to Postgres users (and Airtable record links).

# 7) AWS services (pragmatic picks)

* **API Gateway** + **Lambda (Node/TS)**: app backend (or use a single Next.js serverless API if you prefer fewer hops).
* **RDS Postgres**: authoritative data.
* **S3**: avatars, attachments; signed URLs.
* **SQS**: outbox/sync queue, email queue.
* **EventBridge**: cron (nightly reconciliation), event bus for decoupling.
* **SES** (or **Resend**, since you’ve used it) for emails.
* **CloudWatch**: logs/metrics/alarms.
* **(Optional) Step Functions**: multi-step flows (provisioning mentors, bulk syncs).
* **(Optional) Secrets Manager**: Airtable tokens, API keys.

# 8) Airtable integration specifics (step-by-step)

* **Inbound webhook (Airtable → you)**

  1. PM edits mentor row.
  2. Airtable Automation → POST to your **/webhooks/airtable** (API Gateway).
  3. Lambda verifies signature, transforms payload → **UPSERT** mentor+availability in Postgres.
  4. Publish **“PROFILE_UPDATED”** event to EventBridge; enqueue **Embedding Builder**.
  5. Embedding Lambda rebuilds + upserts vector.

* **Outbound sync (you → Airtable)**

  1. User updates profile in app → write Postgres and **insert into `outbox`**.
  2. SQS worker batches outbox items → calls Airtable REST (respect rate limits).
  3. On success, mark outbox row `done`, store Airtable `record_id`/`Last Synced`.

# 9) Emails, scheduling, feedback

* **Email**: confirmation/reminders (SES or Resend). Include iCal attachments.
* **Calendar (P2)**: later add Google/Outlook 2-way sync (availability writes, conflict checks); for v1, manage slots internally + send Meet links via Google Meet API or Zoom as stretch.
* **Feedback**: 2-question CSAT (+ free text). Store as `sessions.feedback_*`; feed into future ranking.

# 10) Security & compliance quick hits

* PII in Postgres encrypted at rest; **RDS encryption + KMS**.
* Signed S3 URLs; short TTL.
* Scoped Airtable tokens with base-level access.
* Audit tables for changes (who/when/what).
* GDPR: delete/export endpoints; data retention policies enforced via EventBridge scheduled tasks.

---

## Bottom line

* **Airtable** = admin-facing CRM surface, synced via webhooks + outbox workers.
* **Postgres** = single source of truth.
* **Vector DB (Pinecone/Upstash Vector)** = semantic candidate retrieval.
* **Vercel AI SDK** = prompt orchestration + reranking.
* **AWS (API Gateway, Lambda, RDS, SQS, EventBridge, S3, SES/Resend)** = durable, scalable backend.

If you want, I can turn this into a **mini PRD addendum** (acceptance criteria + endpoints + tables + event names) or a **task breakdown** for Phase 1 (schema, sync, embeddings, MVP match API).
