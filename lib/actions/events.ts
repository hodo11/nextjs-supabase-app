"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { sendEventNoticeEmail } from "@/lib/email/send-notice";
import { fromDateTimeLocal } from "@/lib/format";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import {
  eventSchema,
  parseCapacity,
  type EventFormValues,
} from "@/lib/validations/event";
import type { ActionResult } from "@/lib/actions/types";

function toRow(values: EventFormValues) {
  return {
    title: values.title,
    starts_at: fromDateTimeLocal(values.starts_at),
    location: values.location.trim() === "" ? null : values.location.trim(),
    capacity: parseCapacity(values.capacity),
    rsvp_deadline: fromDateTimeLocal(values.rsvp_deadline),
    notice: values.notice.trim() === "" ? null : values.notice.trim(),
  };
}

// 공지 메일은 최선 노력으로 발송한다. 실패해도 이벤트 저장 자체는 이미 끝난 뒤이므로 막지 않는다.
async function maybeSendNotice(
  groupId: string,
  eventId: string,
  eventTitle: string,
  values: EventFormValues,
) {
  if (!values.notify_by_email || values.notice.trim() === "") return;

  const supabase = await createClient();
  const { data: group } = await supabase
    .from("groups")
    .select("name")
    .eq("id", groupId)
    .maybeSingle();
  if (!group) return;

  const result = await sendEventNoticeEmail({
    groupId,
    groupName: group.name,
    eventId,
    eventTitle,
    notice: values.notice.trim(),
  });
  if (!result.sent) {
    console.error(`[email] 공지 메일 발송 건너뜀/실패: ${result.reason}`);
  }
}

export async function createEvent(groupId: string, values: unknown) {
  const parsed = eventSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message } as const;
  }

  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .insert({ group_id: groupId, ...toRow(parsed.data) })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: "이벤트를 만들지 못했습니다. 주최자만 만들 수 있습니다.",
    } as const;
  }

  await maybeSendNotice(groupId, data.id, parsed.data.title, parsed.data);

  revalidatePath(`/groups/${groupId}`);
  redirect(`/events/${data.id}`);
}

export async function updateEvent(
  eventId: string,
  values: unknown,
): Promise<ActionResult<null>> {
  const parsed = eventSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .update(toRow(parsed.data))
    .eq("id", eventId)
    .select("group_id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: "이벤트를 수정하지 못했습니다. 주최자만 수정할 수 있습니다.",
    };
  }

  await maybeSendNotice(data.group_id, eventId, parsed.data.title, parsed.data);

  revalidatePath(`/events/${eventId}`);
  return { ok: true, data: null };
}

export async function cancelEvent(
  eventId: string,
): Promise<ActionResult<null>> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .update({ status: "cancelled" })
    .eq("id", eventId);

  if (error) {
    return { ok: false, error: "이벤트를 취소하지 못했습니다." };
  }

  revalidatePath(`/events/${eventId}`);
  return { ok: true, data: null };
}
