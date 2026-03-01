"use client";

import { useDeleteUrl } from "@/lib/hooks/use-urls";
import type { UrlItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, ExternalLink } from "lucide-react";

interface UrlTableProps {
  urls: UrlItem[];
}

const statusVariant: Record<string, "success" | "destructive"> = {
  up: "success",
  down: "destructive",
};

export function UrlTable({ urls }: UrlTableProps) {
  const { mutate: deleteUrl, isPending } = useDeleteUrl();

  if (urls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
        <p className="text-sm text-muted-foreground">
          No URLs being monitored yet.
        </p>
        <p className="text-xs text-muted-foreground">
          Add a URL above to start monitoring.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>URL</TableHead>
          <TableHead className="w-24 text-center">Status</TableHead>
          <TableHead className="w-40 text-right">Last Checked</TableHead>
          <TableHead className="w-16" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {urls.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="max-w-xs truncate font-mono text-sm">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-primary"
              >
                {item.url}
                <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
              </a>
            </TableCell>
            <TableCell className="text-center">
              <Badge variant={statusVariant[item.status] ?? "secondary"}>
                {item.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right text-xs text-muted-foreground">
              {item.lastChecked
                ? new Date(item.lastChecked).toLocaleString()
                : "—"}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteUrl(item.id)}
                disabled={isPending}
                aria-label={`Delete ${item.url}`}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
