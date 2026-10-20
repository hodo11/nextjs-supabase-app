import { z } from "zod";

// waitlisted는 정원 초과 시 시스템이 부여하므로 사용자가 직접 고를 수 없다.
export const rsvpSchema = z.object({
  status: z.enum(["going", "not_going", "maybe"], {
    message: "참석 여부를 선택해 주세요",
  }),
});

export type RsvpFormValues = z.infer<typeof rsvpSchema>;
