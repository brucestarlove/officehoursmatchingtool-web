# Frontend Product Requirements Document
## Next.js Frontend for AI-Powered Office Hours Matching Platform

**Project:** CF Mentor-Mentee Matching System  
**Audience:** Frontend Engineers & UI/UX Designers  
**Focus:** Beautiful, intuitive, performant Next.js application  
**Framework:** Next.js 14+ (App Router) with TypeScript

---

## Vision & Core Philosophy

Build a frontend that feels **effortless and delightful**—users should experience the power of AI matching without seeing the complexity. Every interaction should be intuitive, responsive, and purposeful. The UI should guide users naturally through finding mentors, booking sessions, and providing feedback.

**Design Principle:** Beautiful UI/UX is non-negotiable. The frontend is the primary touchpoint for users—it must inspire confidence and make mentorship connections feel magical.

**Technical Ambition:** Leverage Next.js App Router for optimal performance, implement intelligent state management, and create reusable component patterns that scale.

---

## Technical Stack

### Core Framework
- **Next.js 14+** with App Router (TypeScript)
- **React 18+** with Server Components where applicable
- **Deployment:** Vercel (automatic deployments, edge functions support)

### State Management
- **TanStack Query (React Query)** - Server state, API caching, background refetching
- **Zustand** - Client-side UI state (modals, filters, form state, theme preferences)
- **React Hook Form** - Form state management and validation

### Authentication
- **NextAuth.js** / **BetterAuth** - Frontend auth UI and session management
- **Token Management:** HTTP-only cookies for refresh tokens, secure JWT storage
- **Backend Verification:** Tokens verified by AWS API Gateway / Lambda

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - See docs/prd/STYLE-BRAND_GUIDE.md, docs/prd/STYLE-IMPLEMENTATION.md, docs/prd/STYLE-QUICK_REFERENCE.md
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Icon library

### Data Fetching & API
- **Fetch API** / **Axios** - HTTP client (wrapped with TanStack Query)
- **API Base URL:** AWS API Gateway endpoint (environment variable)
- **Error Handling:** Centralized error boundary + toast notifications

### Form Handling
- **React Hook Form** - Form state and validation
- **Zod** - Schema validation (shared with backend)
- **React Hook Form Resolvers** - Zod integration

### File Uploads
- **Presigned URLs:** Fetch from `/uploads/presign` → Direct S3 upload
- **Progress Tracking:** Custom hook for upload progress
- **Image Preview:** Client-side image preview before upload

### Development Tools
- **TypeScript** - Type safety
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Storybook** (optional) - Component documentation and testing

---

## Architecture Overview

### Project Structure

```
app/
├── (auth)/
│   ├── login/
│   ├── signup/
│   └── layout.tsx
├── (dashboard)/
│   ├── dashboard/
│   ├── sessions/
│   ├── profile/
│   └── layout.tsx
├── (mentee)/
│   ├── match/
│   ├── mentors/
│   └── layout.tsx
├── (mentor)/
│   ├── availability/
│   ├── sessions/
│   └── layout.tsx
├── (admin)/
│   ├── analytics/
│   └── layout.tsx
├── api/
│   └── auth/
│       └── [...nextauth]/
├── layout.tsx
└── page.tsx

components/
├── ui/              # shadcn/ui components
├── auth/            # Auth-related components
├── mentor/          # Mentor cards, profiles
├── sessions/        # Session booking, calendar
├── match/           # Search, filters, results
├── feedback/        # Feedback forms
├── dashboard/       # Dashboard widgets
└── shared/          # Buttons, inputs, modals

lib/
├── api/             # API client functions
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── validations/     # Zod schemas
└── constants/       # App constants

types/
└── index.ts         # TypeScript type definitions

public/
└── assets/          # Static assets
```

### Component Architecture

**Atomic Design Methodology** (component hierarchy from smallest to largest):
- **Atoms:** Basic UI elements (Button, Input, Badge) - smallest reusable components
- **Molecules:** Composed components (SearchBar, MentorCard, SessionCard) - combinations of atoms
- **Organisms:** Complex components (MentorGrid, BookingFlow, MatchResults) - combinations of molecules
- **Templates:** Page layouts (DashboardLayout, MentorLayout) - page structure
- **Pages:** Full page components (MatchPage, DashboardPage) - specific instances with data

---

## User Flows & Key Screens

### 1. Authentication Flow

**Screens:**
- **Login Page** (`/login`)
  - Email/password or social auth (Google, GitHub)
  - "Forgot password" link
  - Redirect to dashboard after login
- **Signup Page** (`/signup`)
  - Role selection (Mentor/Mentee)
  - Basic profile info (pre-filled from Airtable if available)
  - Email verification flow
- **Onboarding** (first-time users)
  - Welcome screen
  - Profile completion wizard
  - Role-specific setup (availability for mentors, goals for mentees)

**User Stories:**
- As a new user, I want to sign up quickly with social auth so I can start using the platform immediately
- As a returning user, I want to log in seamlessly and be taken to my dashboard

---

### 2. Mentee Flow: Finding & Booking Mentors

**Screens:**

#### **Match/Search Page** (`/match`)
- **Search Interface:**
  - Large text input for free-text goals ("I need help with fundraising and pitch deck review")
  - Smart filters sidebar:
    - Expertise area (multi-select chips)
    - Industry (dropdown)
    - Startup stage (dropdown)
    - Availability (this week, next week, anytime)
  - "Search" button with loading state
- **Results Display:**
  - Grid/list toggle
  - Results count
  - Sort options (relevance, rating, availability)
  - **Mentor Cards:**
    - Profile photo (circular, with fallback avatar)
    - Name and title
    - Bio snippet (truncated, expandable)
    - Expertise tags (chips)
    - Average rating (stars) + review count
    - Match explanation badge ("Expert in fintech with 15 years experience")
    - Available time slots preview
    - "View Profile" and "Book Session" CTAs
  - Empty state: "No mentors found. Try adjusting your filters."
  - Loading skeleton states

#### **Mentor Profile Page** (`/mentors/[id]`)
- **Hero Section:**
  - Large profile photo
  - Name, title, company
  - Social links (LinkedIn, Twitter)
  - Average rating + review count
- **Bio Section:**
  - Full bio text
  - Expertise areas (tag cloud)
  - Industries served
  - Past session topics (if available)
- **Availability Calendar:**
  - Month/week view toggle
  - Available slots highlighted
  - Booked slots grayed out
  - Timezone indicator
  - "Select Time" CTA on available slots
- **Reviews Section:**
  - Recent feedback cards
  - Rating distribution chart
- **Actions:**
  - "Book Session" button (sticky on scroll)
  - "Save for Later" (bookmark)

#### **Booking Flow** (`/sessions/book`)
- **Step 1: Select Time**
  - Calendar widget
  - Available time slots list
  - Duration selector (30min, 60min)
- **Step 2: Confirm Details**
  - Selected mentor info
  - Date/time summary
  - Meeting type (video call, in-person)
  - Session goals/agenda (textarea)
- **Step 3: Confirmation**
  - Success message
  - Calendar invite download
  - Email confirmation sent notification
  - "View Session" CTA

**User Stories:**
- As a mentee, I want to search for mentors using natural language so I can find relevant experts quickly
- As a mentee, I want to see why a mentor was recommended so I can make informed decisions
- As a mentee, I want to book a session in under 3 clicks so the process is frictionless

---

### 3. Mentor Flow: Managing Availability & Sessions

**Screens:**

#### **Availability Management** (`/mentor/availability`)
- **Calendar View:**
  - Month/week/day views
  - Drag-and-drop to create blocks
  - Recurring availability patterns
  - Timezone selector
- **Availability Settings:**
  - Default duration (30min, 60min)
  - Buffer time between sessions
  - Blackout dates
  - Auto-accept/require approval toggle

#### **Sessions Dashboard** (`/mentor/sessions`)
- **Tabs:** Upcoming, Past, Cancelled
- **Session Cards:**
  - Mentee name and photo
  - Date/time
  - Session goals
  - Status badge
  - Actions (reschedule, cancel, view details)
- **Empty States:**
  - "No upcoming sessions" with CTA to set availability

**User Stories:**
- As a mentor, I want to set my availability once and have it sync automatically so I don't have to manage it manually
- As a mentor, I want to see my upcoming sessions at a glance so I can prepare

---

### 4. Dashboard (Both Roles)

**Screens:**

#### **Mentee Dashboard** (`/dashboard`)
- **Upcoming Sessions:**
  - Next session card (prominent)
  - List of upcoming sessions
  - Quick actions (reschedule, cancel)
- **Suggested Mentors:**
  - "Mentors you might like" carousel
  - Based on past searches and feedback
- **Recent Activity:**
  - Past sessions
  - Feedback submitted
- **Quick Actions:**
  - "Find a Mentor" CTA
  - "Complete Profile" (if incomplete)

#### **Mentor Dashboard** (`/dashboard`)
- **Stats Cards:**
  - Sessions this month
  - Average rating
  - Utilization rate
- **Upcoming Sessions:**
  - Next session details
  - Session queue
- **Quick Actions:**
  - "Update Availability" CTA
  - "View Analytics"

**User Stories:**
- As a user, I want to see my upcoming sessions immediately when I log in so I can plan my day
- As a mentee, I want proactive mentor suggestions so I can discover new experts

---

### 5. Session Management

**Screens:**

#### **Session Detail Page** (`/sessions/[id]`)
- **Session Info:**
  - Date/time
  - Participants (mentor/mentee cards)
  - Meeting link (if video call)
  - Session goals/agenda
  - Status badge
- **Actions:**
  - Reschedule (opens calendar modal)
  - Cancel (with confirmation)
  - Join Meeting (if video)
- **Feedback Section** (post-session):
  - Rating stars (1-5)
  - Comment textarea
  - Outcome tags (optional)
  - Submit button

**User Stories:**
- As a user, I want to easily reschedule or cancel sessions so I can manage my calendar flexibly
- As a mentee, I want to provide feedback quickly so I can help improve matching

---

### 6. Admin Dashboard (Phase 1)

**Screens:**

#### **Analytics Dashboard** (`/admin/analytics`)
- **Metrics Cards:**
  - Total sessions
  - Mentor utilization rate
  - Average feedback score
  - Active mentors/mentees
- **Charts (using Context7 MCP for `antvis/g6` graph visualization engine):**
  - Sessions over time (line chart)
  - Utilization by mentor (bar chart)
  - Feedback distribution (pie chart)
- **Data Tables:**
  - Session list (sortable, filterable)
  - Mentor performance
- **Export:**
  - CSV export button
  - Date range selector

**User Stories:**
- As an admin, I want to see platform health metrics at a glance so I can monitor adoption
- As an admin, I want to export session data so I can analyze trends

---

## Component Specifications

### Core UI Components

#### **MentorCard**
```typescript
interface MentorCardProps {
  mentor: Mentor;
  showMatchReason?: boolean;
  onBookClick?: (mentorId: string) => void;
  onViewProfile?: (mentorId: string) => void;
}
```
- Displays mentor photo, name, bio snippet, expertise tags, rating
- Match explanation badge (if applicable)
- Hover effects and smooth transitions
- Responsive: stacked on mobile, side-by-side on desktop

#### **SearchBar**
- Large, prominent input field
- Placeholder: "What do you need help with?"
- Auto-focus on page load
- Debounced search (300ms)
- Recent searches dropdown (localStorage)

#### **FilterSidebar**
- Collapsible on mobile (drawer)
- Multi-select chips for expertise
- Dropdowns for industry/stage
- "Clear Filters" button
- Active filter count badge

#### **CalendarWidget**
- Month/week view toggle
- Available slots highlighted (green)
- Booked slots grayed out
- Hover to show time details
- Click to select slot
- Timezone indicator

#### **SessionCard**
- Compact card showing session details
- Status badge (upcoming, completed, cancelled)
- Quick actions (reschedule, cancel)
- Expandable for full details

#### **FeedbackForm**
- Star rating component (interactive)
- Comment textarea (optional)
- Outcome tags (multi-select)
- Submit button with loading state
- Success toast on submit

---

## State Management Patterns

### TanStack Query (Server State)

**Query Keys:**
```typescript
const queryKeys = {
  mentors: {
    all: ['mentors'] as const,
    search: (query: string, filters: Filters) => ['mentors', 'search', query, filters] as const,
    detail: (id: string) => ['mentors', id] as const,
  },
  sessions: {
    all: ['sessions'] as const,
    upcoming: () => ['sessions', 'upcoming'] as const,
    detail: (id: string) => ['sessions', id] as const,
  },
  // ... more keys
};
```

**Query Hooks:**
```typescript
// Example: useMentorSearch
export function useMentorSearch(query: string, filters: Filters) {
  return useQuery({
    queryKey: queryKeys.mentors.search(query, filters),
    queryFn: () => api.searchMentors(query, filters),
    enabled: query.length > 0 || Object.keys(filters).length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

**Mutation Hooks:**
```typescript
// Example: useBookSession
export function useBookSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.bookSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
      toast.success('Session booked successfully!');
    },
    onError: (error) => {
      toast.error('Failed to book session. Please try again.');
    },
  });
}
```

### Zustand (Client State)

**Store Examples:**
```typescript
// UI Store
interface UIStore {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

// Filter Store
interface FilterStore {
  expertise: string[];
  industry: string | null;
  stage: string | null;
  setExpertise: (expertise: string[]) => void;
  clearFilters: () => void;
}
```

---

## API Integration

### API Client Setup

```typescript
// lib/api/client.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add auth token
apiClient.interceptors.request.use((config) => {
  const token = getToken(); // From NextAuth session
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      signOut();
    }
    return Promise.reject(error);
  }
);
```

### API Functions

```typescript
// lib/api/mentors.ts
export const mentorApi = {
  search: (query: string, filters: Filters) =>
    apiClient.post<MentorSearchResponse>('/match', { query, filters }),
  
  getById: (id: string) =>
    apiClient.get<Mentor>(`/profiles/mentor/${id}`),
  
  // ... more functions
};
```

---

## Performance Requirements

### Core Web Vitals Targets
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### Performance Optimizations
- **Image Optimization:**
  - Next.js Image component for all images
  - Lazy loading below the fold
  - WebP format with fallbacks
  - Responsive sizes (srcset)
- **Code Splitting:**
  - Route-based code splitting (automatic with App Router)
  - Dynamic imports for heavy components (modals, charts)
- **Caching Strategy:**
  - TanStack Query caching (5min stale time for search results)
  - Static page generation where possible (ISR for mentor profiles)
  - Service worker for offline support (Phase 2)
- **Bundle Size:**
  - Target: Initial bundle < 200KB (gzipped)
  - Tree-shaking enabled
  - Analyze bundle with `@next/bundle-analyzer`

---

## Accessibility Requirements

### WCAG AA Compliance
- **Keyboard Navigation:** All interactive elements keyboard accessible
- **Screen Reader Support:** Proper ARIA labels, semantic HTML
- **Color Contrast:** Minimum 4.5:1 for text, 3:1 for UI components
- **Focus Indicators:** Visible focus states on all focusable elements
- **Alt Text:** All images have descriptive alt text
- **Form Labels:** All form inputs have associated labels
- **Error Messages:** Clear, accessible error messages

### Implementation
- Use semantic HTML (`<nav>`, `<main>`, `<article>`)
- ARIA attributes where needed (`aria-label`, `aria-describedby`)
- Skip links for main content
- Focus trap in modals
- Screen reader announcements for dynamic content

---

## Responsive Design

### Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

### Mobile-First Approach
- Design for mobile first, enhance for larger screens
- Touch-friendly targets (minimum 44x44px)
- Bottom navigation on mobile
- Collapsible filters (drawer on mobile, sidebar on desktop)
- Swipe gestures for mentor cards (optional, Phase 2)

---

## Error Handling & Loading States

### Error Boundaries
- Global error boundary at app level
- Route-level error boundaries for graceful degradation
- Fallback UI with "Try again" button

### Loading States
- Skeleton screens for content loading
- Spinner for button actions
- Progress indicators for multi-step flows
- Optimistic updates where appropriate (e.g., booking sessions)

### Toast Notifications
- Success: Green toast with checkmark
- Error: Red toast with error icon
- Info: Blue toast for informational messages
- Auto-dismiss after 5 seconds (configurable)

---

## Security Considerations

### Frontend Security
- **XSS Prevention:** Sanitize user input, use React's built-in escaping
- **CSRF Protection:** SameSite cookies, CSRF tokens for mutations
- **Token Storage:** HTTP-only cookies (handled by NextAuth)
- **Environment Variables:** Never expose secrets in client code
- **Content Security Policy:** Strict CSP headers

### Data Privacy
- **GDPR Compliance:** Cookie consent banner (if needed)
- **Data Minimization:** Only request necessary data
- **User Data Export:** Provide user data export functionality

---

## Testing Strategy

### Unit Tests
- **Framework:** Vitest or Jest
- **Coverage:** Critical utilities and hooks (>80%)
- **Components:** Test component logic with React Testing Library

### Integration Tests
- **API Integration:** Mock API responses, test data flow
- **User Flows:** Test complete flows (search → book → feedback)

### E2E Tests
- **Framework:** Playwright or Cypress
- **Critical Paths:**
  - User signup → search → book session
  - Mentor sets availability → receives booking
  - User provides feedback

### Visual Regression
- **Tool:** Chromatic or Percy (optional)
- **Screenshots:** Key screens and components

---

## Phased Implementation Plan

### Phase 1: Foundation & Core Features (Weeks 1-4)

**Deliverables:**
- ✅ Next.js project setup with TypeScript
- ✅ Authentication flow (login, signup, NextAuth integration)
- ✅ Basic routing and layout structure
- ✅ API client setup with TanStack Query
- ✅ Search/match page with basic mentor cards
- ✅ Mentor profile page
- ✅ Booking flow (3-step wizard)
- ✅ Dashboard (upcoming sessions, basic stats)
- ✅ Session detail page
- ✅ Responsive design (mobile + desktop)

**Components:**
- Auth pages (login, signup)
- SearchBar, FilterSidebar, MentorCard
- BookingFlow (multi-step)
- Dashboard widgets
- SessionCard, SessionDetail

---

### Phase 2: Enhanced Matching & Feedback (Weeks 5-8)

**Deliverables:**
- ✅ Match explanation badges ("Why this mentor?")
- ✅ Feedback form and submission flow
- ✅ Enhanced mentor profile (reviews section)
- ✅ Proactive mentor suggestions on dashboard
- ✅ Advanced filters (availability, past interactions)
- ✅ Loading skeletons and improved loading states
- ✅ Toast notifications system
- ✅ Error boundaries

**Components:**
- FeedbackForm, RatingStars
- MatchExplanationBadge
- MentorSuggestions carousel
- Toast/Notification system

---

### Phase 3: Advanced Features & Polish (Weeks 9-12)

**Deliverables:**
- ✅ Calendar integration UI (Google Calendar sync)
- ✅ Proactive matching notifications
- ✅ Advanced admin analytics dashboard
- ✅ Export functionality (CSV download)
- ✅ Performance optimizations (code splitting, image optimization)
- ✅ Accessibility audit and fixes
- ✅ Animation polish (Framer Motion)
- ✅ Offline support (service worker)

**Components:**
- CalendarSyncSettings
- AnalyticsDashboard (charts and tables)
- ExportButton
- OfflineIndicator

---

## Design System & Branding

### Color Palette
- **Primary:** CF brand colors (to be defined)
- **Secondary:** Complementary colors for accents
- **Neutral:** Gray scale for text and backgrounds
- **Semantic:** Success (green), Error (red), Warning (yellow), Info (blue)

### Typography
- **Headings:** Bold, modern sans-serif
- **Body:** Readable sans-serif
- **Code:** Monospace for technical content

### Spacing
- **Base Unit:** 4px (Tailwind default)
- **Consistent spacing scale:** Use Tailwind spacing utilities

### Components Library
- Use **shadcn/ui**
- Customize to match CF branding 
- Document in Storybook (optional)

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.example.com
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_AIRTABLE_BASE_ID=your-base-id
```

---

## Dependencies

### Core Dependencies
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.0"
}
```

### State Management
```json
{
  "@tanstack/react-query": "^5.0.0",
  "zustand": "^4.4.0",
  "react-hook-form": "^7.48.0",
  "zod": "^3.22.0"
}
```

### UI & Styling
```json
{
  "tailwindcss": "^3.3.0",
  "framer-motion": "^10.16.0",
  "lucide-react": "^0.294.0",
  "@radix-ui/react-*": "latest"
}
```

### Auth
```json
{
  "next-auth": "^4.24.0"
}
```

### Utilities
```json
{
  "axios": "^1.6.0",
  "date-fns": "^2.30.0",
  "clsx": "^2.0.0"
}
```

---

## Success Metrics (Frontend-Specific)

- **Page Load Time:** < 2s for initial load
- **Time to Interactive:** < 3s
- **Search Response Time:** Results displayed within 2s of search
- **Booking Completion Rate:** > 80% of users who start booking complete it
- **Mobile Usage:** > 50% of sessions on mobile devices
- **Accessibility Score:** 100% Lighthouse accessibility score
- **Error Rate:** < 1% of page loads result in errors

---

## Questions for Frontend Team

1. **Component Library:** shadcn/ui
2. **Animation Library:** Framer Motion
3. **Form Validation:** Zod schemas shared with backend
4. **Image Hosting:** S3 presigned URLs

---

## Next Steps

1. Set up Next.js project with TypeScript and Tailwind CSS
2. Configure NextAuth to authenticate with backend API (backend handles Cognito)
3. Set up TanStack Query and API client
4. Create component library structure (atomic design: atoms → molecules → organisms)
5. Design and implement authentication pages
6. Build search/match page with mentor cards
7. Implement booking flow
8. Create dashboard layouts
9. Add responsive design and accessibility features
10. Performance optimization and testing

---

**Document Prepared For:** Frontend Engineers & UI/UX Designers  
**Contact:** Bruce "Starlove" Robinson (Founder/CEO, Starscape)  
**Project Goal:** Build the most beautiful, intuitive frontend that makes AI-powered mentor matching feel effortless and magical.
