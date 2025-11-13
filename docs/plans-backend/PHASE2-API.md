# Phase 2 API Endpoints Implementation

## Database Schema Updates

### 1. Create Reviews/Feedback Table

Create [`lib/db/schema/reviews.ts`](lib/db/schema/reviews.ts) with:

- `reviews` table with fields: id, sessionId, mentorId, menteeId, rating (1-5), comment, outcomeTags (array), createdAt
- Relations to officeSessions, mentors, mentees
- Export from [`lib/db/schema/index.ts`](lib/db/schema/index.ts)

### 2. Update Sessions Schema

Modify [`lib/db/schema/sessions.ts`](lib/db/schema/sessions.ts):

- Update sessionStatusEnum to match frontend: "scheduled", "completed", "cancelled", "rescheduled" (currently uses "pending", "booked", "completed", "cancelled", "no_show")
- Add meetingType field (enum: "video", "in-person")
- Add goals field (text) for session goals/agenda
- Add duration field (integer) in minutes

## API Route Implementations

### 3. Matching Endpoint

Create [`app/api/match/route.ts`](app/api/match/route.ts):

- POST handler for AI-powered matching
- Extract query and filters from request body
- Implement rule-based matching algorithm:
- Score mentors based on expertise overlap (weight: 0.4)
- Score based on industry match (weight: 0.3)
- Score based on stage match (weight: 0.2)
- Score based on availability (weight: 0.1)
- Filter by minRating if provided
- Filter by pastInteractions preference
- Generate match explanations based on scoring factors
- Return sorted mentors with explanations and totalCount
- Use Drizzle queries with joins for mentor + user + expertise data

### 4. Mentor Search Endpoint

Create [`app/api/mentors/route.ts`](app/api/mentors/route.ts):

- GET handler for searching mentors with filters
- Support query params: search, expertise, industry, stage, availability, sort, page, limit
- Implement text search on name, bio, headline, company
- Filter by expertise areas (join expertise table)
- Filter by industry and stage
- Sort by: relevance (default), rating (when implemented), availability
- Return paginated results with mentor + user data
- Include pagination metadata

### 5. Single Mentor Endpoint

Create [`app/api/mentors/[id]/route.ts`](app/api/mentors/[id]/route.ts):

- GET handler for fetching single mentor by ID
- Join with users, expertise tables
- Calculate averageRating and reviewCount from reviews table
- Return full mentor profile with socialLinks (linkedinUrl)

### 6. Mentor Availability Endpoint

Create [`app/api/availability/mentor/[id]/route.ts`](app/api/availability/mentor/[id]/route.ts):

- GET handler for mentor availability
- Accept startDate and endDate query params (default to next 2 weeks)
- Query availability table for mentor's available slots
- Query officeSessions for booked slots in date range
- Return availableSlots, bookedSlots, timezone (from mentor profile)
- Format slots as TimeSlot[] with startTime, endTime, available, duration

### 7. Set Availability Endpoint

Create [`app/api/availability/route.ts`](app/api/availability/route.ts):

- POST handler for creating availability blocks
- Require authentication (mentor role only)
- Validate request: mentorId, startTime, endTime, timezone
- Check for conflicts with existing availability
- Support recurring patterns (store individual slots for now)
- Insert into availability table
- Return created availability object

### 8. Sessions List/Create Endpoints

Create [`app/api/sessions/route.ts`](app/api/sessions/route.ts):

**GET handler:**

- List sessions for current user (mentor or mentee)
- Filter by status: "upcoming", "past", "cancelled"
- Sort by date (ascending for upcoming, descending for past)
- Join with mentors, mentees, users tables
- Support pagination (page, limit params)
- Return sessions array with pagination metadata

**POST handler (booking):**

- Require authentication
- Validate booking request: mentorId, menteeId, startTime, duration, meetingType, goals
- Check mentor availability (query availability table)
- Check for conflicts (no overlapping officeSessions)
- Calculate endTime from startTime + duration
- Create officeSession with status "scheduled"
- Generate meetingUrl (placeholder for now, e.g., Zoom/Google Meet link)
- Return created session with calendarEvent details
- TODO: Send email notifications (Phase 3)

### 9. Session Detail/Update/Delete Endpoints

Create [`app/api/sessions/[id]/route.ts`](app/api/sessions/[id]/route.ts):

**GET handler:**

- Fetch single session by ID
- Require user is participant (mentor or mentee)
- Join with mentor, mentee, users data
- Return full session details

**PUT handler (reschedule):**

- Require authentication and participation
- Extract newStartTime from request body
- Validate new slot availability
- Check for conflicts
- Update session with new times
- Return updated session
- TODO: Send notifications (Phase 3)

**DELETE handler (cancel):**

- Require authentication and participation
- Update session status to "cancelled"
- Release availability slot
- Return 204 No Content
- TODO: Send notifications (Phase 3)

## Utility Functions

### 10. Create Matching Utilities

Create [`lib/utils/matching.ts`](lib/utils/matching.ts):

- `scoreExpertiseMatch(mentorExpertise: string[], queryExpertise: string[])` - Calculate overlap score
- `scoreIndustryMatch(mentorIndustry: string, queryIndustry?: string)` - Industry match score
- `scoreStageMatch(mentorStage: string, queryStage?: string)` - Stage match score
- `generateMatchExplanation(mentor, scores)` - Generate explanation text based on match factors
- `rankMentors(mentors, scores)` - Sort mentors by total score

### 11. Create Availability Utilities

Create [`lib/utils/availability.ts`](lib/utils/availability.ts):

- `checkAvailabilityConflict(mentorId, startTime, endTime)` - Check for overlapping slots
- `generateTimeSlots(availability, bookedSessions, startDate, endDate)` - Convert DB records to TimeSlot[]
- `isSlotAvailable(slot, bookedSlots)` - Check if slot is free

## Future AI Enhancements Documentation

### 12. Create AI Enhancement Notes

Create [`docs/plans-backend/ai-matching-enhancement.md`](docs/plans-backend/ai-matching-enhancement.md):

- Document plan for semantic search with embeddings (OpenAI text-embedding-3-small)
- Document plan for AI-generated match explanations (GPT-4o-mini)
- Note dependencies to add: `openai`, `ai` (Vercel AI SDK)
- Reference PHASE2.md implementation checklist items 182-188

## Testing & Validation

### 13. API Error Handling

- Use existing error utilities from [`lib/utils/api-errors.ts`](lib/utils/api-errors.ts)
- Add proper error messages for:
- Invalid mentor/mentee IDs
- Availability conflicts
- Booking conflicts
- Unauthorized access
- Validation errors

### 14. Type Safety

- Ensure all API responses match TypeScript types in [`types/index.ts`](types/index.ts)
- Map database schema to frontend types correctly
- Handle optional fields (rating, reviewCount until reviews are populated)

## Implementation Notes

- Use existing auth utilities from [`lib/auth/server.ts`](lib/auth/server.ts) for authentication
- Follow pattern from [`app/api/profiles/me/route.ts`](app/api/profiles/me/route.ts) for database queries
- Use Drizzle ORM query builder with relations for efficient joins
- Return consistent error responses using `createErrorResponse`, `createUnauthorizedResponse`
- Default pagination: 10 items per page (use DEFAULT_PAGE_SIZE constant)
- Timezone handling: Store UTC in database, return timezone info for frontend conversion
