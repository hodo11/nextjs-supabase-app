# Task 001: 앱 셸과 전체 라우트 골격 구축

## 개요

로그인 후 영역의 공통 레이아웃과 M1~M4 전 페이지의 빈 라우트를 만든다. 미구현 화면은 "준비 중"으로 표시한다.

- 기능 ID: 전 기능 공통 (F001~F017 페이지 자리 확보)
- 선행 Task: 없음

## 관련 파일

- `app/(app)/layout.tsx` (생성): 헤더(홈, 모임 목록, 테마 전환, 로그아웃) + 모바일 하단 내비게이션
- `components/app-nav.tsx` (생성): 상단/하단 내비게이션
- `components/page-placeholder.tsx` (생성): 준비 중 표시
- `app/(app)/**/page.tsx` (생성): 10개 라우트
- `app/invite/[code]/` (생성): 헤더 없는 별도 레이아웃
- `app/(app)/{loading,not-found,error}.tsx`, `app/invite/{loading,not-found,error}.tsx` (생성)
- `components/logout-button.tsx` (수정): 한글 라벨
- `app/protected/page.tsx` (수정): `/home` 임시 링크

## 수락 기준

- [ ] 헤더/하단 내비게이션으로 홈과 모임 목록에 이동할 수 있다
- [ ] 매핑 표의 모든 라우트가 열린다
- [ ] 초대 페이지는 헤더 없이 중앙 정렬로 표시된다
- [ ] 비로그인 상태에서 프로토타입 라우트가 `/auth/login`으로 리디렉션된다
- [ ] `npm run check`, `npm run build` 통과

## 구현 단계

- [x] 공통 레이아웃과 내비게이션
- [x] 라우트별 `page.tsx` (동적 `params`는 `await`)
- [x] 초대 레이아웃 분리
- [x] loading / not-found / error 골격
- [x] `/protected`에 `/home` 링크
- [ ] check, build 검증
