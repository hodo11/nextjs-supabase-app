import { redirect } from "next/navigation";

import { getOptionalUser } from "@/lib/supabase/auth";

export default async function Home() {
  const user = await getOptionalUser();
  redirect(user ? "/home" : "/auth/login");
}
