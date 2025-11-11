# CF Brand Style Guide
## Extending shadcn/ui

This document defines the brand style guide for CF, extending the shadcn/ui design system with custom brand colors, typography, and component variants.

---

## Table of Contents

1. [Color System](#color-system)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [Component Variants](#component-variants)
5. [Design Tokens](#design-tokens)
6. [Usage Examples](#usage-examples)

---

## Color System

### Primary Brand Colors

CF's color palette is vibrant and energetic, featuring teal as the primary brand color, with yellow-orange accents and dark green for hero sections.

#### Primary Palette

```css
/* Teal - Primary Brand Color */
--cf-teal-50: #e6f7f5;
--cf-teal-100: #b3e8e0;
--cf-teal-200: #80d9cb;
--cf-teal-300: #4dcab6;
--cf-teal-400: #1abba1;
--cf-teal-500: #00a88c;  /* Primary */
--cf-teal-600: #008770;
--cf-teal-700: #006654;
--cf-teal-800: #004538;
--cf-teal-900: #00241c;

/* Yellow-Orange - Accent Color */
--cf-yellow-50: #fff9e6;
--cf-yellow-100: #ffedb3;
--cf-yellow-200: #ffe180;
--cf-yellow-300: #ffd54d;
--cf-yellow-400: #ffc91a;
--cf-yellow-500: #ffbd00;  /* Primary Accent */
--cf-yellow-600: #cc9700;
--cf-yellow-700: #997100;
--cf-yellow-800: #664b00;
--cf-yellow-900: #332500;

/* Dark Green - Hero/CTA Color */
--cf-green-50: #e8f5e9;
--cf-green-100: #c8e6c9;
--cf-green-200: #a5d6a7;
--cf-green-300: #81c784;
--cf-green-400: #66bb6a;
--cf-green-500: #4caf50;
--cf-green-600: #43a047;
--cf-green-700: #388e3c;
--cf-green-800: #2e7d32;
--cf-green-900: #1b5e20;  /* Hero Background */
--cf-green-950: #0d3e11;  /* Dark CTA */

/* Red - Accent/Star Color */
--cf-red-50: #ffebee;
--cf-red-100: #ffcdd2;
--cf-red-200: #ef9a9a;
--cf-red-300: #e57373;
--cf-red-400: #ef5350;
--cf-red-500: #f44336;  /* Star/Accent */
--cf-red-600: #e53935;
--cf-red-700: #d32f2f;
--cf-red-800: #c62828;
--cf-red-900: #b71c1c;
```

#### Neutral Palette (Extended from shadcn)

```css
/* Beige/Cream - Content Backgrounds */
--cf-beige-50: #faf9f7;   /* Lightest */
--cf-beige-100: #f5f3f0;
--cf-beige-200: #ebe8e3;
--cf-beige-300: #e0dcd6;
--cf-beige-400: #d6d1c9;
--cf-beige-500: #ccc6bc;  /* Base */

/* Standard Grays (shadcn compatible) */
--cf-gray-50: #fafafa;
--cf-gray-100: #f5f5f5;
--cf-gray-200: #e5e5e5;
--cf-gray-300: #d4d4d4;
--cf-gray-400: #a3a3a3;
--cf-gray-500: #737373;
--cf-gray-600: #525252;
--cf-gray-700: #404040;
--cf-gray-800: #262626;
--cf-gray-900: #171717;
--cf-gray-950: #0a0a0a;
```

### Semantic Colors

```css
/* Success */
--cf-success: var(--cf-green-600);
--cf-success-light: var(--cf-green-100);
--cf-success-dark: var(--cf-green-800);

/* Error */
--cf-error: var(--cf-red-600);
--cf-error-light: var(--cf-red-100);
--cf-error-dark: var(--cf-red-800);

/* Warning */
--cf-warning: var(--cf-yellow-500);
--cf-warning-light: var(--cf-yellow-100);
--cf-warning-dark: var(--cf-yellow-700);

/* Info */
--cf-info: var(--cf-teal-500);
--cf-info-light: var(--cf-teal-100);
--cf-info-dark: var(--cf-teal-700);
```

### Color Usage Guidelines

- **Primary (Teal)**: Use for primary actions, links, and brand elements
- **Accent (Yellow-Orange)**: Use for CTAs, highlights, borders, and important buttons
- **Dark Green**: Use for hero sections, prominent CTAs, and email subscription boxes
- **Red**: Use sparingly for stars, special accents, and critical alerts
- **Beige**: Use for content backgrounds and card backgrounds
- **Gray**: Use for text, borders, and neutral UI elements

---

## Typography

### Font Families

```css
/* Primary Font - Modern Sans-Serif */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;

/* Display Font - Bold Headlines */
--font-display: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

/* Monospace - Code/Technical */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace;
```

### Type Scale

```css
/* Display - Large Headlines */
--text-display-2xl: 4.5rem;    /* 72px - Hero headlines */
--text-display-xl: 3.75rem;    /* 60px - Section headlines */
--text-display-lg: 3rem;       /* 48px - Page titles */
--text-display-md: 2.25rem;    /* 36px - Section titles */
--text-display-sm: 1.875rem;   /* 30px - Subsection titles */

/* Headings */
--text-4xl: 2.25rem;   /* 36px */
--text-3xl: 1.875rem;  /* 30px */
--text-2xl: 1.5rem;    /* 24px */
--text-xl: 1.25rem;    /* 20px */
--text-lg: 1.125rem;   /* 18px */
--text-base: 1rem;     /* 16px */
--text-sm: 0.875rem;   /* 14px */
--text-xs: 0.75rem;    /* 12px */
```

### Typography Styles

#### Display Text (Hero Headlines)
- **Font**: `--font-display`
- **Weight**: 700 (Bold)
- **Transform**: Uppercase
- **Letter Spacing**: -0.02em
- **Line Height**: 1.1
- **Color**: White (on dark backgrounds) or `--cf-gray-900` (on light)

#### Headings (H1-H6)
- **Font**: `--font-sans`
- **Weight**: 700 (Bold)
- **Transform**: Uppercase (H1-H3), Sentence case (H4-H6)
- **Letter Spacing**: -0.01em
- **Line Height**: 1.2

#### Body Text
- **Font**: `--font-sans`
- **Weight**: 400 (Regular)
- **Line Height**: 1.6
- **Color**: `--cf-gray-700` (primary), `--cf-gray-600` (secondary)

#### Small Text / Captions
- **Font**: `--font-sans`
- **Weight**: 400 (Regular)
- **Size**: `--text-sm` or `--text-xs`
- **Line Height**: 1.5
- **Color**: `--cf-gray-600`

---

## Spacing & Layout

### Spacing Scale (Tailwind Compatible)

```css
--spacing-0: 0;
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
--spacing-20: 5rem;     /* 80px */
--spacing-24: 6rem;     /* 96px */
--spacing-32: 8rem;     /* 128px */
```

### Border Radius

```css
--radius-none: 0;
--radius-sm: 0.25rem;    /* 4px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-3xl: 1.5rem;    /* 24px */
--radius-full: 9999px;   /* Full circle */
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
--shadow-yellow: 0 4px 14px 0 rgb(255 189 0 / 0.3);  /* Yellow glow */
--shadow-teal: 0 4px 14px 0 rgb(0 168 140 / 0.3);    /* Teal glow */
```

---

## Component Variants

### Button Variants

#### Primary (Yellow-Orange)
- **Background**: `--cf-yellow-500`
- **Text**: `--cf-gray-900`
- **Border**: None
- **Hover**: `--cf-yellow-600`
- **Active**: `--cf-yellow-700`
- **Shadow**: `--shadow-yellow` (on hover)

#### Secondary (Teal)
- **Background**: `--cf-teal-500`
- **Text**: White
- **Border**: None
- **Hover**: `--cf-teal-600`
- **Active**: `--cf-teal-700`

#### Outline (Yellow Border)
- **Background**: Transparent
- **Text**: `--cf-gray-900`
- **Border**: 2px solid `--cf-yellow-500`
- **Hover**: Background `--cf-yellow-50`

#### Ghost
- **Background**: Transparent
- **Text**: `--cf-gray-700`
- **Border**: None
- **Hover**: Background `--cf-gray-100`

#### Dark (Green CTA)
- **Background**: `--cf-green-900`
- **Text**: White
- **Border**: None
- **Hover**: `--cf-green-950`

### Card Variants

#### Default Card
- **Background**: White
- **Border**: 1px solid `--cf-gray-200`
- **Border Radius**: `--radius-xl`
- **Shadow**: `--shadow-md`
- **Padding**: `--spacing-6`

#### Beige Card
- **Background**: `--cf-beige-50`
- **Border**: 1px solid `--cf-beige-300`
- **Border Radius**: `--radius-xl`
- **Shadow**: `--shadow-sm`
- **Padding**: `--spacing-6`

#### Yellow Border Card
- **Background**: White
- **Border**: 2px solid `--cf-yellow-500`
- **Border Radius**: `--radius-xl`
- **Shadow**: `--shadow-yellow`
- **Padding**: `--spacing-6`

### Badge Variants

#### Primary Badge
- **Background**: `--cf-teal-100`
- **Text**: `--cf-teal-800`
- **Border**: None
- **Border Radius**: `--radius-full`

#### Accent Badge
- **Background**: `--cf-yellow-100`
- **Text**: `--cf-yellow-800`
- **Border**: None
- **Border Radius**: `--radius-full`

#### Success Badge
- **Background**: `--cf-green-100`
- **Text**: `--cf-green-800`
- **Border**: None
- **Border Radius**: `--radius-full`

### Input Variants

#### Default Input
- **Background**: White
- **Border**: 1px solid `--cf-gray-300`
- **Border Radius**: `--radius-lg`
- **Focus Border**: 2px solid `--cf-yellow-500`
- **Focus Shadow**: `--shadow-yellow`

#### Beige Input
- **Background**: `--cf-beige-50`
- **Border**: 1px solid `--cf-beige-300`
- **Border Radius**: `--radius-lg`
- **Focus Border**: 2px solid `--cf-yellow-500`

---

## Design Tokens

### Tailwind Config Extension

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // CF Brand Colors
        'cf-teal': {
          50: '#e6f7f5',
          100: '#b3e8e0',
          200: '#80d9cb',
          300: '#4dcab6',
          400: '#1abba1',
          500: '#00a88c',  // Primary
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
          500: '#ffbd00',  // Primary Accent
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
          900: '#1b5e20',  // Hero Background
          950: '#0d3e11',  // Dark CTA
        },
        'cf-red': {
          50: '#ffebee',
          100: '#ffcdd2',
          200: '#ef9a9a',
          300: '#e57373',
          400: '#ef5350',
          500: '#f44336',  // Star/Accent
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
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'cf': '0.75rem',  // 12px - CF standard
        'cf-lg': '1rem',  // 16px - CF large
      },
      boxShadow: {
        'cf-yellow': '0 4px 14px 0 rgb(255 189 0 / 0.3)',
        'cf-teal': '0 4px 14px 0 rgb(0 168 140 / 0.3)',
      },
    },
  },
}
```

### CSS Variables (globals.css)

```css
@layer base {
  :root {
    /* CF Brand Colors */
    --cf-teal-500: #00a88c;
    --cf-yellow-500: #ffbd00;
    --cf-green-900: #1b5e20;
    --cf-green-950: #0d3e11;
    --cf-red-500: #f44336;
    --cf-beige-50: #faf9f7;
    
    /* Override shadcn/ui defaults with CF colors */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    
    --primary: 173 100% 33%;  /* CF Teal */
    --primary-foreground: 0 0% 100%;
    
    --secondary: 45 100% 50%;  /* CF Yellow */
    --secondary-foreground: 0 0% 9%;
    
    --accent: 45 100% 50%;  /* CF Yellow */
    --accent-foreground: 0 0% 9%;
    
    --destructive: 0 84.2% 60.2%;  /* CF Red */
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
```

---

## Usage Examples

### Hero Section

```tsx
// Hero with CF styling
<section className="bg-cf-green-900 text-white py-24 px-6">
  <div className="max-w-4xl mx-auto text-center">
    <h1 className="font-display text-display-2xl font-bold uppercase tracking-tight mb-6">
      WELCOME TO THE CENTER OF GRAVITY
    </h1>
    <p className="text-xl mb-8 text-gray-200">
      We&apos;ve attracted a supermassive constellation of venture investors...
    </p>
    <button className="bg-cf-yellow-500 text-gray-900 px-8 py-4 rounded-cf-lg font-bold uppercase hover:bg-cf-yellow-600 shadow-cf-yellow transition-all">
      Get Started
    </button>
  </div>
</section>
```

### Card with Yellow Border

```tsx
// Event card with CF styling
<div className="bg-white border-2 border-cf-yellow-500 rounded-xl p-6 shadow-cf-yellow">
  <div className="flex items-center gap-2 mb-4">
    <span className="text-sm text-gray-600">Nov. 10 / 5:30 PM</span>
    <div className="h-4 w-px bg-cf-yellow-500" />
    <h3 className="font-bold text-cf-teal-700 uppercase">
      LEVEL UP: AN AI-ASSISTED CODING WORKSHOP
    </h3>
  </div>
  <p className="text-gray-700">
    Join us for an exciting workshop...
  </p>
</div>
```

### Button Variants

```tsx
// Primary button (Yellow)
<button className="bg-cf-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-cf-yellow-600 hover:shadow-cf-yellow transition-all">
  Contact Us
</button>

// Secondary button (Teal)
<button className="bg-cf-teal-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cf-teal-600 transition-all">
  Learn More
</button>

// Outline button
<button className="border-2 border-cf-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-cf-yellow-50 transition-all">
  View Details
</button>
```

### Beige Content Section

```tsx
// Content section with beige background
<section className="bg-cf-beige-50 rounded-3xl p-8 border border-cf-beige-300">
  <h2 className="text-3xl font-bold uppercase text-gray-900 mb-4">
    MAKING CONNECTIONS THAT MATTER
  </h2>
  <p className="text-gray-700 leading-relaxed">
    Growing your startup is all about relationships...
  </p>
</section>
```

### Badge Component

```tsx
// CF-styled badge
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cf-teal-100 text-cf-teal-800">
  Expert in Fintech
</span>
```

---

## Accessibility Guidelines

### Color Contrast

- **Text on Teal**: Use white text on `--cf-teal-500` and darker
- **Text on Yellow**: Use `--cf-gray-900` on `--cf-yellow-500`
- **Text on Dark Green**: Use white text on `--cf-green-900`
- **Text on Beige**: Use `--cf-gray-700` or darker

### Minimum Contrast Ratios

- **Normal Text**: 4.5:1 contrast ratio
- **Large Text (18px+)**: 3:1 contrast ratio
- **UI Components**: 3:1 contrast ratio

### Focus States

- Use `--cf-yellow-500` for focus rings
- Ensure 2px minimum focus ring width
- Use `--shadow-yellow` for focus shadows

---

## Implementation Checklist

- [ ] Add CF color tokens to Tailwind config
- [ ] Update shadcn/ui CSS variables with CF colors
- [ ] Create custom button variants (yellow, teal, green)
- [ ] Create card variants (beige, yellow border)
- [ ] Set up typography scale (display, headings, body)
- [ ] Configure border radius defaults
- [ ] Add custom shadows (yellow glow, teal glow)
- [ ] Test color contrast ratios
- [ ] Document component usage patterns
- [ ] Create Storybook stories (optional)

---

**Last Updated**: 2025-01-27  
**Version**: 1.0.0  
**Maintained By**: Bruce "Starlove" Robinson
