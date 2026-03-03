"use client";

import { memo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageCircle, CheckCircle, ExternalLink, Copy, Info } from "lucide-react";

/**
 * Copy feedback timeout in milliseconds.
 */
const COPY_FEEDBACK_MS = 2000;

interface TelegramSetupProps {
  /** User ID for the Telegram bot command */
  userId: string | null;
  /** Whether the user has already connected Telegram (optional, defaults to false) */
  isConnected?: boolean;
}

function TelegramSetup({ userId, isConnected = false }: TelegramSetupProps) {
  const botUsername = "AWSOutageDetectorBot";
  const botLink = `https://t.me/${botUsername}`;
  const startCommand = userId ? `/start ${userId}` : null;
  const [copied, setCopied] = useState(false);

  const handleCopyCommand = useCallback(() => {
    if (startCommand) {
      navigator.clipboard.writeText(startCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    }
  }, [startCommand]);

  if (isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Telegram Notifications
          </CardTitle>
          <CardDescription>
            Your account is connected to Telegram.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle className="h-4 w-4" />
            <span>Connected successfully!</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Telegram Notifications
        </CardTitle>
        <CardDescription>
          Connect your Telegram account to receive outage alerts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Command to copy */}
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Copy this command and send it to the bot:
          </p>
          <div className="flex gap-2">
            <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono">
              {startCommand || "Loading..."}
            </code>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={handleCopyCommand}
              disabled={!startCommand}
              aria-label="Copy command to clipboard"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {copied && (
            <p className="text-xs text-muted-foreground" role="status">
              Copied to clipboard
            </p>
          )}
        </div>

        {/* Bot link */}
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Then open the bot and paste the command:
          </p>
          <Button variant="outline" className="w-full" asChild>
            <a
              href={botLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${botUsername} on Telegram`}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open {botUsername}
            </a>
          </Button>
        </div>

        {/* Info message */}
        <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3">
          <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">
            After sending the command, the bot will automatically link your Telegram account.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Memoized TelegramSetup component to prevent unnecessary re-renders.
 * Only re-renders when `userId` or `isConnected` props change.
 */
export default memo(TelegramSetup);
