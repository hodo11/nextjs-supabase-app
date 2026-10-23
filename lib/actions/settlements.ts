"use server";

import { revalidatePath } from "next/cache";

import type {
  PaymentEntry,
  SettlementInfo,
} from "@/components/settlement/settlement-panel";
import { getSettlementPayments } from "@/lib/dummy/queries";
import { sendSettlementEmail } from "@/lib/email/send-settlement";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { settlementSchema } from "@/lib/validations/settlement";
import type { ActionResult } from "@/lib/actions/types";

function mapSettlementError(message: string | undefined): string {
  if (message?.includes("not_host")) return "주최자만 정산을 만들 수 있습니다.";
  if (message?.includes("event_not_ended"))
    return "이벤트가 끝난 뒤에 정산을 만들 수 있습니다.";
  if (message?.includes("event_cancelled"))
    return "취소된 이벤트는 정산을 만들 수 없습니다.";
  if (message?.includes("settlement_exists"))
    return "이미 이 이벤트의 정산이 있습니다.";
  if (message?.includes("no_attendees"))
    return "참석자가 없어 정산을 만들 수 없습니다.";
  return "정산을 만들지 못했습니다. 다시 시도해 주세요.";
}

export async function createSettlement(
  eventId: string,
  values: unknown,
): Promise<
  ActionResult<{ settlement: SettlementInfo; payments: PaymentEntry[] }>
> {
  const parsed = settlementSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_settlement", {
    p_event_id: eventId,
    p_total_amount: Number(parsed.data.total_amount),
    p_bank_info: parsed.data.bank_info,
  });
  const settlementRow = data?.[0];
  if (error || !settlementRow) {
    return { ok: false, error: mapSettlementError(error?.message) };
  }

  const payments = await getSettlementPayments(settlementRow.id);

  const { data: event } = await supabase
    .from("events")
    .select("title, group_id")
    .eq("id", eventId)
    .maybeSingle();
  const { data: group } = event
    ? await supabase
        .from("groups")
        .select("name")
        .eq("id", event.group_id)
        .maybeSingle()
    : { data: null };
  if (event && group) {
    const result = await sendSettlementEmail({
      settlementId: settlementRow.id,
      eventId,
      eventTitle: event.title,
      groupName: group.name,
      totalAmount: settlementRow.total_amount,
      perPerson: settlementRow.per_person,
      bankInfo: settlementRow.bank_info,
    });
    if (!result.sent) {
      console.error(`[email] 정산 메일 발송 건너뜀/실패: ${result.reason}`);
    }
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/settlement`);
  return {
    ok: true,
    data: {
      settlement: {
        id: settlementRow.id,
        total_amount: settlementRow.total_amount,
        per_person: settlementRow.per_person,
        bank_info: settlementRow.bank_info,
      },
      payments,
    },
  };
}

function mapSettlementPaymentError(message: string | undefined): string {
  if (message?.includes("already_confirmed"))
    return "주최자가 이미 확인한 정산은 취소할 수 없습니다.";
  if (message?.includes("not_payer")) return "본인 정산만 변경할 수 있습니다.";
  if (message?.includes("not_host"))
    return "주최자만 입금을 확인할 수 있습니다.";
  return "처리하지 못했습니다. 다시 시도해 주세요.";
}

export async function resendSettlementEmail(
  eventId: string,
  settlementId: string,
): Promise<ActionResult<{ sent: boolean; reason?: string }>> {
  await requireUser();
  const supabase = await createClient();
  const { data: settlement } = await supabase
    .from("settlements")
    .select("total_amount, per_person, bank_info")
    .eq("id", settlementId)
    .maybeSingle();
  if (!settlement) {
    return { ok: false, error: "정산을 찾을 수 없습니다." };
  }
  const { data: event } = await supabase
    .from("events")
    .select("title, group_id")
    .eq("id", eventId)
    .maybeSingle();
  const { data: group } = event
    ? await supabase
        .from("groups")
        .select("name")
        .eq("id", event.group_id)
        .maybeSingle()
    : { data: null };
  if (!event || !group) {
    return { ok: false, error: "이벤트를 찾을 수 없습니다." };
  }

  const result = await sendSettlementEmail({
    settlementId,
    eventId,
    eventTitle: event.title,
    groupName: group.name,
    totalAmount: settlement.total_amount,
    perPerson: settlement.per_person,
    bankInfo: settlement.bank_info,
  });
  return { ok: true, data: result };
}

export async function claimSettlementPayment(
  eventId: string,
  settlementId: string,
  claim: boolean,
): Promise<ActionResult<{ paid: boolean; paid_claimed_at: string | null }>> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("claim_settlement_payment", {
    p_settlement_id: settlementId,
    p_claim: claim,
  });
  const row = data?.[0];
  if (error || !row) {
    return { ok: false, error: mapSettlementPaymentError(error?.message) };
  }
  revalidatePath(`/events/${eventId}/settlement`);
  revalidatePath("/home");
  return {
    ok: true,
    data: { paid: row.paid, paid_claimed_at: row.paid_claimed_at },
  };
}

export async function confirmSettlementPayment(
  eventId: string,
  settlementId: string,
  userId: string,
  paid: boolean,
): Promise<ActionResult<{ paid: boolean; paid_claimed_at: string | null }>> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("confirm_settlement_payment", {
    p_settlement_id: settlementId,
    p_user_id: userId,
    p_paid: paid,
  });
  const row = data?.[0];
  if (error || !row) {
    return { ok: false, error: mapSettlementPaymentError(error?.message) };
  }
  revalidatePath(`/events/${eventId}/settlement`);
  revalidatePath("/home");
  return {
    ok: true,
    data: { paid: row.paid, paid_claimed_at: row.paid_claimed_at },
  };
}
