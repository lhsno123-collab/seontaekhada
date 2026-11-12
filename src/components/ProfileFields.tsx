import { AGE_GROUPS, POLITICAL_STANCES, type AgeGroup, type PoliticalStance } from "@/lib/types";

interface ProfileFieldsProps {
  ageGroup: AgeGroup | "";
  onAgeGroupChange: (value: AgeGroup) => void;
  consented: boolean;
  onConsentedChange: (value: boolean) => void;
  politicalStance: PoliticalStance | "";
  onPoliticalStanceChange: (value: PoliticalStance) => void;
}

/**
 * 연령대(일반 정보) + 신념(민감정보) 입력. 신념은 개인정보보호법상 민감정보라
 * 별도 동의 체크 없이는 선택지 자체를 비활성화해둔다 — 동의 안 해도 이 폼
 * 전체는 계속 진행할 수 있다(신념만 비게 저장됨).
 */
export default function ProfileFields({
  ageGroup,
  onAgeGroupChange,
  consented,
  onConsentedChange,
  politicalStance,
  onPoliticalStanceChange,
}: ProfileFieldsProps) {
  return (
    <div className="space-y-6">
      <label className="block">
        <span className="mb-3 block text-xs tracking-wide text-muted">연령대</span>
        <select
          value={ageGroup}
          onChange={(e) => onAgeGroupChange(e.target.value as AgeGroup)}
          required
          className="w-full border-b border-line bg-transparent pb-3 text-lg outline-none transition-colors focus:border-ink"
        >
          <option value="" disabled>
            선택해주세요
          </option>
          {AGE_GROUPS.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
      </label>

      <div className="rounded-2xl border border-line px-5 py-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={consented}
            onChange={(e) => onConsentedChange(e.target.checked)}
            className="mt-0.5"
          />
          <span className="text-xs leading-relaxed text-muted">
            <strong className="font-medium text-ink">
              (선택) 정치적 성향(신념) 수집·이용에 동의합니다.
            </strong>{" "}
            개인정보보호법상 민감정보로, 투표 결과를 연령·성향별로 분석하는 목적에만
            사용합니다. 동의하지 않아도 가입에는 영향이 없습니다.
          </span>
        </label>

        {consented && (
          <label className="mt-4 block">
            <span className="mb-2 block text-xs text-muted">신념</span>
            <select
              value={politicalStance}
              onChange={(e) => onPoliticalStanceChange(e.target.value as PoliticalStance)}
              required
              className="w-full border-b border-line bg-transparent pb-2 outline-none transition-colors focus:border-ink"
            >
              <option value="" disabled>
                선택해주세요
              </option>
              {POLITICAL_STANCES.map((stance) => (
                <option key={stance} value={stance}>
                  {stance}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}
