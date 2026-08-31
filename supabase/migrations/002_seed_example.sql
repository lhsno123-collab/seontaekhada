-- 첫 주제 예시. 그대로 실행하면 바로 투표 화면이 뜬다.
-- (운영에서는 이 파일 대신 관리자 화면이나 SQL 편집기로 주제를 올린다)
with new_poll as (
  insert into public.polls (question, subtitle, status)
  values ('주 4일제, 도입해야 할까요?', '오늘의 주제', 'open')
  returning id
)
insert into public.poll_options (poll_id, label, position)
select new_poll.id, label, position
from new_poll,
     (values ('도입해야 한다', 0), ('지금은 이르다', 1), ('반대한다', 2)) as v(label, position);
