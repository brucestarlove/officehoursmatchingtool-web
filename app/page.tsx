import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button-cf";
import { Card } from "@/components/ui/card-cf";
import { Badge } from "@/components/ui/badge-cf";
import { Footer } from "@/components/shared/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--c-bg-page)" }}>
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl rounded-b-[28px] overflow-hidden relative bg-black">
        {/* Background Image - Replace src when image is provided */}
        <div className="absolute inset-0 w-full h-full bg-cf-green-900">
          {/* Uncomment and update src when image is ready */}
          {/* <Image
            src="/hero-background.jpg"
            alt=""
            fill
            className="object-cover"
            priority
          /> */}
        </div>
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Header */}
        <header className="relative z-10 flex items-center justify-between px-6 md:px-8 py-4">
          <Link href="/" className="flex items-center gap-3">
            {/* Logo placeholder - replace with actual logo */}
            <div className="h-10 w-10 rounded bg-cf-yellow-500 flex items-center justify-center">
              <span className="text-cf-green-900 font-bold text-lg">CF</span>
            </div>
            <span className="sr-only">Capital Factory</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 rounded-full bg-black/50 backdrop-blur px-3 py-1.5">
            <Link
              href="#"
              className="px-3 py-1 text-sm text-white/90 hover:text-white transition-colors"
            >
              Startups
            </Link>
            <Link
              href="#"
              className="px-3 py-1 text-sm text-white/90 hover:text-white transition-colors"
            >
              Funding
            </Link>
            <Link
              href="#"
              className="px-3 py-1 text-sm text-white/90 hover:text-white transition-colors"
            >
              Partners
            </Link>
            <Link
              href="/signup"
              className="px-3 py-1 text-sm text-white/90 hover:text-white transition-colors"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="px-3 py-1 text-sm text-white/90 hover:text-white transition-colors"
            >
              Log In
            </Link>
          </nav>
        </header>

        {/* Content */}
        <section className="relative z-10 grid grid-cols-12 gap-8 px-6 md:px-8 pb-12 md:pb-16 pt-4 md:pt-8">
          {/* Left: H1 */}
          <div className="col-span-12 md:col-span-7">
            <h1 className="text-white font-display font-extrabold uppercase tracking-tight leading-[0.9] text-5xl sm:text-6xl md:text-7xl">
              The center of<br />
              gravity for<br />
              entrepreneurs<br />
              outside of<br />
              Silicon Valley
            </h1>
          </div>

          {/* Right: Details */}
          <div className="col-span-12 md:col-span-5 self-end">
            <p className="text-white/90 text-base md:text-lg font-semibold uppercase mb-2">
              STARTUPS
            </p>
            <p className="text-white/80 text-base md:text-lg leading-relaxed mb-4">
              Our ecosystem gives innovators across industries exactly the resources, networks and support they need to thrive.
            </p>
            <p className="text-white/90 text-base md:text-lg font-semibold uppercase mb-2">
              Commons
            </p>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              Find your place at the center of gravity for entrepreneurs
            </p>
          </div>
        </section>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-background p-8">
        <div className="container mx-auto max-w-4xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-display font-bold uppercase tracking-tight">
              CF Office Hours Matching Tool
            </h1>
            <p className="text-lg text-muted-foreground">
              Phase 0: Foundation & Design System Setup Complete
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/signup">
                <Button variant="default" size="lg">
                  Sign Up
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg">
                  Log In
                </Button>
              </Link>
            </div>
          </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card variant="default">
            <h3 className="mb-4 text-xl font-semibold">CF Brand Colors</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-cf-teal-500" />
                <span className="text-sm">CF Teal (Primary)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-cf-yellow-500" />
                <span className="text-sm">CF Yellow (Accent)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-cf-green-900" />
                <span className="text-sm">CF Green (Hero)</span>
              </div>
            </div>
          </Card>

          <Card variant="beige">
            <h3 className="mb-4 text-xl font-semibold">Component Variants</h3>
            <div className="space-y-2">
              <Badge variant="default">Teal Badge</Badge>
              <Badge variant="accent">Yellow Badge</Badge>
              <Badge variant="success">Green Badge</Badge>
              <Badge variant="destructive">Red Badge</Badge>
            </div>
          </Card>

          <Card variant="yellow-border">
            <h3 className="mb-4 text-xl font-semibold">Button Variants</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="dark">Dark</Button>
            </div>
          </Card>

          <Card variant="teal-border">
            <h3 className="mb-4 text-xl font-semibold">Typography</h3>
            <div className="space-y-2">
              <h4 className="text-lg font-semibold">Display Font</h4>
              <p className="text-sm text-muted-foreground">
                Used for headlines and hero text
              </p>
              <h4 className="text-lg font-semibold">Sans Font</h4>
              <p className="text-sm text-muted-foreground">
                Used for body text and UI
              </p>
            </div>
          </Card>
        </div>
      </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

