import { getNow } from "@/lib/dummy/clock";
import {
  events,
  groupMembers,
  groups,
  profiles,
  rideRequests,
  rides,
  rsvps,
  settlementPayments,
  settlements,
} from "@/lib/dummy/data";
import { getEventPhase, type EventPhase } from "@/lib/event-state";
import type {
  Event,
  Group,
  GroupMember,
  GroupRole,
  Profile,
  Ride,
  RideRequest,
  Rsvp,
  Settlement,
  SettlementPayment,
} from "@/lib/types/domain";

// 화면은 이 파일의 async 함수만 호출한다. Phase 2에서 호출부는 그대로 두고 구현만 Supabase 쿼리로 교체한다.

const byProfileId = new Map(profiles.map((p) => [p.id, p]));

function profileOf(userId: string): Profile {
  return byProfileId.get(userId) ?? { id: userId, display_name: "알 수 없음" };
}

export async function getProfile(userId: string): Promise<Profile> {
  return profileOf(userId);
}

export interface GroupSummary {
  group: Group;
  my_role: GroupRole;
  member_count: number;
  upcoming_event_count: number;
}

export async function getMyGroups(viewerId: string): Promise<GroupSummary[]> {
  const now = await getNow();
  return groupMembers
    .filter((m) => m.user_id === viewerId)
    .map((m) => {
      const group = groups.find((g) => g.id === m.group_id)!;
      return {
        group,
        my_role: m.role,
        member_count: groupMembers.filter((x) => x.group_id === group.id)
          .length,
        upcoming_event_count: events.filter(
          (e) =>
            e.group_id === group.id &&
            ["upcoming", "closed"].includes(getEventPhase(e, now)),
        ).length,
      };
    });
}

export async function getGroup(groupId: string): Promise<Group | null> {
  return groups.find((g) => g.id === groupId) ?? null;
}

export async function getMyRole(
  groupId: string,
  viewerId: string,
): Promise<GroupRole | null> {
  return (
    groupMembers.find((m) => m.group_id === groupId && m.user_id === viewerId)
      ?.role ?? null
  );
}

export interface MemberWithProfile extends GroupMember {
  profile: Profile;
}

export async function getGroupMembers(
  groupId: string,
): Promise<MemberWithProfile[]> {
  return groupMembers
    .filter((m) => m.group_id === groupId)
    .map((m) => ({ ...m, profile: profileOf(m.user_id) }))
    .sort((a, b) =>
      a.role === b.role
        ? Date.parse(a.joined_at) - Date.parse(b.joined_at)
        : a.role === "host"
          ? -1
          : 1,
    );
}

export interface EventWithPhase {
  event: Event;
  phase: EventPhase;
}

export async function getEventsByGroup(
  groupId: string,
): Promise<EventWithPhase[]> {
  const now = await getNow();
  return events
    .filter((e) => e.group_id === groupId)
    .map((event) => ({ event, phase: getEventPhase(event, now) }))
    .sort(
      (a, b) => Date.parse(b.event.starts_at) - Date.parse(a.event.starts_at),
    );
}

export async function getEvent(
  eventId: string,
): Promise<EventWithPhase | null> {
  const event = events.find((e) => e.id === eventId);
  if (!event) return null;
  const now = await getNow();
  return { event, phase: getEventPhase(event, now) };
}

export interface RsvpWithProfile extends Rsvp {
  profile: Profile;
}

export async function getRsvps(eventId: string): Promise<RsvpWithProfile[]> {
  return rsvps
    .filter((r) => r.event_id === eventId)
    .map((r) => ({ ...r, profile: profileOf(r.user_id) }))
    .sort((a, b) => Date.parse(a.responded_at) - Date.parse(b.responded_at));
}

export interface PendingRsvpTask {
  event: Event;
  group: Group;
  phase: EventPhase;
}

// 홈 "내 할 일": 응답 가능한 이벤트 중 내가 아직 응답하지 않은 것, 마감 임박 순
export async function getPendingRsvpTasks(
  viewerId: string,
): Promise<PendingRsvpTask[]> {
  const now = await getNow();
  const myGroupIds = groupMembers
    .filter((m) => m.user_id === viewerId)
    .map((m) => m.group_id);
  return events
    .filter(
      (e) =>
        myGroupIds.includes(e.group_id) &&
        getEventPhase(e, now) === "upcoming" &&
        !rsvps.some((r) => r.event_id === e.id && r.user_id === viewerId),
    )
    .sort((a, b) => Date.parse(a.rsvp_deadline) - Date.parse(b.rsvp_deadline))
    .map((event) => ({
      event,
      group: groups.find((g) => g.id === event.group_id)!,
      phase: getEventPhase(event, now),
    }));
}

export interface UnpaidSettlementTask {
  event: Event;
  settlement: Settlement;
  payment: SettlementPayment;
}

// 홈 "내 할 일": 내가 아직 입금 확인되지 않은 정산
export async function getUnpaidSettlementTasks(
  viewerId: string,
): Promise<UnpaidSettlementTask[]> {
  return settlementPayments
    .filter((p) => p.user_id === viewerId && !p.paid)
    .map((payment) => {
      const settlement = settlements.find(
        (s) => s.id === payment.settlement_id,
      )!;
      const event = events.find((e) => e.id === settlement.event_id)!;
      return { event, settlement, payment };
    });
}

export async function getSettlement(
  eventId: string,
): Promise<Settlement | null> {
  return settlements.find((s) => s.event_id === eventId) ?? null;
}

export interface PaymentWithProfile extends SettlementPayment {
  profile: Profile;
}

export async function getSettlementPayments(
  settlementId: string,
): Promise<PaymentWithProfile[]> {
  return settlementPayments
    .filter((p) => p.settlement_id === settlementId)
    .map((p) => ({ ...p, profile: profileOf(p.user_id) }));
}

export interface RideRequestWithProfile extends RideRequest {
  profile: Profile;
}

export interface RideWithDetails extends Ride {
  driver: Profile;
  requests: RideRequestWithProfile[];
}

export async function getRides(eventId: string): Promise<RideWithDetails[]> {
  return rides
    .filter((r) => r.event_id === eventId)
    .map((ride) => ({
      ...ride,
      driver: profileOf(ride.driver_id),
      requests: rideRequests
        .filter((rr) => rr.ride_id === ride.id)
        .map((rr) => ({ ...rr, profile: profileOf(rr.user_id) })),
    }));
}

export interface AttendanceRow {
  profile: Profile;
  attended: number;
  total: number;
}

// 출석 현황: 종료된 이벤트 중 going 응답 횟수(분모) 대비 출석 횟수
export async function getAttendanceStats(
  groupId: string,
): Promise<AttendanceRow[]> {
  const now = await getNow();
  const pastEventIds = events
    .filter((e) => e.group_id === groupId && getEventPhase(e, now) === "past")
    .map((e) => e.id);
  return groupMembers
    .filter((m) => m.group_id === groupId)
    .map((m) => {
      const mine = rsvps.filter(
        (r) =>
          pastEventIds.includes(r.event_id) &&
          r.user_id === m.user_id &&
          r.status === "going",
      );
      return {
        profile: profileOf(m.user_id),
        attended: mine.filter((r) => r.attended).length,
        total: mine.length,
      };
    });
}

export type InviteLookup =
  | { state: "valid"; group: Group; member_count: number }
  | { state: "already_member"; group: Group }
  | { state: "invalid" };

export async function lookupInvite(
  code: string,
  viewerId: string,
): Promise<InviteLookup> {
  const group = groups.find((g) => g.invite_code === code);
  if (!group) return { state: "invalid" };
  const isMember = groupMembers.some(
    (m) => m.group_id === group.id && m.user_id === viewerId,
  );
  if (isMember) return { state: "already_member", group };
  return {
    state: "valid",
    group,
    member_count: groupMembers.filter((m) => m.group_id === group.id).length,
  };
}
