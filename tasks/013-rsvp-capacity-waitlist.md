# Task 013: RSVP와 정원·대기자 처리 구현

## 개요

RSVP 응답·정원 초과 대기열·대기자 자동 승급을 `set_rsvp` RPC로 구현한다. `lib/dummy/preview.ts` 사용을 이 Task에서 최종 정리한다(M1 라우트 기준).

- 기능: F007 (P0), F008 (P1)
- 선행: Task 012

## 관련 파일

- `supabase/migrations/20261021123009_m1_set_rsvp_rpc.sql`
- `lib/actions/rsvps.ts`(`setRsvp`)
- `lib/dummy/queries.ts`(`getRsvps`, `getProfile` 실쿼리로 교체)
- `components/event/rsvp-panel.tsx`
- `app/(app)/events/[eventId]/page.tsx`

## 수락 기준

- [x] 정원 N일 때 N+1번째 `going` 응답은 `waitlisted`(SQL로 재현 확인)
- [x] 참석 취소 시 가장 먼저 응답한 대기자가 자동으로 `going` 승급(SQL로 재현 확인)
- [x] 비멤버의 RPC 호출은 `not_member`로 거부(SQL로 재현 확인)
- [x] 마감 후 참여자 응답 거부, 주최자는 가능

## 구현 메모

- `set_rsvp`는 `events` 행을 `for update`로 잠가 동시 응답 경합을 막고, 호출자의 최신 전체 RSVP 목록을 반환해 클라이언트가 그대로 교체하도록 했다(클라이언트 재계산 로직 제거).
- M1 라우트(`events/[eventId]`, `invite/[code]`, `groups/*`, `home`)는 모두 실제 인증으로 전환 완료. `lib/dummy/preview.ts`는 M2(정산)·M4(출석) 더미 화면이 아직 참조하므로 파일 자체는 남겨두고, Task 017에서 M1 범위 내 잔존 참조가 없음을 grep으로 확인했다.
