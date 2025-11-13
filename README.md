# CF Office Hours Matching Tool - Web Frontend

AI-Powered Mentor-Mentee Matching Platform built with Next.js 14+ and TypeScript.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Environment Variables

Required environment variables:

```bash
# Database
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Application
APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron (optional, for production)
CRON_SECRET=your-secret-key-here
```

**Email Configuration:**
- `RESEND_API_KEY`: Your Resend API key from [resend.com](https://resend.com)
- `RESEND_FROM_EMAIL`: The verified sender email address in Resend
- `APP_URL`: Base URL for email links (used in email templates)

**Cron Configuration:**
- `CRON_SECRET`: Optional secret for manually testing cron endpoints (not required for Vercel's automatic cron jobs)

**Important Notes:**
- Vercel cron jobs **only run in production deployments** (not in preview deployments or local development)
- The cron job is configured in `vercel.json` and will automatically run hourly once deployed
- To test locally, you can manually call: `GET http://localhost:3000/api/cron/send-reminders` (with `Authorization: Bearer <CRON_SECRET>` header if `CRON_SECRET` is set)
- Vercel automatically adds authentication headers to cron requests, so no manual setup is needed in production

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
├── app/                    # Next.js App Router pages
├── components/            # React components
│   ├── ui/               # UI components (CF-branded)
│   ├── auth/             # Authentication components
│   ├── mentor/           # Mentor-related components
│   ├── sessions/         # Session-related components
│   └── ...
├── lib/                  # Utility functions
├── docs/                 # Documentation
│   ├── plans/           # Development phase plans
│   └── prd/             # Product requirements
└── public/              # Static assets
```

## Design System

This project uses the CF Brand Style Guide extending shadcn/ui:

- **Primary Color:** CF Teal (#00a88c)
- **Accent Color:** CF Yellow (#ffbd00)
- **Hero Color:** CF Green (#1b5e20)
- **Content Background:** CF Beige (#faf9f7)

See `docs/prd/STYLE-BRAND_GUIDE.md` for complete design system documentation.

## Development Phases

See `docs/plans/` for detailed phase documentation:

- [Phase 0: Foundation & Design System](./docs/plans/PHASE0.md) ✅
- [Phase 1: Authentication & Profiles](./docs/plans/PHASE1.md)
- [Phase 2: Matching & Booking](./docs/plans/PHASE2.md)
- [Phase 3: Feedback & Matching](./docs/plans/PHASE3.md)
- [Phase 4: Admin & Analytics](./docs/plans/PHASE4.md)
- [Phase 5: Calendar & Notifications](./docs/plans/PHASE5.md)
- [Phase 6: Polish & Optimization](./docs/plans/PHASE6.md)
- [Phase 7: Testing & Launch](./docs/plans/PHASE7.md)

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (extended with CF branding)
- **Icons:** Lucide React

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
