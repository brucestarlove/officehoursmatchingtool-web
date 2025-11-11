# CF Brand Style Guide - Quick Reference

Quick reference for CF brand colors, typography, and component usage.

---

## Color Classes

### Primary Colors

```tsx
// Teal (Primary Brand)
bg-cf-teal-500    // Primary teal
bg-cf-teal-600    // Darker teal (hover)
text-cf-teal-700  // Dark teal text

// Yellow-Orange (Accent)
bg-cf-yellow-500  // Primary accent
bg-cf-yellow-600  // Darker yellow (hover)
text-cf-yellow-800 // Dark yellow text

// Dark Green (Hero/CTA)
bg-cf-green-900   // Hero backgrounds
bg-cf-green-950   // Dark CTAs
text-white        // White text on green

// Red (Accent/Star)
bg-cf-red-500     // Star/alert color
text-cf-red-700   // Red text

// Beige (Content Backgrounds)
bg-cf-beige-50    // Light content backgrounds
bg-cf-beige-100   // Slightly darker beige
border-cf-beige-300 // Beige borders
```

---

## Typography Classes

### Display Text (Hero Headlines)

```tsx
// Large hero headlines
<h1 className="font-display text-5xl md:text-6xl font-bold uppercase tracking-tight">
  WELCOME TO THE CENTER OF GRAVITY
</h1>

// Section headlines
<h2 className="font-display text-3xl md:text-4xl font-bold uppercase">
  MAKING CONNECTIONS THAT MATTER
</h2>
```

### Standard Headings

```tsx
<h3 className="text-2xl font-bold uppercase">Section Title</h3>
<h4 className="text-xl font-semibold">Subsection</h4>
```

### Body Text

```tsx
<p className="text-gray-700 leading-relaxed">Body text</p>
<p className="text-sm text-gray-600">Small text / captions</p>
```

---

## Button Variants

```tsx
// Primary (Yellow) - Default CTA
<Button variant="default">Contact Us</Button>

// Secondary (Teal)
<Button variant="secondary">Learn More</Button>

// Outline (Yellow Border)
<Button variant="outline">View Details</Button>

// Ghost
<Button variant="ghost">Cancel</Button>

// Dark (Green CTA)
<Button variant="dark">Subscribe</Button>
```

---

## Card Variants

```tsx
// Default (White with gray border)
<Card variant="default">Content</Card>

// Beige background
<Card variant="beige">Content</Card>

// Yellow border (Event cards)
<Card variant="yellow-border">Content</Card>

// Teal border
<Card variant="teal-border">Content</Card>
```

---

## Badge Variants

```tsx
// Primary (Teal)
<Badge variant="default">Expert in Fintech</Badge>

// Accent (Yellow)
<Badge variant="accent">Featured</Badge>

// Success (Green)
<Badge variant="success">Available</Badge>

// Destructive (Red)
<Badge variant="destructive">Urgent</Badge>
```

---

## Common Patterns

### Hero Section

```tsx
<section className="bg-cf-green-900 text-white py-24 px-6">
  <div className="max-w-4xl mx-auto text-center">
    <h1 className="font-display text-5xl md:text-6xl font-bold uppercase mb-6">
      HEADLINE
    </h1>
    <p className="text-xl mb-8 text-gray-200">Subheadline</p>
    <Button variant="default" size="lg">CTA Button</Button>
  </div>
</section>
```

### Beige Content Section

```tsx
<section className="bg-cf-beige-50 rounded-3xl p-8 border border-cf-beige-300">
  <h2 className="text-3xl font-bold uppercase text-gray-900 mb-4">
    SECTION TITLE
  </h2>
  <p className="text-gray-700 leading-relaxed">Content...</p>
</section>
```

### Event Card

```tsx
<Card variant="yellow-border">
  <div className="flex items-center gap-2 mb-4">
    <span className="text-sm text-gray-600">Nov. 10 / 5:30 PM</span>
    <div className="h-4 w-px bg-cf-yellow-500" />
    <h3 className="font-bold text-cf-teal-700 uppercase">EVENT TITLE</h3>
  </div>
  <p className="text-gray-700">Description...</p>
</Card>
```

### Yellow Border Divider

```tsx
<div className="h-4 w-px bg-cf-yellow-500" />  // Vertical
<div className="h-px w-full bg-cf-yellow-500" />  // Horizontal
```

---

## Shadows

```tsx
shadow-cf-yellow  // Yellow glow effect
shadow-cf-teal    // Teal glow effect
shadow-md         // Standard shadow
shadow-lg         // Large shadow
```

---

## Border Radius

```tsx
rounded-cf        // 0.75rem (12px) - Standard
rounded-cf-lg     // 1rem (16px) - Large
rounded-xl        // 0.75rem - Standard shadcn
rounded-full      // Full circle (badges)
```

---

## Spacing

```tsx
// Padding
p-6              // 1.5rem (24px) - Card padding
py-24            // 6rem (96px) - Hero vertical padding
px-8             // 2rem (32px) - Section horizontal padding

// Margin
mb-6             // 1.5rem (24px) - Standard spacing
gap-2            // 0.5rem (8px) - Flex/Grid gap
```

---

## Color Combinations

### Text on Backgrounds

```tsx
// White text on dark green
bg-cf-green-900 text-white

// Dark text on yellow
bg-cf-yellow-500 text-gray-900

// White text on teal
bg-cf-teal-500 text-white

// Dark text on beige
bg-cf-beige-50 text-gray-700
```

---

## Accessibility Notes

- **Contrast**: Always use `text-white` on `bg-cf-green-900` or `bg-cf-teal-500`
- **Focus**: Yellow focus rings (`focus-visible:ring-cf-yellow-500`)
- **Minimum Touch Target**: 44x44px for buttons on mobile

---

## Common Mistakes to Avoid

❌ **Don't**: Use yellow text on white background (low contrast)  
✅ **Do**: Use `text-gray-900` on yellow backgrounds

❌ **Don't**: Use teal text on teal backgrounds  
✅ **Do**: Use white text on teal backgrounds

❌ **Don't**: Mix different border radius sizes inconsistently  
✅ **Do**: Use `rounded-cf` (12px) as standard, `rounded-cf-lg` (16px) for larger elements

---

**Quick Links:**
- [Full Style Guide](./BRAND_STYLE_GUIDE.md)
- [Implementation Guide](./IMPLEMENTATION.md)

