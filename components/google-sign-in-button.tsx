"use client";

import { createClient } from "@/lib/supabase/client";
import { getSafeRedirectPath } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function GoogleSignInButton({ next }: { next?: string | null }) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    const redirectNext = encodeURIComponent(getSafeRedirectPath(next ?? null));
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${redirectNext}`,
      },
    });
    // 성공하면 브라우저가 Google로 이동하므로 로딩 상태를 유지합니다.
    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isLoading}
        onClick={handleGoogleSignIn}
      >
        {isLoading ? "Google로 이동하는 중..." : "Google로 계속하기"}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
