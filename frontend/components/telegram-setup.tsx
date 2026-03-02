"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Copy,
  Info,
  Loader2,
} from "lucide-react";
import {
  telegramSetupFormSchema,
  type TelegramSetupFormInput,
} from "@/lib/schemas";

export function TelegramSetup() {
  const { mutate, isPending, isSuccess, isError, error: mutationError, reset } = useRegisterTelegram();

  const form = useForm<TelegramSetupFormInput>({
    resolver: zodResolver(telegramSetupFormSchema),
    defaultValues: {
      chatId: "",
    },
    mode: "onChange",
  });

  const chatId = form.watch("chatId");

  const onSubmit = (data: TelegramSetupFormInput) => {
    reset();
    mutate(data.chatId);
  };

  const handleCopyTemplate = () => {
    const template = `/start ${chatId}`;
    navigator.clipboard.writeText(template);
  };

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="chatId"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="chatId">Telegram Chat ID</Label>
                  <FormControl>
                    <Input
                      id="chatId"
                      type="text"
                      placeholder="123456789"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {chatId && (
              <div className="space-y-2">
                <div className="flex items-start gap-2 rounded-md bg-muted p-3">
                  <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Copy this template and send it to the bot:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded bg-background px-2 py-1.5 text-sm">
                        /start {chatId}
                      </code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={handleCopyTemplate}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isSuccess && (
              <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                Telegram connected successfully!
              </div>
            )}

            {isError && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {mutationError instanceof Error ? mutationError.message : "Registration failed"}
              </div>
            )}

            <Button type="submit" disabled={isPending || !form.formState.isValid}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting…
                </>
              ) : (
                "Connect Telegram"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
