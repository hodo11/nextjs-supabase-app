# Task 012: 이벤트 생성·수정·취소와 목록 구현

## 개요

이벤트 생성·수정·취소를 실제 Supabase 쓰기로 교체한다.

- 기능: F005 (P0)
- 선행: Task 009

## 관련 파일

- `lib/actions/events.ts`(`createEvent`, `updateEvent`, `cancelEvent`, `maybeSendNotice`)
- `lib/dummy/queries.ts`(`getEventsByGroup`, `getEvent` 실쿼리로 교체, 실시각 `new Date()` 사용)
- `components/event/event-form.tsx`
- `app/(app)/groups/[groupId]/events/new/page.tsx`, `app/(app)/events/[eventId]/edit/page.tsx`

## 수락 기준

- [x] 마감 ≥ 시작이면 저장 실패(DB `events_deadline_before_start` 제약 + Zod 양쪽)
- [x] `events` insert/update는 RLS `is_group_host`로만 허용
- [x] 취소(`status='cancelled'`)는 RSVP를 차단하지는 않지만(그 차단은 Task 013 RPC 몫) 목록에 "취소됨" 표시

## 구현 메모

- `notify_by_email`은 저장과 동시에 Task 014의 `maybeSendNotice`를 호출하도록 연결했다(공지 메일 발송은 최선 노력, 실패해도 이벤트 저장은 유지).
- 이벤트 단계(phase) 계산을 더미 고정 시계(`getNow()`) 대신 실제 `new Date()`로 바꿨다(실데이터는 실제 현재 시각 기준이어야 함).
