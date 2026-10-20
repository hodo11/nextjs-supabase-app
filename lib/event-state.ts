import type { Event } from "@/lib/types/domain";

// upcoming: 응답 가능, closed: 응답 마감(시작 전), past: 종료, cancelled: 취소됨
export type EventPhase = "upcoming" | "closed" | "past" | "cancelled";

export function getEventPhase(event: Event, now: Date): EventPhase {
  if (event.status === "cancelled") return "cancelled";
  if (new Date(event.starts_at) <= now) return "past";
  if (new Date(event.rsvp_deadline) <= now) return "closed";
  return "upcoming";
}

export function isRsvpOpen(phase: EventPhase): boolean {
  return phase === "upcoming";
}
