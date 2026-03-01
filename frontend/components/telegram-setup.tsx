"use client";

import { useState } from "react";
import { useRegisterTelegram } from "@/lib/hooks/use-urls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageCircle, CheckCircle, AlertCircle } from "lucide-react";

export function TelegramSetup() {
  const [chatId, setChatId] = useState("");
  const { mutate, isPending, isSuccess, isError, error, reset } = useRegisterTelegram();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = chatId.trim();
    if (!trimmed) return;

    reset();
    mutate(trimmed, {
      onSuccess: () => setChatId(""),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Telegram Notifications
        </CardTitle>
        <CardDescription>
          Connect your Telegram account to receive outage alerts. Send{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">/start</code>{" "}
          to our bot to get your Chat ID.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chatId">Telegram Chat ID</Label>
            <Input
              id="chatId"
              type="text"
              placeholder="123456789"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              required
            />
          </div>

          {isSuccess && (
            <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              Telegram connected successfully!
            </div>
          )}

          {isError && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error instanceof Error ? error.message : "Registration failed"}
            </div>
          )}

          <Button type="submit" disabled={isPending || !chatId.trim()}>
            {isPending ? "Connecting…" : "Connect Telegram"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
