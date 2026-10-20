import { z } from "zod";

export const groupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "모임 이름을 입력해 주세요")
    .max(50, "모임 이름은 50자 이하여야 합니다"),
});

export type GroupFormValues = z.infer<typeof groupSchema>;
