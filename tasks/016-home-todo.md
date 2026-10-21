# Task 016: 홈 "내 할 일" 요약 구현

## 개요

홈의 미응답 이벤트 목록을 실제 데이터로 교체한다. 미납 정산 섹션은 Phase 3까지 더미로 유지한다.

- 기능: F010 (P1)
- 선행: Task 013

## 관련 파일

- `lib/dummy/queries.ts`(`getPendingRsvpTasks` 실쿼리로 교체, `getUnpaidSettlementTasks`는 유지)
- `app/(app)/home/page.tsx`

## 수락 기준

- [x] 내가 속한 모임의 `active`·시작 전·응답 마감 전 이벤트 중 내가 아직 응답하지 않은 것만 마감 임박 순으로 표시
- [x] 응답하면 목록에서 사라짐(RPC가 upsert하므로 재조회 시 자연히 반영)
- [x] 취소된 이벤트와 지난 이벤트는 제외

## 구현 메모

- `lib/dummy/queries.ts` 파일 상단에 "M1 함수는 교체 완료, M2~M4 함수는 Phase 3~5에서 교체 예정" 주석을 남겨 과도기 상태를 명시했다.
