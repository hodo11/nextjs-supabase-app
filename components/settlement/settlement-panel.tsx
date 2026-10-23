"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, Clock, Mail, Wallet } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  claimSettlementPayment,
  confirmSettlementPayment,
  createSettlement,
  resendSettlementEmail,
} from "@/lib/actions/settlements";
import { formatDateTime, formatWon } from "@/lib/format";
import type { Profile } from "@/lib/types/domain";
import {
  calcPerPerson,
  settlementSchema,
  type SettlementFormValues,
} from "@/lib/validations/settlement";

export interface PaymentEntry {
  user_id: string;
  profile: Profile;
  paid: boolean;
  paid_claimed_at: string | null;
}

export interface SettlementInfo {
  id: string;
  total_amount: number;
  per_person: number;
  bank_info: string;
}

interface SettlementPanelProps {
  eventId: string;
  goingProfiles: Profile[];
  initialSettlement: SettlementInfo | null;
  initialPayments: PaymentEntry[];
  isHost: boolean;
  viewerId: string;
  // 이벤트가 끝나기 전에는 정산을 만들 수 없다.
  canCreate: boolean;
}

type PaymentState = "unpaid" | "claimed" | "paid";

function stateOf(p: PaymentEntry): PaymentState {
  if (p.paid) return "paid";
  return p.paid_claimed_at ? "claimed" : "unpaid";
}

const STATE_LABEL: Record<PaymentState, string> = {
  unpaid: "미납",
  claimed: "확인 대기",
  paid: "완료",
};

// 색뿐 아니라 아이콘과 텍스트로도 상태를 구분한다.
function PaymentBadge({ state }: { state: PaymentState }) {
  if (state === "paid") {
    return (
      <Badge>
        <CircleCheck className="mr-1 size-3" aria-hidden />
        {STATE_LABEL[state]}
      </Badge>
    );
  }
  if (state === "claimed") {
    return (
      <Badge variant="outline">
        <Clock className="mr-1 size-3" aria-hidden />
        {STATE_LABEL[state]}
      </Badge>
    );
  }
  return <Badge variant="secondary">{STATE_LABEL[state]}</Badge>;
}

export function SettlementPanel({
  eventId,
  goingProfiles,
  initialSettlement,
  initialPayments,
  isHost,
  viewerId,
  canCreate,
}: SettlementPanelProps) {
  const [settlement, setSettlement] = useState(initialSettlement);
  const [payments, setPayments] = useState(initialPayments);
  const [pendingValues, setPendingValues] =
    useState<SettlementFormValues | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const form = useForm<SettlementFormValues>({
    resolver: zodResolver(settlementSchema),
    defaultValues: { total_amount: "", bank_info: "" },
  });

  const headcount = goingProfiles.length;
  const watchedTotal = useWatch({
    control: form.control,
    name: "total_amount",
  });
  const previewTotal = /^\d+$/.test(watchedTotal) ? Number(watchedTotal) : 0;
  const previewPerPerson = calcPerPerson(previewTotal, headcount);

  async function create() {
    if (!pendingValues) return;
    setIsCreating(true);
    const result = await createSettlement(eventId, pendingValues);
    setIsCreating(false);
    setPendingValues(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setSettlement(result.data.settlement);
    setPayments(result.data.payments);
    toast.success("정산을 만들고 참석자에게 메일을 보냈습니다");
  }

  async function handleResend() {
    setIsResending(true);
    const result = await resendSettlementEmail(eventId, settlement!.id);
    setIsResending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    if (result.data.sent) {
      toast.success("미납자에게 정산 메일을 다시 보냈습니다.");
    } else {
      toast.error(result.data.reason ?? "메일을 보내지 못했습니다.");
    }
  }

  async function togglePaid(userId: string, paid: boolean) {
    const result = await confirmSettlementPayment(
      eventId,
      settlement!.id,
      userId,
      paid,
    );
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setPayments((prev) =>
      prev.map((p) => (p.user_id === userId ? { ...p, ...result.data } : p)),
    );
  }

  async function claim(userId: string, value: boolean) {
    const result = await claimSettlementPayment(eventId, settlement!.id, value);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setPayments((prev) =>
      prev.map((p) =>
        p.user_id === userId
          ? { ...p, paid_claimed_at: result.data.paid_claimed_at }
          : p,
      ),
    );
    toast.success(
      value
        ? "송금했다고 표시했습니다. 주최자가 확인하면 완료됩니다"
        : "송금 표시를 취소했습니다",
    );
  }

  // ── 정산 전 ──
  if (!settlement) {
    if (!isHost) {
      return (
        <EmptyState
          icon={Wallet}
          title="아직 정산이 만들어지지 않았습니다"
          description="주최자가 정산을 만들면 메일과 이 화면에서 금액을 확인할 수 있습니다."
        />
      );
    }
    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => setPendingValues(values))}
          className="flex flex-col gap-6"
        >
          {!canCreate ? (
            <p className="text-muted-foreground rounded-md border border-dashed p-3 text-sm">
              이벤트가 끝난 뒤에 정산을 만들 수 있습니다.
            </p>
          ) : null}
          <FormField
            control={form.control}
            name="total_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>총액 (원)</FormLabel>
                <FormControl>
                  <Input
                    inputMode="numeric"
                    placeholder="예: 58000"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bank_info"
            render={({ field }) => (
              <FormItem>
                <FormLabel>입금 계좌</FormLabel>
                <FormControl>
                  <Input
                    placeholder="예: 카카오뱅크 3333-01-1234567 (김하늘)"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  참석자에게 보내는 정산 메일에 그대로 표시됩니다.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Card>
            <CardContent className="flex flex-col gap-1 p-4 text-sm">
              <p>
                정산 대상: 참석(going) <strong>{headcount}명</strong>
              </p>
              <p>
                1인당 금액:{" "}
                <strong>
                  {previewTotal > 0 ? formatWon(previewPerPerson) : "-"}
                </strong>
              </p>
              <p className="text-muted-foreground text-xs">
                10원 단위로 올림합니다. 정산을 만든 뒤에는 대상 명단이
                고정됩니다.
              </p>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={!canCreate || headcount === 0 || isCreating}
          >
            정산 만들기
          </Button>
          {headcount === 0 ? (
            <p className="text-muted-foreground text-xs">
              참석 응답자가 없어 정산을 만들 수 없습니다.
            </p>
          ) : null}

          <ConfirmDialog
            open={pendingValues !== null}
            onOpenChange={(open) => {
              if (!open) setPendingValues(null);
            }}
            title="정산을 만들까요?"
            description={`참석자 ${headcount}명에게 1인당 ${formatWon(
              pendingValues
                ? calcPerPerson(Number(pendingValues.total_amount), headcount)
                : 0,
            )}씩 정산 메일이 발송됩니다. 만든 뒤에는 명단을 바꿀 수 없습니다.`}
            confirmLabel="정산 만들기"
            onConfirm={create}
          />
        </form>
      </Form>
    );
  }

  // ── 정산 후 ──
  const counts = { unpaid: 0, claimed: 0, paid: 0 };
  for (const p of payments) counts[stateOf(p)] += 1;
  const mine = payments.find((p) => p.user_id === viewerId);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-2 p-4 text-sm">
          <div className="flex items-baseline justify-between">
            <span className="text-muted-foreground">총액</span>
            <span className="font-semibold">
              {formatWon(settlement.total_amount)}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-muted-foreground">1인당</span>
            <span className="text-lg font-bold">
              {formatWon(settlement.per_person)}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-muted-foreground shrink-0">입금 계좌</span>
            <span className="text-right">{settlement.bank_info}</span>
          </div>
        </CardContent>
      </Card>

      {!isHost && mine ? (
        <Card>
          <CardContent className="flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">내 정산</h2>
              <PaymentBadge state={stateOf(mine)} />
            </div>
            <p className="text-muted-foreground text-sm">
              {formatWon(settlement.per_person)}을 위 계좌로 보내 주세요.
            </p>
            {stateOf(mine) === "unpaid" ? (
              <Button onClick={() => claim(mine.user_id, true)}>
                송금했어요
              </Button>
            ) : mine.paid_claimed_at ? (
              <div className="flex flex-col gap-2">
                <p className="text-muted-foreground text-xs">
                  {formatDateTime(mine.paid_claimed_at)}에 송금했다고
                  표시했습니다.
                  {mine.paid
                    ? ""
                    : " 주최자가 입금을 확인하면 완료로 바뀝니다."}
                </p>
                {!mine.paid ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => claim(mine.user_id, false)}
                  >
                    송금 표시 취소
                  </Button>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {!isHost && !mine ? (
        <p className="text-muted-foreground text-sm">
          정산 대상(참석자)이 아니어서 내야 할 금액이 없습니다.
        </p>
      ) : null}

      <section
        aria-labelledby="payments-heading"
        className="flex flex-col gap-3"
      >
        <div className="flex items-center justify-between">
          <h2 id="payments-heading" className="text-lg font-semibold">
            납부 현황
          </h2>
          {isHost ? (
            <Button
              variant="outline"
              size="sm"
              disabled={isResending}
              onClick={handleResend}
            >
              <Mail />
              메일 재발송
            </Button>
          ) : null}
        </div>

        <dl className="grid grid-cols-3 gap-2 text-center">
          {(["unpaid", "claimed", "paid"] as const).map((key) => (
            <div key={key} className="rounded-lg border p-2">
              <dt className="text-muted-foreground text-xs">
                {STATE_LABEL[key]}
              </dt>
              <dd className="text-lg font-semibold">{counts[key]}</dd>
            </div>
          ))}
        </dl>

        <ul className="divide-y rounded-lg border">
          {payments
            .filter((p) => isHost || p.user_id === viewerId)
            .map((p) => (
              <li key={p.user_id} className="flex items-center gap-3 p-3">
                <Avatar>
                  <AvatarFallback>
                    {p.profile.display_name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {p.profile.display_name}
                </span>
                <PaymentBadge state={stateOf(p)} />
                {isHost ? (
                  <label className="flex items-center gap-2 text-xs">
                    <Checkbox
                      checked={p.paid}
                      onCheckedChange={(checked) =>
                        togglePaid(p.user_id, checked === true)
                      }
                      aria-label={`${p.profile.display_name} 입금 확인`}
                    />
                    입금 확인
                  </label>
                ) : null}
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
