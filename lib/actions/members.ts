"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/types";

function mapMemberError(message: string | undefined): string {
  if (message?.includes("last_host_protected")) {
    return "마지막 주최자는 변경하거나 내보낼 수 없습니다. 먼저 다른 멤버를 주최자로 지정해 주세요.";
  }
  return "요청을 처리하지 못했습니다. 주최자만 할 수 있는 작업인지 확인해 주세요.";
}

async function updateRole(
  groupId: string,
  userId: string,
  role: "host" | "member",
): Promise<ActionResult<null>> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("group_members")
    .update({ role })
    .eq("group_id", groupId)
    .eq("user_id", userId);

  if (error) return { ok: false, error: mapMemberError(error.message) };
  revalidatePath(`/groups/${groupId}/members`);
  return { ok: true, data: null };
}

export async function promoteToHost(groupId: string, userId: string) {
  return updateRole(groupId, userId, "host");
}

export async function demoteFromHost(groupId: string, userId: string) {
  return updateRole(groupId, userId, "member");
}

export async function removeMember(
  groupId: string,
  userId: string,
): Promise<ActionResult<null>> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);

  if (error) return { ok: false, error: mapMemberError(error.message) };
  revalidatePath(`/groups/${groupId}/members`);
  return { ok: true, data: null };
}

export async function leaveGroup(groupId: string): Promise<ActionResult<null>> {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: mapMemberError(error.message) };
  revalidatePath("/groups");
  return { ok: true, data: null };
}
