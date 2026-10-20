import { z } from "zod";

export const rideSchema = z.object({
  origin: z
    .string()
    .trim()
    .min(1, "출발지를 입력해 주세요")
    .max(100, "출발지는 100자 이하여야 합니다"),
  depart_at: z.string().min(1, "출발 시각을 선택해 주세요"),
  seats: z
    .string()
    .refine(
      (value) =>
        /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 8,
      "좌석은 1~8 사이의 정수여야 합니다",
    ),
});

export type RideFormValues = z.infer<typeof rideSchema>;
