-- 투표는 한 번 하면 바꿀 수 없다.
-- 지금까지는 UPDATE 정책이 있어 API를 직접 호출하면 선택을 바꿀 수 있었다.
-- 정책을 없애 DB 단에서부터 막는다 (화면에서만 막으면 요청을 직접 보내 우회할 수 있다).
drop policy if exists "change own vote" on public.votes;
