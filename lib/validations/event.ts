import { z } from "zod";

const MAX_CAPACITY = 1000;

// 숫자 입력은 폼에서 문자열로 다루고(빈 값 허용), 저장 시 parseCapacity로 변환한다.
const capacityField = z
  .string()
  .refine(
    (value) =>
      value === "" ||
      (/^\d+$/.test(value) &&
        Number(value) > 0 &&
        Number(value) <= MAX_CAPACITY),
    `정원은 1 이상 ${MAX_CAPACITY} 이하의 정수여야 합니다`,
  );

export const eventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "제목을 입력해 주세요")
      .max(100, "제목은 100자 이하여야 합니다"),
    starts_at: z.string().min(1, "시작 일시를 선택해 주세요"),
    location: z.string().trim().max(100, "장소는 100자 이하여야 합니다"),
    capacity: capacityField,
    rsvp_deadline: z.string().min(1, "응답 마감 일시를 선택해 주세요"),
    notice: z.string().max(1000, "공지는 1000자 이하여야 합니다"),
    notify_by_email: z.boolean(),
  })
  .refine(
    (value) =>
      !value.starts_at ||
      !value.rsvp_deadline ||
      new Date(value.rsvp_deadline) < new Date(value.starts_at),
    {
      message: "응답 마감은 시작 일시보다 앞서야 합니다",
      path: ["rsvp_deadline"],
    },
  );

export type EventFormValues = z.infer<typeof eventSchema>;

export function parseCapacity(value: string): number | null {
  return value === "" ? null : Number(value);
}
