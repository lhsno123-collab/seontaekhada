import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchProfile, saveProfile } from "@/lib/profile";
import ProfileFields from "@/components/ProfileFields";
import type { AgeGroup, PoliticalStance } from "@/lib/types";

// 이 경로들은 로그인 상태라도 프로필 없이 그냥 보여준다 — 약관 등 읽기 전용 정보,
// 그리고 비밀번호 재설정(복구 세션 중에 프로필 질문으로 막히면 안 됨).
const EXEMPT_PATHS = ["/terms", "/privacy", "/reset-password"];

/**
 * 이메일 가입은 가입 폼에서 프로필을 같이 받지만, 구글/카카오로 로그인한 사람은
 * 그 폼을 거치지 않는다. 로그인은 했는데 프로필(연령대)이 없는 사람에게
 * 사이트 어디서든 한 번 물어보고, 저장되면 원래 보려던 화면을 그대로 보여준다.
 */
export default function ProfileGate({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, signOut } = useAuth();
  const location = useLocation();

  const [checked, setChecked] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);

  const [ageGroup, setAgeGroup] = useState<AgeGroup | "">("");
  const [consented, setConsented] = useState(false);
  const [politicalStance, setPoliticalStance] = useState<PoliticalStance | "">("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !isSupabaseConfigured) {
      setNeedsProfile(false);
      setChecked(true);
      return;
    }

    let cancelled = false;
    setChecked(false);

    fetchProfile(user.id)
      .then((profile) => {
        if (!cancelled) {
          setNeedsProfile(!profile);
          setChecked(true);
        }
      })
      .catch(() => {
        // 확인 자체가 실패해도 서비스를 막지는 않는다 (네트워크 문제 등).
        if (!cancelled) {
          setNeedsProfile(false);
          setChecked(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  if (authLoading || !checked) return null;
  if (!needsProfile || EXEMPT_PATHS.includes(location.pathname)) return <>{children}</>;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!ageGroup || saving || (consented && !politicalStance)) return;

    setSaving(true);
    setError(null);
    try {
      await saveProfile(user!.id, {
        ageGroup,
        politicalStance: politicalStance || null,
        consentedToStance: consented && !!politicalStance,
      });
      setNeedsProfile(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-content px-6 py-16 md:py-24">
      <p className="mb-6 text-xs tracking-[0.25em] text-muted">마지막 단계</p>
      <h1 className="mb-3 text-3xl font-semibold tracking-tight">프로필을 완성해주세요</h1>
      <p className="mb-12 text-muted">딱 한 번만 입력하면 됩니다.</p>

      <form onSubmit={handleSubmit} className="max-w-sm space-y-8">
        <ProfileFields
          ageGroup={ageGroup}
          onAgeGroupChange={setAgeGroup}
          consented={consented}
          onConsentedChange={setConsented}
          politicalStance={politicalStance}
          onPoliticalStanceChange={setPoliticalStance}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-6">
          <button
            type="submit"
            disabled={!ageGroup || saving || (consented && !politicalStance)}
            className="rounded-full bg-ink px-8 py-3 text-sm text-white transition-opacity disabled:opacity-30"
          >
            {saving ? "저장 중…" : "계속하기"}
          </button>
          <button
            type="button"
            onClick={() => void signOut()}
            className="text-xs text-muted hover:text-ink"
          >
            로그아웃
          </button>
        </div>
      </form>
    </div>
  );
}
