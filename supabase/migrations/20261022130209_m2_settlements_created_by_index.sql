-- settlements.created_by 외래키 인덱스 누락 보강 (groups.owner_id, rsvps.user_id와 동일한 관례).
create index settlements_created_by_idx on public.settlements (created_by);
