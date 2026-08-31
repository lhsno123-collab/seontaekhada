/**
 * Supabase 에서 온 오류를 사람이 읽고 바로 조치할 수 있는 문장으로 바꾼다.
 * 배포된 사이트에서 원인을 스스로 알려주는 게 목적이다.
 */
export function describeError(thrown: unknown): string {
  const raw = thrown instanceof Error ? thrown.message : String(thrown);

  if (/failed to fetch|networkerror|load failed/i.test(raw)) {
    return "Supabase 에 연결하지 못했습니다. VITE_SUPABASE_URL 주소가 맞는지, 프로젝트가 살아 있는지 확인해 주세요.";
  }

  if (/relation .* does not exist|schema cache/i.test(raw)) {
    return "필요한 테이블이 없습니다. SQL Editor 에서 001_init.sql 을 실행했는지 확인해 주세요.";
  }

  if (/invalid api key|jwt|apikey/i.test(raw)) {
    return "API 키가 올바르지 않습니다. VITE_SUPABASE_ANON_KEY 에 anon public 키 전체를 넣었는지 확인해 주세요.";
  }

  return raw;
}
