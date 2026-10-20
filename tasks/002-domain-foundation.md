# Task 002: 도메인 타입·검증 스키마·공통 컴포넌트·더미 데이터 준비

## 개요

Phase 1 화면이 공통으로 쓰는 타입, 검증 스키마, 포맷 유틸, 공통 컴포넌트, 더미 데이터를 준비한다.

- 기능 ID: 전 기능 공통
- 선행 Task: 없음

## 관련 파일

- `lib/types/domain.ts`: PRD 6장 컬럼명과 같은 수기 타입
- `lib/validations/{group,event,rsvp,settlement,ride}.ts`: Zod 스키마
- `lib/format.ts`: Asia/Seoul 날짜·시간, 원 단위 콤마, 출석률
- `lib/event-state.ts`: 이벤트 단계(예정/응답 마감/지난/취소됨) 계산
- `lib/dummy/{clock,data,queries,preview}.ts`: 고정 시각, 더미 데이터, async 조회 함수, `?as=host|member` 해석
- `components/{empty-state,confirm-dialog}.tsx`
- `components/group/{group-card,member-avatar-list}.tsx`
- `components/event/{event-card,event-status-badge,rsvp-summary-bar}.tsx`
- `components/ui/*`: shadcn 추가(form, dialog, tabs, avatar, textarea, select, sonner, skeleton, alert-dialog, table)

## 수락 기준

- [x] `npm run typecheck` 통과
- [x] 공통 컴포넌트가 도메인 타입 props만 받고 `lib/dummy`를 import하지 않는다
- [ ] 375px 모바일 폭과 데스크톱에서 깨지지 않는다 (Task 003 화면에서 확인)
- [ ] 다크 모드에서 읽을 수 있다 (Task 003 화면에서 확인)

## 구현 메모

- 더미 기준 시각은 2026-10-20 12:00 KST로 고정한다(`lib/dummy/clock.ts`).
- 보기 전환: 주최자 보기 = `u1`(g1·g2 주최자), 참여자 보기 = `u2`(g1·g2 멤버). 초대 코드 `swim-2026`(이미 멤버), `hike-2026`(정상), 그 외(무효).
- `@hookform/resolvers`는 v6이 `effect` peer 의존성 충돌을 일으켜 v5로 설치했다.
- shadcn CLI가 `cn`을 `"cn"` 패키지로 잘못 해석해 설치하므로 import를 `@/lib/utils`로 고치고 패키지는 제거했다.
- 숫자 입력(정원·금액·좌석)은 폼에서 문자열로 다루고 저장 시 변환한다.
