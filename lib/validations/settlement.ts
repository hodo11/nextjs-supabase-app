import { z } from "zod";

// DB integer 최대값(약 21억)을 넘지 않도록 제한한다.
export const MAX_TOTAL_AMOUNT = 2_000_000_000;

export const settlementSchema = z.object({
  total_amount: z
    .string()
    .refine(
      (value) =>
        /^\d+$/.test(value) &&
        Number(value) > 0 &&
        Number(value) <= MAX_TOTAL_AMOUNT,
      `총액은 1원 이상 ${MAX_TOTAL_AMOUNT.toLocaleString("ko-KR")}원 이하의 정수여야 합니다`,
    ),
  bank_info: z
    .string()
    .trim()
    .min(1, "계좌 정보를 입력해 주세요")
    .max(100, "계좌 정보는 100자 이하여야 합니다"),
});

export type SettlementFormValues = z.infer<typeof settlementSchema>;

// 1인당 금액은 10원 단위로 올림한다(PRD: ceil(총액 / 인원 / 10) * 10).
export function calcPerPerson(totalAmount: number, headcount: number): number {
  if (headcount <= 0) return 0;
  return Math.ceil(totalAmount / headcount / 10) * 10;
}
