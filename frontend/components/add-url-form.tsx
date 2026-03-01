"use client";

import { useState } from "react";
import { useCreateUrl } from "@/lib/hooks/use-urls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

export function AddUrlForm() {
  const [url, setUrl] = useState("");
  const { mutate, isPending } = useCreateUrl();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    mutate(trimmed, {
      onSuccess: () => setUrl(""),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="url"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
        className="flex-1"
        disabled={isPending}
      />
      <Button type="submit" disabled={isPending || !url.trim()}>
        {isPending ? (
          "Adding…"
        ) : (
          <>
            <Plus className="mr-1 h-4 w-4" />
            Add URL
          </>
        )}
      </Button>
    </form>
  );
}
