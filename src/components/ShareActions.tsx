import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import ShareCard from "@/components/ShareCard";
import { copyLink, isKakaoConfigured, shareToKakao, toFileSlug } from "@/lib/share";

interface ShareOption {
  label: string;
  votes: number;
  percent: number;
  selected: boolean;
}

interface ShareActionsProps {
  question: string;
  subtitle?: string | null;
  options: ShareOption[];
  total: number;
}

type CopyState = "idle" | "copied" | "error";

export default function ShareActions({ question, subtitle, options, total }: ShareActionsProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSaveImage() {
    if (!cardRef.current || saving) return;
    setSaving(true);
    setError(null);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `${toFileSlug(question)}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      setError("이미지를 만들지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function handleKakao() {
    setError(null);
    try {
      await shareToKakao({
        title: `[선택하다] ${question}`,
        description: "지금 투표하고 실시간 결과를 확인해보세요.",
        url: window.location.origin,
      });
    } catch {
      setError("카카오톡 공유를 열지 못했습니다.");
    }
  }

  async function handleCopyLink() {
    try {
      await copyLink(window.location.origin);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("error");
    }
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleSaveImage}
          disabled={saving}
          className="rounded-full border border-line px-5 py-2 text-xs text-ink transition-colors hover:bg-neutral-50 disabled:opacity-40"
        >
          {saving ? "저장 중…" : "이미지로 저장"}
        </button>

        {isKakaoConfigured && (
          <button
            onClick={handleKakao}
            className="rounded-full border border-line px-5 py-2 text-xs text-ink transition-colors hover:bg-neutral-50"
          >
            카카오톡 공유
          </button>
        )}

        <button
          onClick={handleCopyLink}
          className="rounded-full border border-line px-5 py-2 text-xs text-ink transition-colors hover:bg-neutral-50"
        >
          {copyState === "copied" ? "링크 복사됨" : "링크 복사"}
        </button>
      </div>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

      {/* 캡처 전용, 화면에는 보이지 않는다 */}
      <div className="fixed left-[-9999px] top-0" aria-hidden>
        <ShareCard ref={cardRef} question={question} subtitle={subtitle} options={options} total={total} />
      </div>
    </div>
  );
}
