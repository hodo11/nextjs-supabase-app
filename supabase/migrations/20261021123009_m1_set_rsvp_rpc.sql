-- RSVP 응답 처리: 마감·취소 검사, 정원 초과 시 대기 전환, 참석 취소 시 대기자 자동 승급.
-- 이벤트 행을 잠궈 동시 응답 경합을 막는다.
create function public.set_rsvp(p_event_id uuid, p_status text)
returns setof public.rsvps
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.events%rowtype;
  v_is_host boolean;
  v_final_status text := p_status;
  v_going_count integer;
  v_previous_status text;
  v_promote_user uuid;
begin
  if p_status not in ('going', 'not_going', 'maybe') then
    raise exception 'invalid_status';
  end if;

  select * into v_event from public.events where id = p_event_id for update;
  if not found then
    raise exception 'event_not_found';
  end if;

  if not public.is_group_member(v_event.group_id) then
    raise exception 'not_member';
  end if;

  if v_event.status = 'cancelled' then
    raise exception 'event_cancelled';
  end if;

  v_is_host := public.is_group_host(v_event.group_id);

  if now() > v_event.rsvp_deadline and not v_is_host then
    raise exception 'deadline_passed';
  end if;

  select status into v_previous_status from public.rsvps
    where event_id = p_event_id and user_id = (select auth.uid());

  if p_status = 'going' and v_event.capacity is not null then
    select count(*) into v_going_count from public.rsvps
      where event_id = p_event_id and status = 'going' and user_id <> (select auth.uid());
    if v_going_count >= v_event.capacity then
      v_final_status := 'waitlisted';
    end if;
  end if;

  insert into public.rsvps (event_id, user_id, status, responded_at)
  values (p_event_id, (select auth.uid()), v_final_status, now())
  on conflict (event_id, user_id)
  do update set status = excluded.status, responded_at = excluded.responded_at;

  if v_previous_status = 'going' and v_final_status <> 'going' and v_event.capacity is not null then
    select user_id into v_promote_user from public.rsvps
      where event_id = p_event_id and status = 'waitlisted'
      order by responded_at asc
      limit 1
      for update;
    if v_promote_user is not null then
      update public.rsvps set status = 'going'
      where event_id = p_event_id and user_id = v_promote_user;
    end if;
  end if;

  return query select * from public.rsvps where event_id = p_event_id;
end;
$$;

revoke execute on function public.set_rsvp(uuid, text) from public, anon;
grant execute on function public.set_rsvp(uuid, text) to authenticated;
