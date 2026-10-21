# Task 006: M1 데이터베이스 스키마와 RLS 마이그레이션

## 개요

모임·멤버·이벤트·RSVP 테이블과 RLS, 마지막 주최자 보호 트리거를 만든다.

- 기능: F002~F009 (데이터 기반)
- 선행: 없음

## 관련 파일

- `supabase/migrations/20261021121055_m1_groups_events_schema.sql`
- `supabase/migrations/20261021121112_m1_groups_events_schema_fix.sql`

## 수락 기준

- [x] `groups`, `group_members`, `events`, `rsvps` 생성(제약 조건 포함, `attended`는 Phase 5에서 추가)
- [x] RLS 헬퍼 `is_group_member`/`is_group_host`(security definer, `set search_path=''`)
- [x] 4개 테이블 RLS 활성화, 마지막 주최자 보호 트리거
- [x] `get_advisors(security, performance)` 경고 0건(의도된 설계 외)
- [x] 비멤버 계정으로 타 모임 행 조회 0건을 SQL로 확인(세션 JWT claims를 시뮬레이션해 검증)

## 구현 메모

- `profiles` select 정책은 확장하지 않고(이메일 노출 위험), 멤버 이름·아바타 조회는 `get_group_profiles(gid)` RPC로 분리했다.
- `groups`는 일반 insert 정책을 두지 않고 Task 009의 `create_group` RPC로만 생성되도록 해 "생성자 host 자동 등록"의 원자성을 DB에서 보장했다.
- `protect_last_host()`는 트리거 전용이라 모든 역할의 EXECUTE 권한을 회수했다(안 그러면 advisor가 "공개 RPC로 호출 가능"이라고 경고함).
- 외래키 인덱스 누락(`groups.owner_id`, `rsvps.user_id`)을 fix 마이그레이션에서 보강했다.
