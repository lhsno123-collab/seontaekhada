import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { changePassword, deleteAccount, reauthenticate } from "@/lib/account";

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export default function Account() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changing, setChanging] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changed, setChanged] = useState(false);

  const [deleteStep, setDeleteStep] = useState<"idle" | "confirming">("idle");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: "/account" }} replace />;

  async function handleChangePassword(event: FormEvent) {
    event.preventDefault();
    if (changing || !PASSWORD_RULE.test(newPassword)) return;

    setChanging(true);
    setChangeError(null);
    setChanged(false);

    try {
      // 로그인 상태에서 세션만으로 바로 바꿀 수도 있지만, 다른 사람이 로그인된
      // 화면을 그대로 쓰다가 바꾸는 걸 막기 위해 현재 비밀번호를 다시 확인한다.
      await reauthenticate(user!.email!, currentPassword);
      await changePassword(newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setChanged(true);
    } catch (error) {
      setChangeError((error as Error).message);
    } finally {
      setChanging(false);
    }
  }

  async function handleDelete(event: FormEvent) {
    event.preventDefault();
    if (deleting || !deletePassword) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await reauthenticate(user!.email!, deletePassword);
      await deleteAccount();
      await supabase.auth.signOut();
      navigate("/", { replace: true });
    } catch (error) {
      setDeleteError((error as Error).message);
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-content px-6 py-16 md:py-24">
      <p className="mb-6 text-xs tracking-[0.25em] text-muted">계정</p>
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">{user.email}</h1>
      <p className="mb-16 text-sm text-muted">로그인 중인 계정입니다.</p>

      {/* ── 비밀번호 변경 ── */}
      <section className="mb-20">
        <h2 className="mb-6 text-sm tracking-wide text-muted">비밀번호 변경</h2>
        <form onSubmit={handleChangePassword} className="max-w-sm space-y-6">
          <label className="block">
            <span className="mb-2 block text-xs text-muted">현재 비밀번호</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full border-b border-line bg-transparent pb-3 outline-none transition-colors focus:border-ink"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs text-muted">
              새 비밀번호 (8자 이상, 영문+숫자 포함)
            </span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full border-b border-line bg-transparent pb-3 outline-none transition-colors focus:border-ink"
            />
          </label>

          {changeError && <p className="text-sm text-red-600">{changeError}</p>}
          {changed && <p className="text-sm text-muted">비밀번호를 바꿨습니다.</p>}

          <button
            type="submit"
            disabled={changing || !currentPassword || !PASSWORD_RULE.test(newPassword)}
            className="rounded-full bg-ink px-7 py-2.5 text-sm text-white transition-opacity disabled:opacity-30"
          >
            {changing ? "바꾸는 중…" : "비밀번호 바꾸기"}
          </button>
        </form>
      </section>

      {/* ── 회원 탈퇴 ── */}
      <section>
        <h2 className="mb-6 text-sm tracking-wide text-muted">회원 탈퇴</h2>

        {deleteStep === "idle" && (
          <div>
            <p className="mb-6 max-w-sm text-sm text-muted">
              탈퇴하면 계정과 투표 기록이 모두 사라지고 되돌릴 수 없습니다.
            </p>
            <button
              onClick={() => setDeleteStep("confirming")}
              className="rounded-full border border-line px-7 py-2.5 text-sm text-red-600"
            >
              탈퇴하기
            </button>
          </div>
        )}

        {deleteStep === "confirming" && (
          <form onSubmit={handleDelete} className="max-w-sm space-y-6">
            <p className="text-sm text-muted">
              계속하려면 비밀번호를 입력해 본인 확인을 해주세요. 이 작업은 되돌릴 수 없습니다.
            </p>
            <label className="block">
              <span className="mb-2 block text-xs text-muted">비밀번호</span>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full border-b border-line bg-transparent pb-3 outline-none transition-colors focus:border-ink"
              />
            </label>

            {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={deleting || !deletePassword}
                className="rounded-full bg-red-600 px-7 py-2.5 text-sm text-white transition-opacity disabled:opacity-30"
              >
                {deleting ? "탈퇴 처리 중…" : "정말 탈퇴합니다"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteStep("idle");
                  setDeletePassword("");
                  setDeleteError(null);
                }}
                className="rounded-full border border-line px-7 py-2.5 text-sm text-muted"
              >
                취소
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
