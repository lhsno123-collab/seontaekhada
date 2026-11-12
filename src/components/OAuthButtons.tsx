import { useState } from "react";
import { supabase } from "@/lib/supabase";

/** 성공하면 제공자 로그인 페이지로 바로 이동하므로, 이 화면에서 더 할 일은 없다. */
export default function OAuthButtons({ redirectTo }: { redirectTo: string }) {
  const [loadingProvider, setLoadingProvider] = useState<"google" | "kakao" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(provider: "google" | "kakao") {
    setError(null);
    setLoadingProvider(provider);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}${redirectTo}` },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoadingProvider(null);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => handle("google")}
        disabled={loadingProvider !== null}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-line py-3 text-sm transition-colors hover:bg-neutral-50 disabled:opacity-40"
      >
        <span className="h-2 w-2 rounded-full bg-[#4285F4]" aria-hidden />
        {loadingProvider === "google" ? "이동 중…" : "Google로 계속하기"}
      </button>
      <button
        type="button"
        onClick={() => handle("kakao")}
        disabled={loadingProvider !== null}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-line py-3 text-sm transition-colors hover:bg-neutral-50 disabled:opacity-40"
      >
        <span className="h-2 w-2 rounded-full bg-[#FEE500]" aria-hidden />
        {loadingProvider === "kakao" ? "이동 중…" : "카카오로 계속하기"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
