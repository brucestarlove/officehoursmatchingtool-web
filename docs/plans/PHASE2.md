# Phase 2: Core Features - Matching & Booking

**Timeline:** Weeks 4-6  
**Objective:** Enable mentees to find and book sessions with mentors.

---

## Overview

This phase implements the core matching and booking functionality, allowing mentees to search for mentors, view profiles, and book sessions. The AI-powered matching system provides intelligent recommendations with explanations.

---

## Frontend Deliverables

### Search/Match Page (`/match`)

#### Search Interface
- ✅ Large, prominent search input with CF styling
- ✅ Placeholder: "What do you need help with?"
- ✅ Auto-focus on page load
- ✅ Debounced search (300ms)
- ✅ Recent searches dropdown (localStorage)

#### Filter Sidebar
- ✅ Collapsible on mobile (drawer), sidebar on desktop
- ✅ Expertise area multi-select chips (CF badge variants)
- ✅ Industry dropdown
- ✅ Startup stage dropdown
- ✅ Availability filters (this week, next week, anytime)
- ✅ "Clear Filters" button
- ✅ Active filter count badge

#### Results Display
- ✅ Grid/list view toggle
- ✅ Results count display
- ✅ Sort options (relevance, rating, availability)
- ✅ Mentor cards with CF card variants
  - Profile photo (circular, with fallback avatar)
  - Name and title
  - Bio snippet (truncated, expandable)
  - Expertise tags (CF badges)
  - Average rating (stars) + review count
  - Available time slots preview
  - "View Profile" and "Book Session" CTAs
- ✅ Empty state: "No mentors found. Try adjusting your filters."
- ✅ Loading skeleton states
- ✅ Pagination or infinite scroll

### Mentor Profile Page (`/mentors/[id]`)

#### Hero Section
- ✅ Large profile photo with CF styling
- ✅ Name, title, company
- ✅ Social links (LinkedIn, Twitter)
- ✅ Average rating + review count

#### Bio Section
- ✅ Full bio text
- ✅ Expertise areas (tag cloud with CF badges)
- ✅ Industries served
- ✅ Past session topics (if available)

#### Availability Calendar
- ✅ Month/week view toggle
- ✅ Available slots highlighted (green)
- ✅ Booked slots grayed out
- ✅ Hover to show time details
- ✅ Click to select slot
- ✅ Timezone indicator
- ✅ "Select Time" CTA on available slots

#### Reviews Section
- ✅ Recent feedback cards
- ✅ Rating distribution chart
- ✅ Expandable review list

#### Actions
- ✅ "Book Session" button (sticky on scroll) - CF yellow primary
- ✅ "Save for Later" (bookmark)

### Booking Flow (`/sessions/book`)

#### Step 1: Select Time
- ✅ Calendar widget
- ✅ Available time slots list
- ✅ Duration selector (30min, 60min)
- ✅ Selected slot highlight

#### Step 2: Confirm Details
- ✅ Selected mentor info card
- ✅ Date/time summary
- ✅ Meeting type (video call, in-person)
- ✅ Session goals/agenda (textarea)
- ✅ Form validation

#### Step 3: Confirmation
- ✅ Success message with CF styling
- ✅ Calendar invite download
- ✅ Email confirmation sent notification
- ✅ "View Session" CTA

### Dashboard (`/dashboard`)

#### Mentee Dashboard
- ✅ Upcoming Sessions:
  - Next session card (prominent, CF yellow-border card)
  - List of upcoming sessions
  - Quick actions (reschedule, cancel)
- ✅ Suggested Mentors:
  - "Mentors you might like" carousel
  - Based on past searches and feedback
- ✅ Recent Activity:
  - Past sessions
  - Feedback submitted
- ✅ Quick Actions:
  - "Find a Mentor" CTA (CF yellow button)
  - "Complete Profile" (if incomplete)

#### Mentor Dashboard
- ✅ Stats Cards (CF card variants):
  - Sessions this month
  - Average rating
  - Utilization rate
- ✅ Upcoming Sessions:
  - Next session details
  - Session queue
- ✅ Quick Actions:
  - "Update Availability" CTA
  - "View Analytics"

### Session Detail Page (`/sessions/[id]`)
- ✅ Session info card
- ✅ Date/time display
- ✅ Participants (mentor/mentee cards)
- ✅ Meeting link (if video call)
- ✅ Session goals/agenda
- ✅ Status badge
- ✅ Actions:
  - Reschedule (opens calendar modal)
  - Cancel (with confirmation)
  - Join Meeting (if video)

### Responsive Design
- ✅ Mobile-first approach
- ✅ Touch-friendly targets
- ✅ Bottom navigation on mobile
- ✅ Collapsible filters (drawer on mobile)
- ✅ Swipe gestures for mentor cards (optional)

---

## Backend Deliverables

### AI Matching Endpoint (`POST /match`)

#### Request
```typescript
{
  query: string;           // Natural language query
  filters: {
    expertise?: string[];
    industry?: string;
    stage?: string;
    availability?: string;
  };
}
```

#### Response
```typescript
{
  mentors: Mentor[];
  matchExplanations: {
    [mentorId: string]: string;  // "Why this mentor?" explanation
  };
  totalCount: number;
}
```

#### Implementation
- ✅ Natural language query processing (Vercel AI SDK)
- ✅ Expertise matching algorithm
- ✅ Industry matching
- ✅ Startup stage matching
- ✅ Availability filtering
- ✅ Match explanation generation
- ✅ Ranking/scoring system

### Mentor Search Endpoint (`GET /mentors`)

#### Query Parameters
- `search` - Text search
- `expertise` - Comma-separated expertise areas
- `industry` - Industry filter
- `stage` - Startup stage filter
- `availability` - Availability filter
- `sort` - Sort by (relevance, rating, availability)
- `page` - Page number
- `limit` - Results per page

#### Response
- ✅ Filtered and sorted mentor list
- ✅ Pagination metadata
- ✅ Total count

### Availability Endpoints

#### Get Mentor Availability (`GET /availability/mentor/{id}`)
- ✅ Available time slots
- ✅ Booked time slots
- ✅ Timezone information
- ✅ Date range support

#### Set Availability (`POST /availability`)
- ✅ Create availability blocks
- ✅ Recurring patterns support
- ✅ Timezone handling
- ✅ Conflict detection

### Session Booking Endpoint (`POST /sessions`)

#### Request
```typescript
{
  mentorId: string;
  menteeId: string;
  startTime: string;      // ISO 8601
  duration: number;       // minutes
  meetingType: 'video' | 'in-person';
  goals?: string;
}
```

#### Response
- ✅ Created session object
- ✅ Calendar event details
- ✅ Email notification trigger

#### Implementation
- ✅ Session creation with mentor/mentee pairing
- ✅ Availability validation
- ✅ Conflict checking
- ✅ Email notifications (mentor and mentee)
- ✅ Calendar event creation (if integrated)

### Session Management Endpoints

#### List Sessions (`GET /sessions`)
- ✅ User's sessions (mentor or mentee)
- ✅ Filter by status (upcoming, past, cancelled)
- ✅ Sort by date
- ✅ Pagination

#### Get Session Details (`GET /sessions/{id}`)
- ✅ Full session information
- ✅ Participants details
- ✅ Meeting link
- ✅ Status

#### Reschedule Session (`PUT /sessions/{id}`)
- ✅ Update start time
- ✅ Availability validation
- ✅ Notification to both parties

#### Cancel Session (`DELETE /sessions/{id}`)
- ✅ Session cancellation
- ✅ Availability release
- ✅ Notification to both parties

---

## Components

### Matching Components
- `components/match/SearchBar` - Large search input with CF styling
- `components/match/FilterSidebar` - Collapsible filter panel
- `components/match/MentorCard` - Mentor card with CF card variant
- `components/match/MentorGrid` - Grid layout for mentor cards
- `components/match/MatchExplanationBadge` - "Why this mentor?" badge
- `components/match/EmptyState` - No results state

### Mentor Profile Components
- `components/mentor/MentorProfile` - Full mentor profile page
- `components/mentor/AvailabilityCalendar` - Calendar widget
- `components/mentor/ReviewsSection` - Reviews and ratings
- `components/mentor/ExpertiseTags` - Expertise tag cloud

### Booking Components
- `components/sessions/BookingFlow` - Multi-step booking wizard
- `components/sessions/TimeSlotSelector` - Time slot selection
- `components/sessions/SessionConfirmation` - Confirmation step
- `components/sessions/SessionCard` - Session card component
- `components/sessions/SessionDetail` - Session detail page

### Dashboard Components
- `components/dashboard/DashboardWidget` - Reusable dashboard widget
- `components/dashboard/UpcomingSessions` - Sessions list
- `components/dashboard/MentorSuggestions` - Suggested mentors carousel
- `components/dashboard/StatsCard` - Statistics display card

---

## Success Criteria

- [ ] Mentees can search for mentors using natural language
- [ ] Search results are relevant and well-ranked
- [ ] Match explanations are clear and helpful
- [ ] Booking flow completes in under 3 clicks
- [ ] Sessions are created successfully
- [ ] Email notifications are sent correctly
- [ ] Availability calendar displays correctly
- [ ] Dashboard shows relevant information
- [ ] All UI components use CF brand styling
- [ ] Responsive design works on all devices

---

## API Endpoints Summary

```
POST   /match
GET    /mentors
GET    /availability/mentor/{id}
POST   /availability
POST   /sessions
GET    /sessions
GET    /sessions/{id}
PUT    /sessions/{id}
DELETE /sessions/{id}
```

---

## Testing Checklist

- [ ] Unit tests for matching algorithm
- [ ] Integration tests for search flow
- [ ] E2E test: Search → View Profile → Book Session
- [ ] Test booking flow with various scenarios
- [ ] Test availability calendar interactions
- [ ] Test error scenarios (no availability, conflicts)
- [ ] Test responsive design on multiple devices
- [ ] Test match explanation generation

---

## Notes

- AI matching should prioritize relevance, then availability
- Match explanations should be concise but informative
- Booking flow should be as frictionless as possible
- Consider implementing optimistic updates for better UX
- Calendar widget should handle timezones correctly
- Email notifications should be sent asynchronously

---

**Previous Phase:** [PHASE1.md](./PHASE1.md) - Authentication & Profile Management  
**Next Phase:** [PHASE3.md](./PHASE3.md) - Feedback & Matching Improvements

