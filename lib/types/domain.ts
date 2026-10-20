// PRD 6장 데이터 모델과 필드명을 맞춘 수기 타입(Task 007에서 생성 타입 별칭으로 교체).
// 시각 필드는 ISO 8601 문자열(timestamptz)이다.

export type GroupRole = "host" | "member";

export interface Profile {
  id: string;
  display_name: string;
}

export interface Group {
  id: string;
  name: string;
  invite_code: string;
  owner_id: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  role: GroupRole;
  joined_at: string;
}

export type EventStatus = "active" | "cancelled";

export interface Event {
  id: string;
  group_id: string;
  title: string;
  starts_at: string;
  location: string | null;
  capacity: number | null;
  rsvp_deadline: string;
  notice: string | null;
  status: EventStatus;
  reminder_sent_at: string | null;
}

export type RsvpStatus = "going" | "not_going" | "maybe" | "waitlisted";

export interface Rsvp {
  event_id: string;
  user_id: string;
  status: RsvpStatus;
  attended: boolean;
  responded_at: string;
}

export interface Settlement {
  id: string;
  event_id: string;
  total_amount: number;
  per_person: number;
  bank_info: string;
}

export interface SettlementPayment {
  settlement_id: string;
  user_id: string;
  paid_claimed_at: string | null;
  paid: boolean;
}

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
