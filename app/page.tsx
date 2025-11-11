import Link from "next/link";
import { Button } from "@/components/ui/button-cf";
import { Card } from "@/components/ui/card-cf";
import { Badge } from "@/components/ui/badge-cf";

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-8">
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
  );
}

