-- pg_net이 public 스키마에 설치되어 린터 경고가 발생해 extensions 스키마로 이동한다.
drop extension if exists pg_net;
create extension if not exists pg_net with schema extensions;
