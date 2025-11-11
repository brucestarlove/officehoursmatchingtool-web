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

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

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

## License

Private - CF Office Hours Matching Tool

