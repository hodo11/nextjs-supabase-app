# Task 011: 멤버 목록과 권한 관리 구현

## 개요

멤버 목록·주최자 지정/해제/제거·본인 탈퇴를 실제 데이터와 Server Action으로 연결한다.

- 기능: F004 (P1)
- 선행: Task 010

## 관련 파일

- `lib/actions/members.ts`(`promoteToHost`, `demoteFromHost`, `removeMember`, `leaveGroup`)
- `lib/dummy/queries.ts`(`getGroupMembers`를 `group_members` + `get_group_profiles` RPC 조인으로 교체)
- `components/group/member-list.tsx`
- `app/(app)/groups/[groupId]/members/page.tsx`

## 수락 기준

- [x] 주최자만 권한 변경 가능, 마지막 주최자는 DB 트리거로 어떤 경로로도 변경 불가(SQL로 재확인)
- [x] 트리거 예외(`last_host_protected`)를 한국어 안내 메시지로 매핑

## 구현 메모

- UI의 마지막 호스트 버튼 비활성화는 Phase 1 로직을 그대로 재사용하고, 실제 방어선은 DB 트리거가 담당한다(이중 방어).
