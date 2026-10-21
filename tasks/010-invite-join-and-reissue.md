# Task 010: 초대 링크 가입과 코드 재발급 구현

## 개요

초대 수락 화면을 실제 흐름으로 교체한다. 비로그인 상태에서도 모임 이름을 미리 보여준다(사용자 확인된 결정).

- 기능: F001 (P0), F003 (P0)
- 선행: Task 008, 009

## 관련 파일

- `supabase/migrations/20261021122310_m1_invite_rpcs.sql`(`get_group_preview`, `join_group_by_code`, `reissue_invite_code`)
- `lib/actions/invites.ts`(`joinGroupByCode`, `reissueInviteCode`)
- `lib/dummy/queries.ts`(`lookupInvite` 실쿼리로 교체)
- `app/invite/[code]/page.tsx`(`generateMetadata` 추가)
- `components/group/{invite-accept-button,invite-link-card}.tsx`

## 수락 기준

- [x] 유효 코드로 member 가입, 재가입 시 중복 행 없음(RPC가 이미 멤버면 가입 생략)
- [x] 재발급된 이전 코드는 무효 안내 → 홈 이동
- [x] 비로그인 상태에서도 모임 이름·멤버 수 미리보기 표시

## 구현 메모

- `get_group_preview`는 `anon`에게도 EXECUTE를 허용한다(사용자 확인: 로그인 전 미리보기 유지). 이름·멤버 수만 반환하고 다른 컬럼은 노출하지 않는다.
- `reissue_invite_code`는 `is_group_host` 체크를 RPC 내부에서 하고, 코드 충돌 시 재시도한다.
