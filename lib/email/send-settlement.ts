import { getEmailFrom, getResendClient } from "@/lib/email/client";
import { renderNoticeEmail } from "@/lib/email/templates/notice";
import { formatWon } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

interface SendSettlementEmailParams {
  settlementId: string;
  eventId: string;
  eventTitle: string;
  groupName: string;
  totalAmount: number;
  perPerson: number;
  bankInfo: string;
}

// 정산 메일 발송(최선 노력): 실패해도 정산 생성을 막지 않는다. 호출부는 결과만 로그로 남긴다.
export async function sendSettlementEmail({
  settlementId,
  eventId,
  eventTitle,
  groupName,
  totalAmount,
  perPerson,
  bankInfo,
}: SendSettlementEmailParams): Promise<{ sent: boolean; reason?: string }> {
  const resend = getResendClient();
  if (!resend) {
    return { sent: false, reason: "RESEND_API_KEY 미설정" };
  }

  const supabase = await createClient();
  const { data: recipients } = await supabase.rpc(
    "get_settlement_recipient_emails",
    { sid: settlementId },
  );
  const to = (recipients ?? [])
    .map((r) => r.email)
    .filter((email): email is string => Boolean(email));

  if (to.length === 0) {
    return { sent: false, reason: "발송 대상 멤버 없음" };
  }

  const settlementUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/events/${eventId}/settlement`;
  const notice = `1인당 ${formatWon(perPerson)}을 아래 계좌로 보내 주세요.\n입금 계좌: ${bankInfo}\n총액: ${formatWon(totalAmount)}`;
  const { subject, html } = renderNoticeEmail({
    groupName,
    eventTitle: `${eventTitle} 정산`,
    notice,
    eventUrl: settlementUrl,
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
