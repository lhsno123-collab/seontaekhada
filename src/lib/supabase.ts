import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Vercel 환경변수에 값을 붙여넣을 때 앞뒤 공백이나 줄바꿈이 딸려 오는 일이 잦다.
const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/**
 * 설정이 잘못됐을 때 사용자에게 보여줄 이유.
 * null 이면 문제 없음. 값이 아예 없는 경우는 '데모 모드'이므로 오류가 아니다.
 */
export const configError: string | null = describeConfigProblem();

function describeConfigProblem(): string | null {
  if (!url && !anonKey) return null; // 데모 모드

  if (!url) return "VITE_SUPABASE_URL 이 비어 있습니다.";
  if (!anonKey) return "VITE_SUPABASE_ANON_KEY 이 비어 있습니다.";

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return `VITE_SUPABASE_URL 이 올바른 주소가 아닙니다: "${url}" — https:// 로 시작하는 전체 주소여야 합니다.`;
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return `VITE_SUPABASE_URL 의 프로토콜이 잘못되었습니다: "${url}"`;
  }

  if (anonKey.length < 40) {
    return "VITE_SUPABASE_ANON_KEY 가 너무 짧습니다. anon public 키 전체를 넣었는지 확인해 주세요.";
  }

  return null;
}

/** 실제 Supabase 에 연결된 상태인지. false 면 데모 데이터로 동작한다. */
export const isSupabaseConfigured = Boolean(url && anonKey && !configError);

// 설정이 잘못돼도 createClient 가 예외를 던져 앱 전체가 죽지 않도록 안전한 값으로 만든다.
// 화면에는 configError 배너가 대신 뜬다.
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? url! : "https://placeholder.supabase.co",
  isSupabaseConfigured ? anonKey! : "placeholder-anon-key",
  { auth: { persistSession: true, autoRefreshToken: true } }
);
