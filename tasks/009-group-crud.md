# Task 009: 모임 생성·수정·목록 기능 구현

## 개요

더미 모임 목록·생성·이름 수정을 실제 Supabase 쿼리·Server Action으로 교체한다.

- 기능: F002 (P0)
- 선행: Task 006, 007, 008

## 관련 파일

- `supabase/migrations/20261021121816_m1_create_group_rpc.sql`(`create_group`, `generate_invite_code`)
- `lib/actions/groups.ts`(`createGroup`, `renameGroup`)
- `lib/dummy/queries.ts`(`getMyGroups`, `getGroup`, `getMyRole` 실쿼리로 교체, 시그니처 유지)
- `components/group/{group-form,group-name-editor}.tsx`
- `app/(app)/groups/page.tsx`, `app/(app)/groups/new/page.tsx`, `app/(app)/groups/[groupId]/page.tsx`
- `app/(app)/layout.tsx`, `components/app-nav.tsx`, `components/preview-toggle.tsx`(삭제)

## 수락 기준

- [x] 이름 1~50자만 생성되고, 생성 직후 생성자가 host로 등록되며 초대 코드 발급
- [x] `member` 계정은 이름 수정 UI가 보이지 않고 직접 호출해도 RLS로 거부(RLS 수동 테스트로 확인)
- [x] `member_count`/`upcoming_event_count`는 집계 쿼리 1~2회로 N+1 없이 계산

## 구현 메모

- `create_group` RPC가 `invite_code` 랜덤 생성(충돌 시 최대 5회 재시도) + host 등록을 한 트랜잭션으로 처리.
- 이 Task를 기점으로 `lib/dummy/preview.ts`(`?as=host|member`)의 사용을 전 라우트에서 순차 제거하기 시작했다(헤더의 `PreviewToggle` 제거, `AppNav`의 `?as=` 유지 로직 제거).
