# CF Brand Style Guide - Implementation Guide

This guide provides step-by-step instructions for implementing the CF brand style guide with shadcn/ui.

---

## Step 1: Install Dependencies

```bash
npm install tailwindcss postcss autoprefixer
npm install -D @tailwindcss/typography
```

---

## Step 2: Configure Tailwind CSS

Create or update `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // CF Brand Colors
        'cf-teal': {
          50: '#e6f7f5',
          100: '#b3e8e0',
          200: '#80d9cb',
          300: '#4dcab6',
          400: '#1abba1',
          500: '#00a88c',
          600: '#008770',
          700: '#006654',
          800: '#004538',
          900: '#00241c',
        },
        'cf-yellow': {
          50: '#fff9e6',
          100: '#ffedb3',
          200: '#ffe180',
          300: '#ffd54d',
          400: '#ffc91a',
          500: '#ffbd00',
          600: '#cc9700',
          700: '#997100',
          800: '#664b00',
          900: '#332500',
        },
        'cf-green': {
          50: '#e8f5e9',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#4caf50',
          600: '#43a047',
          700: '#388e3c',
          800: '#2e7d32',
          900: '#1b5e20',
          950: '#0d3e11',
        },
        'cf-red': {
          50: '#ffebee',
          100: '#ffcdd2',
          200: '#ef9a9a',
          300: '#e57373',
          400: '#ef5350',
          500: '#f44336',
          600: '#e53935',
          700: '#d32f2f',
          800: '#c62828',
          900: '#b71c1c',
        },
        'cf-beige': {
          50: '#faf9f7',
          100: '#f5f3f0',
          200: '#ebe8e3',
          300: '#e0dcd6',
          400: '#d6d1c9',
          500: '#ccc6bc',
        },
        // shadcn/ui colors mapped to CF brand
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'cf': '0.75rem',
        'cf-lg': '1rem',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'cf-yellow': '0 4px 14px 0 rgb(255 189 0 / 0.3)',
        'cf-teal': '0 4px 14px 0 rgb(0 168 140 / 0.3)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## Step 3: Update Global CSS

Update `app/globals.css` or `styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* CF Brand Colors - HSL format for shadcn/ui */
    --cf-teal-500: 173 100% 33%;
    --cf-yellow-500: 45 100% 50%;
    --cf-green-900: 142 60% 20%;
    --cf-green-950: 142 70% 12%;
    --cf-red-500: 4 90% 58%;
    --cf-beige-50: 40 20% 97%;
    
    /* shadcn/ui variables mapped to CF colors */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    
    --primary: 173 100% 33%;  /* CF Teal */
    --primary-foreground: 0 0% 100%;
    
    --secondary: 45 100% 50%;  /* CF Yellow */
    --secondary-foreground: 0 0% 9%;
    
    --accent: 45 100% 50%;  /* CF Yellow */
    --accent-foreground: 0 0% 9%;
    
    --destructive: 4 90% 58%;  /* CF Red */
    --destructive-foreground: 0 0% 98%;
    
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 173 100% 33%;  /* CF Teal */
    
    --radius: 0.75rem;  /* CF standard radius */
  }
  
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    
    --primary: 173 100% 40%;  /* Lighter teal for dark mode */
    --primary-foreground: 0 0% 100%;
    
    --secondary: 45 100% 55%;  /* Lighter yellow for dark mode */
    --secondary-foreground: 0 0% 9%;
    
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 173 100% 40%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
  
  /* CF Typography Styles */
  h1, h2, h3 {
    @apply font-display font-bold uppercase tracking-tight;
  }
  
  h1 {
    @apply text-4xl md:text-5xl lg:text-6xl;
  }
  
  h2 {
    @apply text-3xl md:text-4xl lg:text-5xl;
  }
  
  h3 {
    @apply text-2xl md:text-3xl;
  }
  
  h4, h5, h6 {
    @apply font-sans font-semibold;
  }
}
```

---

## Step 4: Custom Button Variants

Create `components/ui/button-cf.tsx`:

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-cf-yellow-500 text-gray-900 hover:bg-cf-yellow-600 hover:shadow-cf-yellow",
        secondary: "bg-cf-teal-500 text-white hover:bg-cf-teal-600",
        outline: "border-2 border-cf-yellow-500 text-gray-900 hover:bg-cf-yellow-50",
        ghost: "hover:bg-gray-100 text-gray-700",
        dark: "bg-cf-green-900 text-white hover:bg-cf-green-950",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-10 px-6 py-3",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

---

## Step 5: Custom Card Variants

Create `components/ui/card-cf.tsx`:

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-xl p-6 transition-all",
  {
    variants: {
      variant: {
        default: "bg-white border border-gray-200 shadow-md",
        beige: "bg-cf-beige-50 border border-cf-beige-300 shadow-sm",
        "yellow-border": "bg-white border-2 border-cf-yellow-500 shadow-cf-yellow",
        "teal-border": "bg-white border-2 border-cf-teal-500 shadow-cf-teal",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant }), className)}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-display font-bold uppercase tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

---

## Step 6: Custom Badge Variants

Create `components/ui/badge-cf.tsx`:

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-cf-teal-100 text-cf-teal-800",
        accent: "bg-cf-yellow-100 text-cf-yellow-800",
        success: "bg-cf-green-100 text-cf-green-800",
        destructive: "bg-cf-red-100 text-cf-red-800",
        outline: "text-foreground border border-gray-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
```

---

## Step 7: Usage Examples

### Hero Section Component

```tsx
// components/sections/hero.tsx
export function Hero() {
  return (
    <section className="bg-cf-green-900 text-white py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="font-display text-5xl md:text-6xl font-bold uppercase tracking-tight mb-6">
          WELCOME TO THE CENTER OF GRAVITY
        </h1>
        <p className="text-xl mb-8 text-gray-200">
          We&apos;ve attracted a supermassive constellation of venture investors...
        </p>
        <Button variant="default" size="lg">
          Get Started
        </Button>
      </div>
    </section>
  )
}
```

### Event Card Component

```tsx
// components/cards/event-card.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card-cf"
import { Badge } from "@/components/ui/badge-cf"

export function EventCard({ event }: { event: Event }) {
  return (
    <Card variant="yellow-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{event.date}</span>
          <div className="h-4 w-px bg-cf-yellow-500" />
          <CardTitle className="text-cf-teal-700">{event.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">{event.description}</p>
        <div className="flex gap-2">
          {event.tags.map((tag) => (
            <Badge key={tag} variant="accent">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## Step 8: Font Setup (Next.js)

Add fonts in `app/layout.tsx`:

```tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const interDisplay = Inter({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['700', '800', '900'],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${interDisplay.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}
```

---

## Testing Your Implementation

1. **Verify Colors**: Check that CF colors are available in Tailwind classes
2. **Test Components**: Ensure button, card, and badge variants render correctly
3. **Check Contrast**: Use a contrast checker to verify accessibility
4. **Responsive Design**: Test on mobile, tablet, and desktop breakpoints

---

## Next Steps

- [ ] Install shadcn/ui components: `npx shadcn-ui@latest init`
- [ ] Customize shadcn/ui components with CF variants
- [ ] Create additional CF-specific components (hero sections, event cards, etc.)
- [ ] Set up Storybook for component documentation (optional)
- [ ] Create design tokens JSON for design tools (Figma, etc.)

---

**Last Updated**: 2025-01-27  
**Version**: 1.0.0

