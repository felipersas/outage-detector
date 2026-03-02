"use client";

import { useTransition, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { confirmSignUpAction } from "@/lib/actions/auth";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  confirmSignUpSchema,
  type ConfirmSignUpInput,
} from "@/lib/schemas";

const initialState: ConfirmSignUpInput = {
  email: "",
  code: "",
};

function ConfirmForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      const timeout = setTimeout(() => router.push("/auth/signin"), 2000);
      return () => clearTimeout(timeout);
    }
  }, [isSuccess, router]);

  const form = useForm<ConfirmSignUpInput>({
    resolver: zodResolver(confirmSignUpSchema),
    defaultValues: {
      email,
      code: "",
    },
    mode: "onChange",
  });

  const onSubmit = (data: ConfirmSignUpInput) => {
    setServerError(null);

    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("code", data.code);

    startTransition(async () => {
      const result = await confirmSignUpAction({}, formData);
      if (result.error) {
        setServerError(result.error);
      } else {
        setIsSuccess(true);
      }
    });
  };

  if (isSuccess) {
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {serverError && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {serverError}
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <input type="hidden" {...field} />
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="code">Confirmation Code</Label>
                    <FormControl>
                      <Input
                        id="code"
                        type="text"
                        placeholder="123456"
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirming…
                  </>
                ) : (
                  "Confirm Email"
                )}
              </Button>
              <Link
                href="/auth/signin"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Back to sign in
              </Link>
            </CardFooter>
          </form>
        </Form>
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
