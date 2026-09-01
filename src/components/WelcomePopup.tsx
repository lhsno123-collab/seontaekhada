import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

function todayKey(): string {
  return `seontaekhada:popup:${new Date().toISOString().slice(0, 10)}`;
}

interface PopupContent {
  title: string;
  body: string;
  linkTo: string;
  linkLabel: string;
}

const DEFAULT_CONTENT: PopupContent = {
  title: "하루 한 주제, 크게 골라보세요",
  body: "선택하다는 통계적 표본을 구성하는 공식 여론조사가 아닌, 참고용 비공식 설문입니다. 투표하면 그 자리에서 실시간 결과를 볼 수 있어요.",
  linkTo: "/",
  linkLabel: "오늘의 주제 보기",
};

/** 오늘 처음 방문했을 때만 뜨는 안내 팝업. 오늘의 광고가 있으면 그걸 보여주고, 없으면 기본 안내문을 보여준다. */
export default function WelcomePopup() {
  const navigate = useNavigate();
  const [content, setContent] = useState<PopupContent | null>(null);

  useEffect(() => {
    if (localStorage.getItem(todayKey())) return;

    let cancelled = false;

    async function load() {
      if (!isSupabaseConfigured) {
        if (!cancelled) setContent(DEFAULT_CONTENT);
        return;
      }

      const { data } = await supabase
        .from("ads")
        .select("title, body, link_url")
        .order("position", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      setContent(
        data
          ? {
              title: data.title,
              body: data.body ?? "",
              linkTo: data.link_url ?? "/board",
              linkLabel: "자세히 보기",
            }
          : DEFAULT_CONTENT
      );
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!content) return null;

  function dismissForToday() {
    localStorage.setItem(todayKey(), "1");
    setContent(null);
  }

  function closeForNow() {
    // '오늘 하루 보지 않기'를 누르지 않으면 새로고침하면 다시 뜬다 — 저장하지 않는다.
    setContent(null);
  }

  const isExternal = content.linkTo.startsWith("http");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 px-4 pb-4 md:items-center md:pb-0"
      onClick={closeForNow}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-[28px] bg-white p-7 shadow-[0_8px_30px_rgba(17,17,17,0.12)]"
      >
        <p className="mb-2 text-xs tracking-[0.2em] text-muted">알림</p>
        <h2 className="mb-3 text-xl font-semibold leading-snug">{content.title}</h2>
        {content.body && (
          <p className="mb-8 text-sm leading-relaxed text-muted">{content.body}</p>
        )}

        <div className="flex items-center justify-between">
          <button onClick={dismissForToday} className="text-xs text-muted hover:text-ink">
            오늘 하루 보지 않기
          </button>
          <button
            onClick={() => {
              closeForNow();
              if (isExternal) window.open(content.linkTo, "_blank", "noopener,noreferrer");
              else navigate(content.linkTo);
            }}
            className="rounded-full bg-ink px-6 py-2.5 text-sm text-white"
          >
            {content.linkLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
