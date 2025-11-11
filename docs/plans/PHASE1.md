# Phase 1: Core Features - Authentication & Profile Management

**Timeline:** Weeks 2-3  
**Objective:** Enable users to authenticate and manage their profiles.

---

## Overview

This phase establishes user authentication and profile management, enabling users to sign up, log in, and manage their mentor or mentee profiles. All UI components use the CF brand styling established in Phase 0.

---

## Frontend Deliverables

### Authentication Pages

#### Login Page (`/login`)
- ✅ Email/password login form with CF styling
- ✅ Social authentication buttons (Google, GitHub)
- ✅ "Forgot password" link
- ✅ Error handling and validation
- ✅ Loading states
- ✅ Redirect to dashboard after successful login

#### Signup Page (`/signup`)
- ✅ Role selection (Mentor/Mentee) with CF card variants
- ✅ Basic profile info form
- ✅ Pre-filled data from Airtable (if available)
- ✅ Email verification flow
- ✅ Error handling and validation

#### Forgot Password Flow
- ✅ Password reset request form
- ✅ Email sent confirmation
- ✅ Password reset form with token validation

### Authentication Integration
- ✅ NextAuth.js / BetterAuth integration
- ✅ Session management
- ✅ Token refresh handling
- ✅ Protected route middleware
- ✅ Role-based route protection

### Profile Management Pages

#### Profile View/Edit (`/profile`)
- ✅ Profile display with CF card styling
- ✅ Edit mode toggle
- ✅ Form validation
- ✅ Save/cancel actions
- ✅ Success/error feedback

#### Onboarding Wizard
- ✅ Multi-step wizard for first-time users
- ✅ Welcome screen
- ✅ Profile completion steps
- ✅ Role-specific setup:
  - **Mentors:** Availability preferences, expertise areas
  - **Mentees:** Goals, interests, startup stage

### API Client Setup
- ✅ TanStack Query configuration
- ✅ API client with interceptors
- ✅ Error handling utilities
- ✅ Request/response types
- ✅ Query key factory

### Error Handling & Loading States
- ✅ Global error boundary
- ✅ Form validation errors
- ✅ Loading spinners
- ✅ Skeleton screens for profile data

### Responsive Design
- ✅ Mobile-first approach
- ✅ Touch-friendly targets (44x44px minimum)
- ✅ Responsive forms
- ✅ Mobile navigation

---

## Backend Deliverables

### Authentication Endpoints

#### Login (`POST /auth/login`)
- Email/password authentication
- Social OAuth (Google, GitHub)
- JWT token generation
- Refresh token management
- Error responses

#### Signup (`POST /auth/signup`)
- User registration with role assignment
- Email verification
- Profile creation
- Airtable sync trigger

#### Token Refresh (`POST /auth/refresh`)
- Refresh token validation
- New access token generation

#### Password Reset (`POST /auth/forgot-password`)
- Password reset request
- Email notification
- Token generation

#### Password Reset Confirm (`POST /auth/reset-password`)
- Token validation
- Password update
- Session invalidation

### Profile Endpoints

#### Get Mentor Profile (`GET /profiles/mentor/{id}`)
- Profile data retrieval
- Expertise areas
- Availability summary
- Rating and review count

#### Update Mentor Profile (`PUT /profiles/mentor/{id}`)
- Profile update
- Validation
- Airtable sync

#### Get Mentee Profile (`GET /profiles/mentee/{id}`)
- Profile data retrieval
- Goals and interests
- Session history summary

#### Update Mentee Profile (`PUT /profiles/mentee/{id}`)
- Profile update
- Validation
- Airtable sync

### Airtable Integration
- ✅ Profile sync on create/update
- ✅ Initial data import
- ✅ Conflict resolution
- ✅ Error handling and retries

### Role-Based Access Control (RBAC)
- ✅ Role verification middleware
- ✅ Permission checks
- ✅ Route protection
- ✅ API endpoint protection

---

## Components

### Authentication Components
- `components/auth/LoginForm` - Login form with CF styling
- `components/auth/SignupForm` - Signup form with role selection
- `components/auth/ForgotPasswordForm` - Password reset form
- `components/auth/SocialAuthButtons` - Social login buttons
- `components/auth/ProtectedRoute` - Route protection wrapper

### Profile Components
- `components/profile/ProfileForm` - Profile edit form
- `components/profile/ProfileView` - Profile display
- `components/profile/OnboardingWizard` - Multi-step onboarding
- `components/profile/RoleSelector` - Mentor/Mentee selection
- `components/profile/ExpertiseSelector` - Expertise area selection

### Shared Components
- `components/ui/Input` - Form input with CF styling
- `components/ui/Select` - Dropdown select
- `components/ui/Label` - Form labels
- `components/ui/ErrorMessage` - Error display
- `components/ui/LoadingSpinner` - Loading indicator

---

## Success Criteria

- [ ] Users can sign up with email/password or social auth
- [ ] Users can log in and maintain sessions
- [ ] Role-based routing works correctly (mentors vs mentees)
- [ ] Profiles sync with Airtable successfully
- [ ] Profile editing saves correctly
- [ ] Onboarding wizard completes successfully
- [ ] Error handling works for all auth flows
- [ ] Responsive design works on mobile and desktop
- [ ] All UI components use CF brand styling

---

## API Endpoints Summary

```
POST   /auth/login
POST   /auth/signup
POST   /auth/refresh
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /profiles/mentor/{id}
PUT    /profiles/mentor/{id}
GET    /profiles/mentee/{id}
PUT    /profiles/mentee/{id}
```

---

## Testing Checklist

- [ ] Unit tests for auth utilities
- [ ] Integration tests for login/signup flows
- [ ] E2E test for complete signup → login → profile flow
- [ ] Test Airtable sync on profile updates
- [ ] Test role-based access control
- [ ] Test error scenarios (invalid credentials, network errors)
- [ ] Test responsive design on multiple devices

---

## Notes

- Ensure all forms use CF brand styling (yellow primary buttons, teal secondary)
- Profile images should use Next.js Image component for optimization
- Consider implementing optimistic updates for better UX
- Airtable sync should be asynchronous to avoid blocking user actions

---

**Previous Phase:** [PHASE0.md](./PHASE0.md) - Foundation & Design System Setup  
**Next Phase:** [PHASE2.md](./PHASE2.md) - Matching & Booking

