-- 비로그인 사용자도 호출 가능한 초대 미리보기(이름·멤버 수만 반환, 다른 정보 노출 없음)
create function public.get_group_preview(code text)
returns table (id uuid, name text, member_count bigint)
language sql
security definer
stable
set search_path = ''
as $$
  select g.id, g.name, count(gm.user_id) as member_count
  from public.groups g
  left join public.group_members gm on gm.group_id = g.id
  where g.invite_code = code
  group by g.id, g.name;
$$;

grant execute on function public.get_group_preview(text) to anon, authenticated;

-- 초대 코드로 가입(이미 멤버면 가입 생략)
create function public.join_group_by_code(code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_group_id uuid;
begin
  select id into v_group_id from public.groups where invite_code = code;
  if v_group_id is null then
    raise exception 'invalid_code';
  end if;

  if exists (
    select 1 from public.group_members
    where group_id = v_group_id and user_id = (select auth.uid())
  ) then
    return v_group_id;
  end if;

  insert into public.group_members (group_id, user_id, role)
  values (v_group_id, (select auth.uid()), 'member');

  return v_group_id;
end;
$$;

revoke execute on function public.join_group_by_code(text) from public, anon;
grant execute on function public.join_group_by_code(text) to authenticated;

-- 초대 코드 재발급(주최자만, 충돌 시 재시도)
create function public.reissue_invite_code(gid uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code text;
  v_attempt integer := 0;
begin
  if not public.is_group_host(gid) then
    raise exception 'not_authorized';
  end if;

  loop
    v_attempt := v_attempt + 1;
    v_code := public.generate_invite_code();
    begin
      update public.groups set invite_code = v_code where id = gid;
      exit;
    exception when unique_violation then
      if v_attempt >= 5 then
        raise exception 'invite_code_generation_failed';
      end if;
    end;
  end loop;

  return v_code;
end;
$$;

revoke execute on function public.reissue_invite_code(uuid) from public, anon;
grant execute on function public.reissue_invite_code(uuid) to authenticated;
