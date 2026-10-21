# Task 017: M1 통합 테스트와 RLS 점검 및 배포

## 개요

Phase 2(M1) 전체를 검증하고 배포를 준비한다.

- 기능: F001~F010
- 선행: Task 008~016

## 관련 파일

- 전체 M1 코드(해당 없음, 검증 작업 위주)

## 수락 기준

- [x] `npm run check`(lint+typecheck+format) 통과
- [x] `npm run build`(프로덕션 빌드) 통과 — `/auth/login`이 Cache Components 규칙(Suspense 경계 밖 `searchParams` 접근) 위반으로 실패한 것을 Task 008 패턴에 맞춰 수정
- [x] `mcp__supabase__get_advisors`(security, performance) 최종 점검 — 의도된 RPC 노출/INFO 수준 외 경고 없음
- [x] SQL 세션 시뮬레이션(JWT claims 주입)으로 RLS·RPC 수동 테스트: 비멤버 select 0건, 비호스트 insert 거부, `set_rsvp` 정원/대기열/승급, 마지막 호스트 보호, `get_group_member_emails` 호스트 전용 — 전부 통과(테스트 데이터는 정리함)
- [x] `grep lib/dummy/(data|preview)` 결과 M1 라우트 0건(M2 정산·M4 출석 페이지만 남음, 범위 밖)
- [ ] Playwright MCP 전체 플로우(주최자 로그인 → 모임 생성 → 이벤트 생성+공지 메일 → 초대 공유 → 참여자 로그인 복귀·자동 가입 → RSVP) — **미실행**: 실제 로그인 가능한 테스트 계정(Google/이메일)이 필요해 사람이 함께 진행해야 함
- [ ] Vercel 배포 — **미실행**: 배포 자체가 외부 서비스에 영향을 주는 작업이라 사용자 승인 필요
- [ ] Resend 도메인 SPF/DKIM 설정 — **미실행**: Resend API 키가 아직 없음(Task 014에서 확인됨)
- [ ] `cron_app_base_url` vault 비밀값을 실제 배포 URL로 교체 — 배포 후 진행

## 구현 메모

- DB·RLS·RPC·Server Action 레벨 검증은 Supabase MCP SQL 세션 시뮬레이션으로 전부 완료했다(실제 브라우저 없이도 재현 가능한 범위).
- 남은 미실행 항목은 전부 "실제 계정으로 로그인" 또는 "외부 서비스(Vercel/Resend)에 실제 반영"이 필요해 사람의 승인·참여가 필요한 작업이다.
