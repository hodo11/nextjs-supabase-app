import { NextResponse, type NextRequest } from "next/server";

import { getEmailFrom, getResendClient } from "@/lib/email/client";
import { renderNoticeEmail } from "@/lib/email/templates/notice";
import { createServiceClient } from "@/lib/supabase/service";

// pg_cron(+pg_net)이 15분마다 공유 비밀값(Authorization: Bearer CRON_SECRET)으로 호출한다.
// 마감 24시간 이내·reminder_sent_at이 비어 있는 active 이벤트를 찾아 미응답·미정 멤버에게 1회 발송한다.
// 사용자 세션이 없으므로 RLS를 우회하는 service-role 클라이언트로 직접 조회한다.
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const resend = getResendClient();
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data: dueEvents } = await supabase
    .from("events")
    .select("id, group_id, title, rsvp_deadline")
    .eq("status", "active")
    .is("reminder_sent_at", null)
    .lte("rsvp_deadline", in24h.toISOString())
    .gte("rsvp_deadline", now.toISOString());

  const results: { eventId: string; sent: boolean }[] = [];

  for (const event of dueEvents ?? []) {
    const [{ data: members }, { data: responded }, { data: group }] =
      await Promise.all([
        supabase
          .from("group_members")
          .select("user_id")
          .eq("group_id", event.group_id),
        supabase
          .from("rsvps")
          .select("user_id, status")
          .eq("event_id", event.id),
        supabase
          .from("groups")
          .select("name")
          .eq("id", event.group_id)
          .maybeSingle(),
      ]);

    const respondedGoingOrNotGoing = new Set(
      (responded ?? [])
        .filter((r) => r.status === "going" || r.status === "not_going")
        .map((r) => r.user_id),
    );
    const targetUserIds = (members ?? [])
      .map((m) => m.user_id)
      .filter((id) => !respondedGoingOrNotGoing.has(id));

    let sent = false;
    if (resend && group && targetUserIds.length > 0) {
      const { data: targetProfiles } = await supabase
        .from("profiles")
        .select("email")
        .in("id", targetUserIds)
        .not("email", "is", null);
      const to = (targetProfiles ?? [])
        .map((p) => p.email)
        .filter((email): email is string => Boolean(email));

      if (to.length > 0) {
        const eventUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/events/${event.id}`;
        const { subject, html } = renderNoticeEmail({
          groupName: group.name,
          eventTitle: event.title,
          notice:
            "응답 마감이 24시간 이내입니다. 아직 응답하지 않으셨다면 참석 여부를 알려주세요.",
          eventUrl,
        });
        try {
          await resend.emails.send({ from: getEmailFrom(), to, subject, html });
          sent = true;
        } catch {
          sent = false;
        }
      }
    }

    // 발송 성공 여부와 무관하게 1회 시도 후 기록한다(재시도는 범위 밖).
    await supabase
      .from("events")
      .update({ reminder_sent_at: now.toISOString() })
      .eq("id", event.id);

    results.push({ eventId: event.id, sent });
  }

  return NextResponse.json({ processed: results.length, results });
}
