import { supabase } from "@/lib/supabase";

/** 비밀번호 변경 전 본인 확인. 현재 세션과 별개로 비밀번호를 다시 검증한다. */
export async function reauthenticate(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(
      /invalid login credentials/i.test(error.message)
        ? "비밀번호가 올바르지 않습니다."
        : error.message
    );
  }
}

export async function changePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw new Error(error.message);
}

/** 계정 삭제. anon key로는 auth.users를 지울 수 없어 Edge Function을 거친다. */
export async function deleteAccount(): Promise<void> {
  const { data, error } = await supabase.functions.invoke("delete-account");
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
}
