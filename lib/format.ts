const TIME_ZONE = "Asia/Seoul";

const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: TIME_ZONE,
  month: "long",
  day: "numeric",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: TIME_ZONE,
  month: "long",
  day: "numeric",
  weekday: "short",
});

const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// 예: "10월 25일 (토) 10:00"
export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function formatTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

// 예: 12000 -> "12,000원"
export function formatWon(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

// ISO 시각을 <input type="datetime-local"> 값("YYYY-MM-DDTHH:mm", 한국 시간)으로 변환한다.
export function toDateTimeLocal(iso: string): string {
  const parts = Object.fromEntries(
    partsFormatter.formatToParts(new Date(iso)).map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

// <input type="datetime-local"> 값("YYYY-MM-DDTHH:mm", 한국 시간)을 ISO 시각으로 변환한다.
export function fromDateTimeLocal(value: string): string {
  return new Date(`${value}:00+09:00`).toISOString();
}

// 출석률 표시: 분모가 0이면 "-"
export function formatRate(attended: number, total: number): string {
  if (total === 0) return "-";
  return `${Math.round((attended / total) * 100)}%`;
}
