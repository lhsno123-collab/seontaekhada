import { configError, isSupabaseConfigured } from "@/lib/supabase";

/** 환경변수가 잘못됐거나 아직 없을 때 화면 위에 이유를 띄운다. */
export default function ConfigBanner() {
  if (configError) {
    return (
      <div className="border-b border-line bg-red-50">
        <div className="mx-auto max-w-content px-6 py-3 text-xs text-red-700">
          <strong className="font-semibold">설정 오류 </strong>
          {configError}
        </div>
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="border-b border-line bg-neutral-50">
        <div className="mx-auto max-w-content px-6 py-3 text-xs text-muted">
          데모 모드입니다. 화면과 동작을 미리 볼 수 있고, 투표는 이 브라우저에만 남습니다.
          실제 데이터를 쓰려면 <code>VITE_SUPABASE_URL</code> 과{" "}
          <code>VITE_SUPABASE_ANON_KEY</code> 를 설정해 주세요.
        </div>
      </div>
    );
  }

  return null;
}
