"use client";

import { useUrlStats } from "@/lib/hooks/use-urls";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AddUrlForm } from "@/components/add-url-form";
import UrlTable from "@/components/url-table";
import StatusChart from "@/components/status-chart";
import { Globe, CheckCircle, XCircle } from "lucide-react";

export default function DashboardPage() {
  const { stats, urls, isLoading, error } = useUrlStats();

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
        {isLoading ? (
          <>
            <LoadingStatCard />
            <LoadingStatCard />
            <LoadingStatCard />
            <LoadingStatCard />
          </>
        ) : (
          <>
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
          </>
        )}
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
          {isLoading ? (
            <Skeleton className="h-5 w-32" />
          ) : (
            <CardDescription>
              {stats.total} URL{stats.total !== 1 ? "s" : ""} being monitored
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-destructive">
                Failed to load data. Please try again.
              </p>
            </div>
          ) : (
            <UrlTable urls={urls} />
          )}
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

function LoadingStatCard() {
  return (
    <Card className="h-70">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
      </CardContent>
    </Card>
  );
}
