"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { groupSchema } from "@/lib/validations/group";
import type { ActionResult } from "@/lib/actions/types";

export async function createGroup(
  values: unknown,
): Promise<ActionResult<{ groupId: string }>> {
  const parsed = groupSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_group", {
    group_name: parsed.data.name,
  });

  if (error || !data) {
    return {
      ok: false,
      error: "모임을 만들지 못했습니다. 다시 시도해 주세요.",
    };
  }

  revalidatePath("/groups");
  redirect(`/groups/${data}`);
}

export async function renameGroup(
  groupId: string,
  values: unknown,
): Promise<ActionResult<{ name: string }>> {
  const parsed = groupSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("groups")
    .update({ name: parsed.data.name })
    .eq("id", groupId);

  if (error) {
    return {
      ok: false,
      error: "모임 이름을 수정하지 못했습니다. 주최자만 수정할 수 있습니다.",
    };
  }

  revalidatePath(`/groups/${groupId}`);
  return { ok: true, data: { name: parsed.data.name } };
}
