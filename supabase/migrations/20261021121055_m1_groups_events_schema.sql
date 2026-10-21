-- M1: 모임·멤버·이벤트·RSVP 스키마와 RLS
-- attended 컬럼은 M4(Phase 5)에서 추가한다.

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 50),
  invite_code text not null unique,
  owner_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.groups is '모임(수영/헬스/친구 모임 등)';

create table public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('host', 'member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

comment on table public.group_members is '모임 멤버와 역할(host/member)';

create table public.events (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  starts_at timestamptz not null,
  location text check (char_length(location) <= 100),
  capacity integer check (capacity > 0),
  rsvp_deadline timestamptz not null,
  notice text check (char_length(notice) <= 1000),
  status text not null default 'active' check (status in ('active', 'cancelled')),
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_deadline_before_start check (rsvp_deadline < starts_at)
);

comment on table public.events is '모임 이벤트(정원·마감·공지 포함)';

create table public.rsvps (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null check (status in ('going', 'not_going', 'maybe', 'waitlisted')),
  responded_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

comment on table public.rsvps is '이벤트 참석 응답(정원 초과 시 waitlisted)';

-- updated_at 자동 갱신 (profiles 마이그레이션의 공용 함수 재사용)
create trigger groups_set_updated_at
  before update on public.groups
  for each row execute function public.set_updated_at();

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- RLS 헬퍼: 같은 모임 멤버/주최자 여부 (security definer로 group_members 자기참조 재귀 회피)
create function public.is_group_member(gid uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = (select auth.uid())
  );
$$;

create function public.is_group_host(gid uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = (select auth.uid()) and role = 'host'
  );
$$;

revoke execute on function public.is_group_member(uuid) from public, anon;
revoke execute on function public.is_group_host(uuid) from public, anon;
grant execute on function public.is_group_member(uuid) to authenticated;
grant execute on function public.is_group_host(uuid) to authenticated;

-- 마지막 주최자 보호 트리거
create function public.protect_last_host()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_remaining_hosts integer;
begin
  if tg_op = 'DELETE' then
    if old.role = 'host' then
      select count(*) into v_remaining_hosts
      from public.group_members
      where group_id = old.group_id and role = 'host' and user_id <> old.user_id;
      if v_remaining_hosts = 0 then
        raise exception 'last_host_protected';
      end if;
    end if;
    return old;
  end if;

  if tg_op = 'UPDATE' then
    if old.role = 'host' and new.role <> 'host' then
      select count(*) into v_remaining_hosts
      from public.group_members
      where group_id = old.group_id and role = 'host' and user_id <> old.user_id;
      if v_remaining_hosts = 0 then
        raise exception 'last_host_protected';
      end if;
    end if;
    return new;
  end if;

  return null;
end;
$$;

create trigger group_members_protect_last_host
  before update or delete on public.group_members
  for each row execute function public.protect_last_host();

-- 같은 모임 멤버의 공개 프로필(이름·아바타만, 이메일 제외) 조회용 RPC
create function public.get_group_profiles(gid uuid)
returns table (id uuid, display_name text, avatar_url text)
language sql
security definer
stable
set search_path = ''
as $$
  select p.id, p.full_name as display_name, p.avatar_url
  from public.profiles p
  join public.group_members gm on gm.user_id = p.id
  where gm.group_id = gid and public.is_group_member(gid);
$$;

revoke execute on function public.get_group_profiles(uuid) from public, anon;
grant execute on function public.get_group_profiles(uuid) to authenticated;

-- 인덱스
create index group_members_user_id_idx on public.group_members (user_id);
create index events_group_id_starts_at_idx on public.events (group_id, starts_at);
create index rsvps_event_id_status_responded_at_idx on public.rsvps (event_id, status, responded_at);

-- RLS 활성화
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.events enable row level security;
alter table public.rsvps enable row level security;

-- groups: 생성은 Task 009의 create_group RPC(security definer)로만 허용, 일반 insert 정책 없음
create policy "groups_select_member" on public.groups
  for select to authenticated
  using (public.is_group_member(id));

create policy "groups_update_host" on public.groups
  for update to authenticated
  using (public.is_group_host(id))
  with check (public.is_group_host(id));

-- group_members
create policy "group_members_select_member" on public.group_members
  for select to authenticated
  using (public.is_group_member(group_id));

create policy "group_members_update_host" on public.group_members
  for update to authenticated
  using (public.is_group_host(group_id))
  with check (public.is_group_host(group_id));

create policy "group_members_delete_host_or_self" on public.group_members
  for delete to authenticated
  using (public.is_group_host(group_id) or user_id = (select auth.uid()));

-- events: 조회는 멤버, 생성·수정은 주최자
create policy "events_select_member" on public.events
  for select to authenticated
  using (public.is_group_member(group_id));

create policy "events_insert_host" on public.events
  for insert to authenticated
  with check (public.is_group_host(group_id));

create policy "events_update_host" on public.events
  for update to authenticated
  using (public.is_group_host(group_id))
  with check (public.is_group_host(group_id));

-- rsvps: 조회는 이벤트가 속한 모임의 멤버, 쓰기는 본인 또는 주최자(수동 변경 대비)
-- 정원·대기열 계산은 반드시 Task 013의 set_rsvp RPC(security definer, 행 잠금) 안에서만 수행한다.
create policy "rsvps_select_member" on public.rsvps
  for select to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = event_id and public.is_group_member(e.group_id)
    )
  );

create policy "rsvps_insert_self_or_host" on public.rsvps
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    or exists (select 1 from public.events e where e.id = event_id and public.is_group_host(e.group_id))
  );

create policy "rsvps_update_self_or_host" on public.rsvps
  for update to authenticated
  using (
    user_id = (select auth.uid())
    or exists (select 1 from public.events e where e.id = event_id and public.is_group_host(e.group_id))
  )
  with check (
    user_id = (select auth.uid())
    or exists (select 1 from public.events e where e.id = event_id and public.is_group_host(e.group_id))
  );
