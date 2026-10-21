"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/types";
import type { RsvpEntry } from "@/components/event/rsvp-panel";

function mapRsvpError(message: string | undefined): string {
  if (message?.includes("event_cancelled"))
    return "취소된 이벤트라 응답할 수 없습니다.";
  if (message?.includes("deadline_passed")) return "응답이 마감되었습니다.";
  if (message?.includes("not_member")) return "모임 멤버만 응답할 수 있습니다.";
  return "응답을 처리하지 못했습니다. 다시 시도해 주세요.";
}

export async function setRsvp(
  eventId: string,
  status: "going" | "not_going" | "maybe",
): Promise<ActionResult<RsvpEntry[]>> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("set_rsvp", {
    p_event_id: eventId,
    p_status: status,
  });

  if (error || !data) {
    return { ok: false, error: mapRsvpError(error?.message) };
  }

  const { data: event } = await supabase
    .from("events")
    .select("group_id")
    .eq("id", eventId)
    .maybeSingle();

  const { data: profiles } = event
    ? await supabase.rpc("get_group_profiles", { gid: event.group_id })
    : { data: null };

  const profileById = new Map(
    (profiles ?? []).map((p) => [
      p.id,
      { id: p.id, display_name: p.display_name },
    ]),
  );

  const entries: RsvpEntry[] = data
    .map((r) => ({
      user_id: r.user_id,
      status: r.status as RsvpEntry["status"],
      responded_at: r.responded_at,
      profile: profileById.get(r.user_id) ?? {
        id: r.user_id,
        display_name: r.user_id === user.id ? "나" : "알 수 없음",
      },
    }))
    .sort((a, b) => Date.parse(a.responded_at) - Date.parse(b.responded_at));

  revalidatePath(`/events/${eventId}`);
  return { ok: true, data: entries };
}
