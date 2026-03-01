"use client";

import { useActionState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import Link from "next/link";
import { confirmSignUpAction, type AuthState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const initialState: AuthState = {};

function ConfirmForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    confirmSignUpAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      const timeout = setTimeout(() => router.push("/auth/signin"), 2000);
      return () => clearTimeout(timeout);
    }
  }, [state.success, router]);

  if (state.success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <CheckCircle className="h-12 w-12 text-emerald-400" />
            <div className="text-center">
              <h2 className="text-xl font-semibold">Email confirmed!</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Redirecting to sign in…
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Confirm your email</CardTitle>
          <CardDescription>
            We sent a verification code to{" "}
            <span className="font-medium text-foreground">
              {email || "your email"}
            </span>
          </CardDescription>
        </CardHeader>

        <form action={formAction}>
          <CardContent className="space-y-4">
            {state.error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {state.error}
              </div>
            )}

            <input type="hidden" name="email" value={email} />

            <div className="space-y-2">
              <Label htmlFor="code">Confirmation Code</Label>
              <Input
                id="code"
                name="code"
                type="text"
                placeholder="123456"
                required
                autoComplete="one-time-code"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Confirming…" : "Confirm Email"}
            </Button>
            <Link
              href="/auth/signin"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Back to sign in
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <ConfirmForm />
    </Suspense>
  );
}
