-- M2: 정산(N빵) 테이블과 RLS. 쓰기는 Task 019/021의 RPC로만 허용하므로
-- insert/update/delete 정책은 두지 않는다(groups 테이블과 동일한 관례).

create table public.settlements (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null unique references public.events (id) on delete cascade,
  total_amount integer not null check (total_amount > 0 and total_amount <= 2000000000),
  per_person integer not null check (per_person > 0),
  bank_info text not null check (char_length(bank_info) between 1 and 100),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);
comment on table public.settlements is '이벤트별 1건 정산(N빵 금액·계좌)';

create table public.settlement_payments (
  settlement_id uuid not null references public.settlements (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  paid boolean not null default false,
  paid_claimed_at timestamptz,
  primary key (settlement_id, user_id)
);
comment on table public.settlement_payments is '정산 대상자별 납부 상태(참여자: paid_claimed_at만, 주최자: paid만 — RPC로 강제)';

create index settlement_payments_user_id_idx on public.settlement_payments (user_id);

alter table public.settlements enable row level security;
alter table public.settlement_payments enable row level security;

create policy "settlements_select_member" on public.settlements
  for select to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = settlements.event_id and public.is_group_member(e.group_id)
    )
  );

create policy "settlement_payments_select_member" on public.settlement_payments
  for select to authenticated
  using (
    exists (
      select 1 from public.settlements s
      join public.events e on e.id = s.event_id
      where s.id = settlement_payments.settlement_id and public.is_group_member(e.group_id)
    )
  );
