"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/types";

export async function joinGroupByCode(code: string) {
  await requireUser(`/invite/${code}`);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("join_group_by_code", { code });

  if (error || !data) {
    redirect(`/invite/${code}`);
  }

  redirect(`/groups/${data}`);
}

export async function reissueInviteCode(
  groupId: string,
): Promise<ActionResult<{ code: string }>> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("reissue_invite_code", {
    gid: groupId,
  });

  if (error || !data) {
    return {
      ok: false,
      error:
        "초대 코드를 재발급하지 못했습니다. 주최자만 재발급할 수 있습니다.",
    };
  }

  revalidatePath(`/groups/${groupId}`);
  return { ok: true, data: { code: data } };
}
