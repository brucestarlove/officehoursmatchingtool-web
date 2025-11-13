Got it—here’s a clean ownership map you can drop into the PRD. Rule of thumb: **program-manager curation & simple profile fields live in Airtable; everything transactional, security-sensitive, or computed stays app-owned (Postgres).**

# Ownership Legend

* 🟦 **Airtable-editable** (source of truth there; sync → Postgres)
* 🟧 **App-owned** (edited in app; mirrored to Airtable read-only if helpful)
* 🟪 **Computed/Derived** (read-only everywhere; calculated in app/DB)
* ⛔ **Never in Airtable** (security/PII risk or noisy)

---

# Users

| Field                      | Owner | Notes                                                   |
| -------------------------- | ----- | ------------------------------------------------------- |
| user_id                    | 🟧    | Internal ID; ⛔ not in Airtable (use email to cross-ref) |
| email                      | 🟧    | Auth identifier; **view-only** mirror in Airtable ok    |
| name                       | 🟦    | PMs often tweak display names; app consumes             |
| photo_url                  | 🟦    | PMs can drop assets; app may store in S3 and mirror     |
| role (mentor/mentee/admin) | 🟧    | Authorization → app-owned                               |
| status (active/suspended)  | 🟧    | Compliance/abuse workflows                              |
| created_at / last_login_at | 🟪    | Computed by app                                         |

---

# Mentors (profile)

| Field                             | Owner | Notes                                                            |
| --------------------------------- | ----- | ---------------------------------------------------------------- |
| mentor_id                         | 🟧    | Internal FK; store `airtable_record_id` on app side              |
| headline                          | 🟦    | Short pitch line                                                 |
| bio (long)                        | 🟦    | Rich text allowed; sanitize on ingest                            |
| company / title                   | 🟦    | PM-curated                                                       |
| linkedin_url / website            | 🟦    | PM-curated                                                       |
| tags: industries                  | 🟦    | Multi-select in Airtable; normalized in app (`mentor_industry`)  |
| tags: expertise areas/subareas    | 🟦    | Multi-select; app normalizes (`expertise` table)                 |
| seniority level                   | 🟦    | Enum-like single select                                          |
| geo/timezone                      | 🟦    | PMs may set; app validates IANA TZ                               |
| acceptance policy (who they meet) | 🟦    | e.g., “Seed-Stage B2B SaaS only”                                 |
| visibility (listed/unlisted)      | 🟧    | Respect user consent; app enforces                               |
| load cap (max sessions/week)      | 🟧    | Drives utilization balancing                                     |
| utilization score (rolling)       | 🟪    | Computed from sessions/availability                              |
| reputation score                  | 🟪    | Derived from feedback + volume (read-only mirror to AT optional) |

---

# Expertise (normalized)

| Field                   | Owner | Notes                                                    |
| ----------------------- | ----- | -------------------------------------------------------- |
| expertise_id, mentor_id | 🟧    | Keys                                                     |
| area / subarea          | 🟦    | Chosen in Airtable (multi-select); app expands into rows |
| weight (0–1 or 1–5)     | 🟧    | Matching control; PMs view in Airtable as read-only      |
| keywords (free text)    | 🟦    | Optional; PM-curated seed terms (app may tokenize)       |

---

# Availability

| Field                           | Owner | Notes                                                            |
| ------------------------------- | ----- | ---------------------------------------------------------------- |
| availability_id, mentor_id      | 🟧    | Keys                                                             |
| starts_at / ends_at             | 🟧    | **App-owned** to avoid drift; conflicts w/ calendar integrations |
| capacity / slot_length          | 🟧    | Drives booking logic                                             |
| location (remote/onsite + city) | 🟦    | PM-curated label only                                            |
| external calendar link/id       | ⛔     | Keep out of Airtable (tokens/secrets); store app-only            |
| availability_status             | 🟪    | Computed from calendar + manual overrides                        |

> Rationale: Keep **times** app-owned (we’ll add two-way calendars later). PMs can still **view** availability in Airtable via read-only mirror (ISO strings), but edits should originate in the app.

---

# Sessions (bookings)

| Field                                       | Owner | Notes                                                     |
| ------------------------------------------- | ----- | --------------------------------------------------------- |
| session_id                                  | 🟧    | Keys                                                      |
| mentor_id / mentee_id                       | 🟧    |                                                           |
| starts_at / ends_at                         | 🟧    | Booking engine source of truth                            |
| status (booked/cancelled/completed/no-show) | 🟧    | Lifecycle controlled in app                               |
| meeting_url                                 | 🟧    | Generated (Meet/Zoom); don’t store in Airtable if private |
| admin_notes                                 | 🟦    | PM-only notes; mirror to app for context                  |
| feedback_score/text                         | 🟧    | Collected in app after session                            |
| created_at / updated_at                     | 🟪    | Computed                                                  |

---

# Mentees (startup founders)

| Field                           | Owner | Notes                                                              |
| ------------------------------- | ----- | ------------------------------------------------------------------ |
| company name / stage            | 🟦    | PM-curated if they assist; otherwise app-owned and mirrored        |
| industry                        | 🟦    | Multi-select                                                       |
| goals / help needed (free text) | 🟦    | PM or self-service intake; used for matching                       |
| traction metrics (rev/users)    | 🟧    | Sensitive; app-owned; **optional** read-only aggregate in Airtable |

---

# Matching / AI

| Field                                | Owner | Notes                                                    |
| ------------------------------------ | ----- | -------------------------------------------------------- |
| embedding vectors                    | ⛔     | Not in Airtable; stored in Vector DB + Postgres metadata |
| embedding_model / dim / hash         | 🟧    | Tech metadata                                            |
| matching_rules (weights, thresholds) | 🟧    | Versioned config in app (YAML/JSON)                      |
| candidate_explanations (why matched) | 🟪    | Generated; can mirror summaries to Airtable for PMs      |

---

# Email & Notifications

| Field           | Owner | Notes                                     |
| --------------- | ----- | ----------------------------------------- |
| email templates | 🟧    | In code/DB; PMs preview only              |
| delivery logs   | 🟧    | System data; dashboarded, not in Airtable |

---

# Admin & Compliance

| Field                              | Owner | Notes             |
| ---------------------------------- | ----- | ----------------- |
| consent flags (GDPR/ToS/Marketing) | 🟧    | Legal—app-owned   |
| audit logs                         | 🟧    | App only          |
| PII (tokens, calendar creds)       | ⛔     | Never in Airtable |

---

## Sync Rules (crisp)

* **Row identity:** app stores `airtable_record_id` on `mentors`, optionally `mentees`.
* **Per-field authority:** if field is 🟦 Airtable, **Airtable wins**; if 🟧 App, **app wins**.
* **Transforms:** sanitize rich text, validate URLs, normalize enums, map multi-selects → normalized tables.
* **Idempotency:** all webhook/worker writes keyed by `(record_id, field_set_version)`.
* **Conflict resolution:** last-writer-wins **within the owner system** only; cross-system writes follow authority map.
* **Backfill/reconciliation:** nightly job compares checksums per record (selected fields) and repairs drift.
* **Rate limiting:** batch Airtable writes (10–50), exponential backoff, DLQ.

---

## Which columns to mirror to Airtable (read-only)

* **Utilization %**, **Avg feedback** (last 30/90 days) → quick PM scanning.
* **Visibility (listed/unlisted)** and **load cap** → read-only so PMs see why someone isn’t appearing.
* **Most recent 3 tags derived** (from embeddings/extractions) → helpful context for PMs.

---

## Quick acceptance criteria snippet

* PM edits **headline/bio/tags** in Airtable → webhook updates Postgres in ≤10s; embeddings re-generated; changes visible in UI.
* Mentor changes **availability** in app → outbox sync updates Airtable **view-only** fields for PM visibility.
* Attempting to change **app-owned** fields in Airtable is **ignored** and logs a note back to a “Sync Errors” table.

---

If you want, I’ll turn this into a pair of Airtable base templates (Mentors / Availability) with proper field types & example automations, plus the Postgres DDL for the normalized side.

