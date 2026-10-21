import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

// RLS를 우회하는 service-role 클라이언트. 사용자 세션이 없는 서버 전용 작업(cron 등)에서만 사용한다.
// 절대 클라이언트 컴포넌트나 공개 API 응답에 노출하지 않는다.
export function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
