"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateUrl } from "@/lib/hooks/use-urls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import {
  addUrlFormSchema,
  type AddUrlFormInput,
} from "@/lib/schemas";

export function AddUrlForm() {
  const { mutate, isPending, error } = useCreateUrl();

  const form = useForm<AddUrlFormInput>({
    resolver: zodResolver(addUrlFormSchema),
    defaultValues: {
      url: "",
    },
    mode: "onChange",
  });

  const onSubmit = (data: AddUrlFormInput) => {
    mutate(data.url, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="sr-only" />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isPending || !form.formState.isValid}>
            {isPending ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Adding…
              </>
            ) : (
              <>
                <Plus className="mr-1 h-4 w-4" />
                Add URL
              </>
            )}
          </Button>
        </div>
        {form.formState.errors.url && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {form.formState.errors.url.message}
          </p>
        )}
        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error.message}
          </p>
        )}
      </form>
    </Form>
  );
}
