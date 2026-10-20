"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="flex flex-col items-center gap-4 text-center">
      <h1 className="text-2xl font-bold">문제가 발생했습니다</h1>
      <Button onClick={reset}>다시 시도</Button>
    </section>
  );
}
