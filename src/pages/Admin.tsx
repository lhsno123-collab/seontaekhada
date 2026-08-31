import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import PollManager from "@/components/admin/PollManager";
import SuggestionManager from "@/components/admin/SuggestionManager";
import AdManager from "@/components/admin/AdManager";

const TABS = [
  { key: "polls", label: "주제" },
  { key: "suggestions", label: "주제추천" },
  { key: "ads", label: "광고판" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function Admin() {
  const { user, loading } = useAuth();
  const { isAdmin, checking } = useIsAdmin();
  const [tab, setTab] = useState<TabKey>("polls");
  const [error, setError] = useState<string | null>(null);

  if (loading || checking) return null;
  if (!user) return <Navigate to="/login" state={{ from: "/admin" }} replace />;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-content px-6 py-32 text-center text-muted">
        관리자만 볼 수 있는 화면입니다.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content px-6 py-16">
      <p className="mb-6 text-xs tracking-[0.25em] text-muted">관리자</p>
      <h1 className="mb-10 text-3xl font-semibold tracking-tight">운영 화면</h1>

      <div className="mb-12 flex gap-6 border-b border-line">
        {TABS.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={[
              "-mb-px border-b-2 pb-3 text-sm transition-colors",
              tab === item.key
                ? "border-ink text-ink"
                : "border-transparent text-muted hover:text-ink",
            ].join(" ")}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-8 flex items-start justify-between gap-4 rounded-xl border border-line px-5 py-4 text-sm">
          <span className="text-red-600">{error}</span>
          <button onClick={() => setError(null)} className="shrink-0 text-xs text-muted">
            닫기
          </button>
        </div>
      )}

      {tab === "polls" && <PollManager onError={setError} />}
      {tab === "suggestions" && <SuggestionManager onError={setError} />}
      {tab === "ads" && <AdManager onError={setError} />}
    </div>
  );
}
