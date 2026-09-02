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
 * 투표 전에는 부드러운 채움 배경의 빈 카드, 투표 후에는 같은 카드 안에서 막대가 차오른다.
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
        "group relative w-full overflow-hidden rounded-[28px] text-left transition-all duration-200",
        "px-7 py-6 md:px-8 md:py-7",
        "shadow-[0_1px_2px_rgba(17,17,17,0.04)]",
        selected
          ? "bg-ink/[0.06] ring-1 ring-inset ring-ink/15"
          : "bg-neutral-50 ring-1 ring-inset ring-black/[0.03] hover:bg-neutral-100",
        disabled ? "cursor-default" : "cursor-pointer active:scale-[0.99]",
      ].join(" ")}
    >
      {/* 집계 막대 */}
      <span
        aria-hidden
        className={[
          "absolute inset-y-0 left-0 transition-all duration-700 ease-out",
          selected ? "bg-ink/[0.08]" : "bg-ink/[0.05]",
        ].join(" ")}
        style={{ width: revealed ? `${percent}%` : "0%" }}
      />

      <span className="relative flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <span className="min-w-0">
          <span className="block text-xl md:text-2xl font-medium leading-snug">{label}</span>
          {selected && (
            <span className="mt-0.5 block text-[11px] text-muted">내 선택</span>
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
