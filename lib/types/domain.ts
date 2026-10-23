// Supabase 생성 타입(lib/database.types.ts) 기반 별칭.
// check 제약은 생성 타입에 리터럴로 반영되지 않으므로 role/status만 수기로 좁힌다.
import type { Tables } from "@/lib/database.types";

export type GroupRole = "host" | "member";

export interface Profile {
  id: string;
  display_name: string;
}

export type Group = Tables<"groups">;

export type GroupMember = Omit<Tables<"group_members">, "role"> & {
  role: GroupRole;
};

export type EventStatus = "active" | "cancelled";

export type Event = Omit<Tables<"events">, "status"> & {
  status: EventStatus;
};

export type RsvpStatus = "going" | "not_going" | "maybe" | "waitlisted";

// attended는 Phase 5(Task 027)에서 rsvps 테이블에 추가될 컬럼이다.
// 그 전까지 실쿼리 결과에는 placeholder(false)를 채워 M4 더미 UI와의 타입 호환을 유지한다.
export type Rsvp = Omit<Tables<"rsvps">, "status"> & {
  status: RsvpStatus;
  attended: boolean;
};

export type Settlement = Tables<"settlements">;

export type SettlementPayment = Tables<"settlement_payments">;

// M3~M4(카풀·출석)는 아직 테이블이 없어 수기 타입을 유지한다.
// 해당 Phase의 Task에서 생성 타입 별칭으로 교체한다.
export interface Ride {
  id: string;
  event_id: string;
  driver_id: string;
  origin: string;
  depart_at: string;
  seats: number;
}

export type RideRequestStatus = "pending" | "approved" | "rejected";

export interface RideRequest {
  id: string;
  ride_id: string;
  user_id: string;
  status: RideRequestStatus;
}
