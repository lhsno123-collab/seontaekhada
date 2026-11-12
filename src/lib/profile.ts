import { supabase } from "@/lib/supabase";
import type { AgeGroup, PoliticalStance, Profile } from "@/lib/types";

/** 프로필이 없으면 null (아직 한 번도 저장한 적 없는 경우 — OAuth로 막 가입한 사용자 등). */
export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, age_group, political_stance")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Profile | null;
}

/**
 * 신념(political_stance)은 민감정보라, 수집에 동의한 경우에만 값을 넣는다.
 * 동의하지 않았으면 그 항목은 null로 저장한다 — 가입 자체는 막지 않는다.
 */
export async function saveProfile(
  userId: string,
  input: {
    ageGroup: AgeGroup;
    politicalStance: PoliticalStance | null;
    consentedToStance: boolean;
  }
): Promise<void> {
  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: userId,
      age_group: input.ageGroup,
      political_stance: input.consentedToStance ? input.politicalStance : null,
      political_stance_consented_at: input.consentedToStance ? new Date().toISOString() : null,
    },
    { onConflict: "user_id" }
  );
  if (error) throw new Error(error.message);
}
