interface OptionCardProps {
  label: string;
  votes: number;
  percent: number;
  selected: boolean;
  revealed: boolean;
  disabled: boolean;
  onSelect: () => void;
}

/**
 * 투표 전에는 큰 빈 카드, 투표 후에는 같은 카드 안에서 막대가 차오른다.
 * 카드가 바뀌지 않고 상태만 변해서 화면이 튀지 않는다.
 */
export default function OptionCard({
  label,
  votes,
  percent,
  selected,
  revealed,
  disabled,
  onSelect,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={[
        "group relative w-full overflow-hidden rounded-2xl border text-left transition-all",
        "px-7 py-6 md:px-8 md:py-7",
        selected ? "border-ink" : "border-line hover:border-ink/40",
        disabled ? "cursor-default" : "cursor-pointer active:scale-[0.995]",
      ].join(" ")}
    >
      {/* 집계 막대 */}
      <span
        aria-hidden
        className={[
          "absolute inset-y-0 left-0 transition-all duration-700 ease-out",
          selected ? "bg-ink/[0.09]" : "bg-ink/[0.04]",
        ].join(" ")}
        style={{ width: revealed ? `${percent}%` : "0%" }}
      />

      <span className="relative flex items-baseline justify-between gap-4">
        <span className="text-xl md:text-2xl font-medium leading-snug">
          {label}
          {selected && (
            <span className="ml-2 align-middle text-[11px] text-muted">내 선택</span>
          )}
        </span>

        {revealed && (
          <span className="shrink-0 text-right tabular-nums">
            <span className="block text-xl md:text-2xl font-semibold">
              {percent.toFixed(1)}%
            </span>
            <span className="block text-xs text-muted">{votes.toLocaleString()}명</span>
          </span>
        )}
      </span>
    </button>
  );
}
