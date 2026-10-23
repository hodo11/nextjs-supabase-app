import { getNow } from "@/lib/dummy/clock";
import {
  events,
  groupMembers,
  profiles,
  rideRequests,
  rides,
  rsvps,
} from "@/lib/dummy/data";
import { getEventPhase, type EventPhase } from "@/lib/event-state";
import { createClient } from "@/lib/supabase/server";
import type {
  Event,
  Group,
  GroupMember,
  GroupRole,
  Profile,
  Ride,
  RideRequest,
  Rsvp,
  RsvpStatus,
  Settlement,
  SettlementPayment,
} from "@/lib/types/domain";

// 화면은 이 파일의 async 함수만 호출한다. Phase 2에서 호출부는 그대로 두고 구현만 Supabase 쿼리로 교체한다.
// M1(모임·멤버·이벤트·RSVP·홈 할 일) 함수는 Supabase 쿼리로 교체 완료.
// M2(정산)~M4(카풀·출석) 함수는 Phase 3~5에서 교체 예정이라 당분간 lib/dummy/data의 더미 배열을 그대로 쓴다.

const byProfileId = new Map(profiles.map((p) => [p.id, p]));

function profileOf(userId: string): Profile {
  return byProfileId.get(userId) ?? { id: userId, display_name: "알 수 없음" };
}

export async function getProfile(userId: string): Promise<Profile> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", userId)
    .maybeSingle();
  return data
    ? { id: data.id, display_name: data.full_name ?? "이름 없음" }
    : { id: userId, display_name: "알 수 없음" };
}

export interface GroupSummary {
  group: Group;
  my_role: GroupRole;
  member_count: number;
  upcoming_event_count: number;
}

export async function getMyGroups(viewerId: string): Promise<GroupSummary[]> {
  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id, role, groups(*)")
    .eq("user_id", viewerId);

  const rows = (memberships ?? []).filter((m) => m.groups !== null);
  if (rows.length === 0) return [];

  const groupIds = rows.map((m) => m.group_id);
  const [{ data: allMembers }, { data: allEvents }] = await Promise.all([
    supabase.from("group_members").select("group_id").in("group_id", groupIds),
    supabase
      .from("events")
      .select("group_id")
      .in("group_id", groupIds)
      .eq("status", "active")
      .gt("starts_at", new Date().toISOString()),
  ]);

  const memberCountByGroup = new Map<string, number>();
  for (const m of allMembers ?? []) {
    memberCountByGroup.set(
      m.group_id,
      (memberCountByGroup.get(m.group_id) ?? 0) + 1,
    );
  }
  const eventCountByGroup = new Map<string, number>();
  for (const e of allEvents ?? []) {
    eventCountByGroup.set(
      e.group_id,
      (eventCountByGroup.get(e.group_id) ?? 0) + 1,
    );
  }

  return rows.map((m) => ({
    group: m.groups as unknown as Group,
    my_role: m.role as GroupRole,
    member_count: memberCountByGroup.get(m.group_id) ?? 0,
    upcoming_event_count: eventCountByGroup.get(m.group_id) ?? 0,
  }));
}

export async function getGroup(groupId: string): Promise<Group | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .maybeSingle();
  return data;
}

export async function getMyRole(
  groupId: string,
  viewerId: string,
): Promise<GroupRole | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", viewerId)
    .maybeSingle();
  return (data?.role as GroupRole | undefined) ?? null;
}

export interface MemberWithProfile extends GroupMember {
  profile: Profile;
}

export async function getGroupMembers(
  groupId: string,
): Promise<MemberWithProfile[]> {
  const supabase = await createClient();
  const [{ data: members }, { data: memberProfiles }] = await Promise.all([
    supabase
      .from("group_members")
      .select("group_id, user_id, role, joined_at")
      .eq("group_id", groupId),
    supabase.rpc("get_group_profiles", { gid: groupId }),
  ]);

  const profileById = new Map(
    (memberProfiles ?? []).map((p) => [
      p.id,
      { id: p.id, display_name: p.display_name } satisfies Profile,
    ]),
  );

  return (members ?? [])
    .map((m) => ({
      ...m,
      role: m.role as GroupRole,
      profile: profileById.get(m.user_id) ?? {
        id: m.user_id,
        display_name: "알 수 없음",
      },
    }))
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
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("group_id", groupId)
    .order("starts_at", { ascending: false });

  const now = new Date();
  return (data ?? []).map((event) => ({
    event: event as Event,
    phase: getEventPhase(event as Event, now),
  }));
}

export async function getEvent(
  eventId: string,
): Promise<EventWithPhase | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .maybeSingle();
  if (!data) return null;
  const event = data as Event;
  return { event, phase: getEventPhase(event, new Date()) };
}

export interface RsvpWithProfile extends Rsvp {
  profile: Profile;
}

export async function getRsvps(eventId: string): Promise<RsvpWithProfile[]> {
  const supabase = await createClient();
  const [{ data: event }, { data: rows }] = await Promise.all([
    supabase.from("events").select("group_id").eq("id", eventId).maybeSingle(),
    supabase
      .from("rsvps")
      .select("event_id, user_id, status, responded_at")
      .eq("event_id", eventId),
  ]);

  const { data: profiles } = event
    ? await supabase.rpc("get_group_profiles", { gid: event.group_id })
    : { data: null };
  const profileById = new Map(
    (profiles ?? []).map((p) => [
      p.id,
      { id: p.id, display_name: p.display_name },
    ]),
  );

  return (rows ?? [])
    .map((r) => ({
      ...r,
      status: r.status as RsvpStatus,
      attended: false,
      profile: profileById.get(r.user_id) ?? {
        id: r.user_id,
        display_name: "알 수 없음",
      },
    }))
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
  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", viewerId);
  const groupIds = (memberships ?? []).map((m) => m.group_id);
  if (groupIds.length === 0) return [];

  const now = new Date();
  const [{ data: dueEvents }, { data: responded }] = await Promise.all([
    supabase
      .from("events")
      .select("*, groups(*)")
      .in("group_id", groupIds)
      .eq("status", "active")
      .gt("starts_at", now.toISOString())
      .gt("rsvp_deadline", now.toISOString())
      .order("rsvp_deadline", { ascending: true }),
    supabase.from("rsvps").select("event_id").eq("user_id", viewerId),
  ]);

  const respondedEventIds = new Set((responded ?? []).map((r) => r.event_id));

  return (dueEvents ?? [])
    .filter((e) => !respondedEventIds.has(e.id) && e.groups !== null)
    .map((e) => {
      const { groups: group, ...eventRow } = e;
      const event = eventRow as Event;
      return {
        event,
        group: group as unknown as Group,
        phase: getEventPhase(event, now),
      };
    });
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
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("settlement_payments")
    .select("*, settlements(*, events(*))")
    .eq("user_id", viewerId)
    .eq("paid", false);

  return (rows ?? [])
    .filter((r) => r.settlements !== null && r.settlements.events !== null)
    .map((r) => {
      const { settlements: settlementRow, ...payment } = r;
      const { events: eventRow, ...settlement } = settlementRow!;
      return {
        event: eventRow as Event,
        settlement: settlement as Settlement,
        payment: payment as SettlementPayment,
      };
    });
}

export async function getSettlement(
  eventId: string,
): Promise<Settlement | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settlements")
    .select("*")
    .eq("event_id", eventId)
    .maybeSingle();
  return data;
}

export interface PaymentWithProfile extends SettlementPayment {
  profile: Profile;
}

export async function getSettlementPayments(
  settlementId: string,
): Promise<PaymentWithProfile[]> {
  const supabase = await createClient();
  const { data: settlement } = await supabase
    .from("settlements")
    .select("event_id")
    .eq("id", settlementId)
    .maybeSingle();
  const { data: rows } = await supabase
    .from("settlement_payments")
    .select("*")
    .eq("settlement_id", settlementId);
  const { data: event } = settlement
    ? await supabase
        .from("events")
        .select("group_id")
        .eq("id", settlement.event_id)
        .maybeSingle()
    : { data: null };
  const { data: profiles } = event
    ? await supabase.rpc("get_group_profiles", { gid: event.group_id })
    : { data: null };
  const profileById = new Map(
    (profiles ?? []).map((p) => [
      p.id,
      { id: p.id, display_name: p.display_name },
    ]),
  );
  return (rows ?? []).map((p) => ({
    ...p,
    profile: profileById.get(p.user_id) ?? {
      id: p.user_id,
      display_name: "알 수 없음",
    },
  }));
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
  | {
      state: "valid";
      group: { id: string; name: string };
      member_count: number;
    }
  | { state: "already_member"; group: { id: string; name: string } }
  | { state: "invalid" };

export async function lookupInvite(
  code: string,
  viewerId: string | null,
): Promise<InviteLookup> {
  const supabase = await createClient();
  const { data } = await supabase
    .rpc("get_group_preview", { code })
    .maybeSingle();

  if (!data) return { state: "invalid" };

  const group = { id: data.id, name: data.name };

  if (viewerId) {
    const role = await getMyRole(data.id, viewerId);
    if (role) return { state: "already_member", group };
  }

  return { state: "valid", group, member_count: Number(data.member_count) };
}
