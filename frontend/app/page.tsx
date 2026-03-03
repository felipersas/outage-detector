import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Activity, Bell, Shield, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-400" />
            <span className="text-lg font-bold">Outage Detector</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="mx-auto max-w-2xl space-y-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Monitor your websites.
            <br />
            <span className="text-emerald-400">Get notified instantly.</span>
          </h1>

          <p className="mx-auto max-w-lg text-lg text-muted-foreground">
            Track the uptime of your websites and APIs. Receive real-time
            Telegram alerts when outages are detected.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Start Monitoring
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto mt-24 grid max-w-4xl gap-8 sm:grid-cols-3">
          <FeatureCard
            icon={<Activity className="h-8 w-8 text-chart-1" />}
            title="Real-Time Monitoring"
            description="URLs are checked every minute. Know the moment something goes down."
          />
          <FeatureCard
            icon={<Bell className="h-8 w-8 text-chart-2" />}
            title="Telegram Alerts"
            description="Get instant notifications via Telegram bot when outages occur."
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8 text-chart-3" />}
            title="Secure & Private"
            description="Your data is isolated. Only you can see your monitored URLs."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>Built with SST, Next.js, and AWS</p>
        <p className="mt-1">
          Made by{" "}
          <a
            href="https://github.com/felipersas"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            @felipersas
          </a>
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3 rounded-xl border p-6 text-left">
      {icon}
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
