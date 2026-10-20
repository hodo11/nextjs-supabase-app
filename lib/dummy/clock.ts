// 스크린샷이 재현되도록 "현재 시각"을 고정한다(2026-10-20 12:00 KST).
const DUMMY_NOW = "2026-10-20T03:00:00.000Z";

export async function getNow(): Promise<Date> {
  return new Date(DUMMY_NOW);
}
