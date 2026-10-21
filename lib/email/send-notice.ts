import { getEmailFrom, getResendClient } from "@/lib/email/client";
import { renderNoticeEmail } from "@/lib/email/templates/notice";
import { createClient } from "@/lib/supabase/server";

interface SendEventNoticeParams {
  groupId: string;
  groupName: string;
  eventId: string;
  eventTitle: string;
  notice: string;
}

// 공지 발송(최선 노력): 실패해도 이벤트/공지 저장을 막지 않는다. 호출부는 결과만 로그로 남긴다.
export async function sendEventNoticeEmail({
  groupId,
  groupName,
  eventId,
  eventTitle,
  notice,
}: SendEventNoticeParams): Promise<{ sent: boolean; reason?: string }> {
  const resend = getResendClient();
  if (!resend) {
    return { sent: false, reason: "RESEND_API_KEY 미설정" };
  }

  const supabase = await createClient();
  const { data: recipients } = await supabase.rpc("get_group_member_emails", {
    gid: groupId,
  });
  const to = (recipients ?? [])
    .map((r) => r.email)
    .filter((email): email is string => Boolean(email));

  if (to.length === 0) {
    return { sent: false, reason: "발송 대상 멤버 없음" };
  }

  const eventUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/events/${eventId}`;
  const { subject, html } = renderNoticeEmail({
    groupName,
    eventTitle,
    notice,
    eventUrl,
  });

  try {
    await resend.emails.send({ from: getEmailFrom(), to, subject, html });
    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      reason: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}
