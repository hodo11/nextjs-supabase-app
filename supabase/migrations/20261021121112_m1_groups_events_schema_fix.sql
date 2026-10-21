-- protect_last_host는 트리거 전용 함수이므로 RPC로 직접 호출되지 않도록 실행 권한을 모두 회수한다.
revoke execute on function public.protect_last_host() from public, anon, authenticated;

-- 누락된 외래키 인덱스 보강
create index groups_owner_id_idx on public.groups (owner_id);
create index rsvps_user_id_idx on public.rsvps (user_id);
