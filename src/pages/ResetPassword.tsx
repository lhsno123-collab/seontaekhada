import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { changePassword } from "@/lib/account";

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

/**
 * 메일의 재설정 링크를 누르면 이 화면으로 온다. Supabase가 URL의 토큰을
 * 세션으로 바꿔주면서 PASSWORD_RECOVERY 이벤트를 보내는데, 그걸 받아야만
 * 새 비밀번호를 실제로 저장할 수 있다 — 그 전에는 눌러도 세션이 없다.
 */
export default function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });

    // 이미 세션 교환이 끝난 뒤 이 컴포넌트가 마운트됐을 수도 있으니 한 번 더 확인한다.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (saving || !PASSWORD_RULE.test(password)) return;

    setSaving(true);
    setError(null);

    try {
      await changePassword(password);
      navigate("/", { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-content px-6 py-32 text-center text-muted">
        링크를 확인하는 중입니다…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content px-6 py-24 md:py-32">
      <h1 className="mb-3 text-3xl font-semibold tracking-tight md:text-4xl">
        새 비밀번호 설정
      </h1>
      <p className="mb-12 text-muted">8자 이상, 영문과 숫자를 함께 넣어주세요.</p>

      <form onSubmit={handleSubmit} className="max-w-sm space-y-8">
        <label className="block">
          <span className="mb-3 block text-xs tracking-wide text-muted">새 비밀번호</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full border-b border-line bg-transparent pb-3 text-lg outline-none transition-colors focus:border-ink"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving || !PASSWORD_RULE.test(password)}
          className="rounded-full bg-ink px-8 py-3 text-sm text-white transition-opacity disabled:opacity-30"
        >
          {saving ? "저장 중…" : "비밀번호 저장"}
        </button>
      </form>
    </div>
  );
}
