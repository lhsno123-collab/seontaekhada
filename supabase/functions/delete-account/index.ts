// Supabase Edge Function: delete-account
//
// anon key로는 auth.users 레코드를 지울 수 없다(관리자 권한 필요). 이 함수는
// service_role 키로 supabase.auth.admin.deleteUser()를 호출해 실제로 계정을 지운다.
// auth.users를 지우면 votes / topic_suggestions / admins가 전부 ON DELETE CASCADE로
// 함께 삭제되므로(001_init.sql, 003_admin.sql) 이 함수 하나로 탈퇴가 끝난다.
//
// Supabase 대시보드 Edge Functions 화면에서 파일 하나만 붙여넣어 배포할 수 있도록
// cors 헤더를 여기 안에 그대로 넣어뒀다(다른 파일을 import하지 않는다).
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY는 Supabase가 모든 Edge Function에 자동으로 주입한다.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "로그인이 필요합니다." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 요청을 보낸 사람이 누구인지는 토큰으로만 확인한다.
    // 본인 것 말고는 지울 수 없다 — user_id를 요청 body로 받지 않는다.
    const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: callerData, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !callerData?.user) {
      return new Response(JSON.stringify({ error: "인증 정보가 유효하지 않습니다." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(callerData.user.id);
    if (deleteError) {
      console.error("[delete-account] 삭제 실패:", deleteError.message);
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[delete-account] 처리 실패:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "알 수 없는 오류" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
