import { Resend } from "resend";

let cached: Resend | null = null;

// RESEND_API_KEY 미설정 시 null을 반환한다. 호출부는 null이면 발송을 건너뛰고 안내만 남긴다.
export function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!cached) cached = new Resend(process.env.RESEND_API_KEY);
  return cached;
}

export function getEmailFrom(): string {
  return process.env.EMAIL_FROM ?? "모임 매니저 <notice@example.com>";
}
