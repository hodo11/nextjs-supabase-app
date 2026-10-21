import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

// 서버 컴포넌트/Server Action에서 로그인 사용자를 가져온다. 없으면 로그인 페이지로 보낸다.
// getClaims()의 JWT claims는 sub가 사용자 id이므로 id로 정규화해서 반환한다.
export async function requireUser(next?: string) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    const query = next ? `?next=${encodeURIComponent(next)}` : "";
    redirect(`/auth/login${query}`);
  }

  return { id: claims.sub, email: claims.email as string | undefined };
}

// 로그인 여부와 무관하게 접근 가능한 페이지(예: /invite/[code])에서 사용한다.
export async function getOptionalUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;
  return { id: claims.sub, email: claims.email as string | undefined };
}
