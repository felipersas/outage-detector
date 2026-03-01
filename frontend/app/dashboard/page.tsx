"use client";

import { useUrlStats } from "@/lib/hooks/use-urls";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddUrlForm } from "@/components/add-url-form";
import { UrlTable } from "@/components/url-table";
import { StatusChart } from "@/components/status-chart";
import { Globe, CheckCircle, XCircle } from "lucide-react";

export default function DashboardPage() {
  const { stats, urls, isLoading, error } = useUrlStats();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-destructive">
          Failed to load data. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your websites and track their uptime.
        </p>
      </div>

      {/* Stats Cards + Chart */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total URLs"
          value={stats.total}
          icon={<Globe className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Up"
          value={stats.up}
          icon={<CheckCircle className="h-4 w-4 text-emerald-400" />}
        />
        <StatCard
          title="Down"
          value={stats.down}
          icon={<XCircle className="h-4 w-4 text-red-400" />}
        />

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardDescription>Status Overview</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <StatusChart up={stats.up} down={stats.down} />
          </CardContent>
        </Card>
      </div>

      {/* Add URL */}
      <Card>
        <CardHeader>
          <CardTitle>Add URL</CardTitle>
          <CardDescription>
            Enter a URL to start monitoring its availability.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddUrlForm />
        </CardContent>
      </Card>

      {/* URL Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monitored URLs</CardTitle>
          <CardDescription>
            {stats.total} URL{stats.total !== 1 ? "s" : ""} being monitored
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UrlTable urls={urls} />
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription>{title}</CardDescription>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
