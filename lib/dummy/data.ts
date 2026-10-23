import type {
  Event,
  Group,
  GroupMember,
  Profile,
  Ride,
  RideRequest,
  Rsvp,
} from "@/lib/types/domain";

// 시각은 모두 KST(+09:00) 기준으로 적는다. 기준 시각은 clock.ts (2026-10-20 12:00 KST).

export const profiles: Profile[] = [
  { id: "u1", display_name: "김하늘" },
  { id: "u2", display_name: "이도윤" },
  { id: "u3", display_name: "박서연" },
  { id: "u4", display_name: "최민준" },
  { id: "u5", display_name: "정지우" },
  { id: "u6", display_name: "한소율" },
  { id: "u7", display_name: "오지호" },
];

function group(
  id: string,
  name: string,
  invite_code: string,
  owner_id: string,
  created_at: string,
): Group {
  return {
    id,
    name,
    invite_code,
    owner_id,
    created_at,
    updated_at: created_at,
  };
}

export const groups: Group[] = [
  group("g1", "토요 수영 모임", "swim-2026", "u1", "2026-08-01T10:00:00+09:00"),
  group("g2", "수요 헬스 크루", "gym-2026", "u1", "2026-09-01T10:00:00+09:00"),
  // 보는 사람(u1, u2)이 멤버가 아닌 모임: 초대 수락 화면용
  group(
    "g3",
    "주말 등산 친구들",
    "hike-2026",
    "u3",
    "2026-10-01T10:00:00+09:00",
  ),
];

function member(
  group_id: string,
  user_id: string,
  role: GroupMember["role"],
  joined_at: string,
): GroupMember {
  return { group_id, user_id, role, joined_at };
}

export const groupMembers: GroupMember[] = [
  // g1: 주최자 2명(u1, u3)
  member("g1", "u1", "host", "2026-08-01T10:00:00+09:00"),
  member("g1", "u3", "host", "2026-08-02T10:00:00+09:00"),
  member("g1", "u2", "member", "2026-08-03T10:00:00+09:00"),
  member("g1", "u4", "member", "2026-08-05T10:00:00+09:00"),
  member("g1", "u5", "member", "2026-08-10T10:00:00+09:00"),
  member("g1", "u6", "member", "2026-09-01T10:00:00+09:00"),
  member("g1", "u7", "member", "2026-09-15T10:00:00+09:00"),
  // g2: 주최자 1명(u1) -> 마지막 주최자 보호 확인용
  member("g2", "u1", "host", "2026-09-01T10:00:00+09:00"),
  member("g2", "u2", "member", "2026-09-02T10:00:00+09:00"),
  member("g2", "u3", "member", "2026-09-03T10:00:00+09:00"),
  member("g2", "u4", "member", "2026-09-04T10:00:00+09:00"),
  // g3
  member("g3", "u3", "host", "2026-10-01T10:00:00+09:00"),
  member("g3", "u4", "member", "2026-10-02T10:00:00+09:00"),
  member("g3", "u5", "member", "2026-10-03T10:00:00+09:00"),
];

const rawEvents: Omit<Event, "created_at" | "updated_at">[] = [
  {
    id: "e1",
    group_id: "g1",
    title: "10월 넷째 주 토요 수영",
    starts_at: "2026-10-24T10:00:00+09:00",
    location: "잠실 종합운동장 수영장",
    capacity: 5,
    rsvp_deadline: "2026-10-23T18:00:00+09:00",
    notice: "수모와 수경을 꼭 챙겨 주세요. 입장료는 현장 결제입니다.",
    status: "active",
    reminder_sent_at: null,
  },
  {
    id: "e2",
    group_id: "g1",
    title: "수요 저녁 자유수영",
    starts_at: "2026-10-22T19:00:00+09:00",
    location: "송파 구민체육센터",
    capacity: null,
    rsvp_deadline: "2026-10-20T09:00:00+09:00",
    notice: null,
    status: "active",
    reminder_sent_at: null,
  },
  {
    id: "e3",
    group_id: "g1",
    title: "10월 둘째 주 토요 수영",
    starts_at: "2026-10-10T10:00:00+09:00",
    location: "잠실 종합운동장 수영장",
    capacity: 8,
    rsvp_deadline: "2026-10-09T18:00:00+09:00",
    notice: "끝나고 근처 식당에서 점심을 함께해요.",
    status: "active",
    reminder_sent_at: "2026-10-09T10:00:00+09:00",
  },
  {
    id: "e4",
    group_id: "g1",
    title: "10월 마지막 주 번개 수영",
    starts_at: "2026-10-27T20:00:00+09:00",
    location: "잠실 종합운동장 수영장",
    capacity: 6,
    rsvp_deadline: "2026-10-26T18:00:00+09:00",
    notice: "시설 점검으로 취소되었습니다.",
    status: "cancelled",
    reminder_sent_at: null,
  },
  {
    id: "e7",
    group_id: "g1",
    title: "10월 첫째 주 토요 수영",
    starts_at: "2026-10-03T10:00:00+09:00",
    location: "잠실 종합운동장 수영장",
    capacity: null,
    rsvp_deadline: "2026-10-02T18:00:00+09:00",
    notice: null,
    status: "active",
    reminder_sent_at: "2026-10-02T10:00:00+09:00",
  },
  {
    id: "e5",
    group_id: "g2",
    title: "하체 데이 합동 운동",
    starts_at: "2026-10-21T20:00:00+09:00",
    location: "역삼 에이치짐",
    capacity: null,
    rsvp_deadline: "2026-10-21T12:00:00+09:00",
    notice: "스쿼트 랙은 8시 정각에 예약해 두었습니다.",
    status: "active",
    reminder_sent_at: null,
  },
  {
    id: "e6",
    group_id: "g2",
    title: "상체 데이 합동 운동",
    starts_at: "2026-10-07T20:00:00+09:00",
    location: "역삼 에이치짐",
    capacity: null,
    rsvp_deadline: "2026-10-07T12:00:00+09:00",
    notice: null,
    status: "active",
    reminder_sent_at: "2026-10-07T08:00:00+09:00",
  },
];

export const events: Event[] = rawEvents.map((e) => ({
  ...e,
  created_at: e.rsvp_deadline,
  updated_at: e.rsvp_deadline,
}));

function rsvp(
  event_id: string,
  user_id: string,
  status: Rsvp["status"],
  responded_at: string,
  attended = false,
): Rsvp {
  return { event_id, user_id, status, attended, responded_at };
}

export const rsvps: Rsvp[] = [
  // e1: 정원 5명 가득, u7은 대기, u2(참여자 보기)는 아직 미응답
  rsvp("e1", "u1", "going", "2026-10-18T09:00:00+09:00"),
  rsvp("e1", "u3", "going", "2026-10-18T10:00:00+09:00"),
  rsvp("e1", "u4", "going", "2026-10-18T11:00:00+09:00"),
  rsvp("e1", "u5", "going", "2026-10-18T12:00:00+09:00"),
  rsvp("e1", "u6", "going", "2026-10-18T13:00:00+09:00"),
  rsvp("e1", "u7", "waitlisted", "2026-10-19T09:00:00+09:00"),
  // e2: 응답 마감됨
  rsvp("e2", "u1", "going", "2026-10-17T09:00:00+09:00"),
  rsvp("e2", "u3", "going", "2026-10-17T10:00:00+09:00"),
  rsvp("e2", "u4", "going", "2026-10-17T11:00:00+09:00"),
  rsvp("e2", "u5", "not_going", "2026-10-17T12:00:00+09:00"),
  rsvp("e2", "u6", "maybe", "2026-10-17T13:00:00+09:00"),
  // e3: 종료, 출석 체크 완료(u4 결석), 정산 있음
  rsvp("e3", "u1", "going", "2026-10-05T09:00:00+09:00", true),
  rsvp("e3", "u2", "going", "2026-10-05T10:00:00+09:00", true),
  rsvp("e3", "u3", "going", "2026-10-05T11:00:00+09:00", true),
  rsvp("e3", "u4", "going", "2026-10-05T12:00:00+09:00", false),
  rsvp("e3", "u5", "going", "2026-10-05T13:00:00+09:00", true),
  rsvp("e3", "u6", "not_going", "2026-10-06T09:00:00+09:00"),
  // e4: 취소됨
  rsvp("e4", "u1", "going", "2026-10-15T09:00:00+09:00"),
  rsvp("e4", "u3", "maybe", "2026-10-15T10:00:00+09:00"),
  // e7: 종료
  rsvp("e7", "u1", "going", "2026-09-28T09:00:00+09:00", true),
  rsvp("e7", "u2", "going", "2026-09-28T10:00:00+09:00", true),
  rsvp("e7", "u3", "going", "2026-09-28T11:00:00+09:00", false),
  rsvp("e7", "u5", "going", "2026-09-28T12:00:00+09:00", true),
  // e5
  rsvp("e5", "u1", "going", "2026-10-19T09:00:00+09:00"),
  rsvp("e5", "u3", "going", "2026-10-19T10:00:00+09:00"),
  rsvp("e5", "u4", "maybe", "2026-10-19T11:00:00+09:00"),
  // e6: 종료
  rsvp("e6", "u1", "going", "2026-10-03T09:00:00+09:00", true),
  rsvp("e6", "u2", "going", "2026-10-03T10:00:00+09:00", true),
  rsvp("e6", "u3", "going", "2026-10-03T11:00:00+09:00", false),
];

export const rides: Ride[] = [
  {
    id: "r1",
    event_id: "e1",
    driver_id: "u3",
    origin: "강남역 2번 출구",
    depart_at: "2026-10-24T08:40:00+09:00",
    seats: 3,
  },
  {
    id: "r2",
    event_id: "e1",
    driver_id: "u6",
    origin: "건대입구역 1번 출구",
    depart_at: "2026-10-24T09:10:00+09:00",
    seats: 2,
  },
];

export const rideRequests: RideRequest[] = [
  { id: "rr1", ride_id: "r1", user_id: "u4", status: "approved" },
  { id: "rr2", ride_id: "r1", user_id: "u5", status: "pending" },
  { id: "rr3", ride_id: "r1", user_id: "u7", status: "rejected" },
];
