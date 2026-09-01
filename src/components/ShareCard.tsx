import { forwardRef } from "react";

interface ShareCardOption {
  label: string;
  votes: number;
  percent: number;
  selected: boolean;
}

interface ShareCardProps {
  question: string;
  subtitle?: string | null;
  options: ShareCardOption[];
  total: number;
}

/**
 * 이미지로 저장할 때만 쓰는 정적인 카드. 화면에는 보이지 않고(Off-screen)
 * html-to-image 로 캡처할 대상으로만 쓴다 — 실제 투표 카드는 버튼이라
 * 그대로 캡처하면 hover/disabled 스타일이 섞여 지저분하다.
 */
const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { question, subtitle, options, total },
  ref
) {
  return (
    <div
      ref={ref}
      className="w-[640px] bg-white px-12 py-14"
      style={{ fontFamily: "Pretendard, sans-serif" }}
    >
      <p className="mb-5 text-xs tracking-[0.25em] text-muted">오늘의 주제 · 선택하다</p>
      <h2 className="mb-2 text-3xl font-semibold leading-snug">{question}</h2>
      {subtitle && <p className="mb-8 text-sm text-muted">{subtitle}</p>}
      {!subtitle && <div className="mb-8" />}

      <div className="space-y-3">
        {options.map((option) => (
          <div
            key={option.label}
            className={[
              "relative overflow-hidden rounded-[24px] px-7 py-5",
              option.selected ? "bg-ink/[0.06]" : "bg-neutral-50",
            ].join(" ")}
          >
            <div
              className="absolute inset-y-0 left-0 bg-ink/[0.05]"
              style={{ width: `${option.percent}%` }}
            />
            <div className="relative flex items-baseline justify-between gap-4">
              <span className="text-lg font-medium">
                {option.label}
                {option.selected && (
                  <span className="ml-2 text-[11px] font-normal text-muted">내 선택</span>
                )}
              </span>
              <span className="shrink-0 text-right tabular-nums">
                <span className="block text-lg font-semibold">
                  {option.percent.toFixed(1)}%
                </span>
                <span className="block text-xs text-muted">{option.votes.toLocaleString()}명</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs text-muted">
        {total.toLocaleString()}명 참여 · {typeof window !== "undefined" ? window.location.host : ""}
      </p>
    </div>
  );
});

export default ShareCard;
