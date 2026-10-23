-- 정산 생성(N빵): 주최자·이벤트 종료·중복 생성 검사 후 1인당 금액을 10원 단위로 올림 계산하고,
-- 생성 시점의 going 명단으로 settlement_payments를 고정한다.
create function public.create_settlement(
  p_event_id uuid,
  p_total_amount integer,
  p_bank_info text
)
returns setof public.settlements
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.events%rowtype;
  v_going_count integer;
  v_per_person integer;
  v_settlement_id uuid;
begin
  select * into v_event from public.events where id = p_event_id for update;
  if not found then
    raise exception 'event_not_found';
  end if;

  if not public.is_group_host(v_event.group_id) then
    raise exception 'not_host';
  end if;

  if v_event.status = 'cancelled' then
    raise exception 'event_cancelled';
  end if;

  if v_event.starts_at > now() then
    raise exception 'event_not_ended';
  end if;

  if exists (select 1 from public.settlements where event_id = p_event_id) then
    raise exception 'settlement_exists';
  end if;

  if p_total_amount <= 0 or p_total_amount > 2000000000 then
    raise exception 'invalid_amount';
  end if;

  if char_length(trim(p_bank_info)) = 0 or char_length(p_bank_info) > 100 then
    raise exception 'invalid_bank_info';
  end if;

  select count(*) into v_going_count from public.rsvps
    where event_id = p_event_id and status = 'going';
  if v_going_count = 0 then
    raise exception 'no_attendees';
  end if;

  v_per_person := ceil(p_total_amount::numeric / v_going_count / 10) * 10;

  insert into public.settlements (event_id, total_amount, per_person, bank_info, created_by)
  values (p_event_id, p_total_amount, v_per_person, p_bank_info, (select auth.uid()))
  returning id into v_settlement_id;

  insert into public.settlement_payments (settlement_id, user_id)
  select v_settlement_id, user_id from public.rsvps
  where event_id = p_event_id and status = 'going';

  return query select * from public.settlements where id = v_settlement_id;
end;
$$;

revoke execute on function public.create_settlement(uuid, integer, text) from public, anon;
grant execute on function public.create_settlement(uuid, integer, text) to authenticated;
