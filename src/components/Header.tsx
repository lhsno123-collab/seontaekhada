import { NavLink, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useOnlineCount } from "@/hooks/useOnlineCount";

const MENU = [
  { to: "/", label: "선택하다 투표하기", end: true },
  { to: "/suggest", label: "선택하다 주제추천", end: false },
  { to: "/board", label: "오늘의 광고판", end: false },
];

export default function Header() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const onlineCount = useOnlineCount();

  return (
    <header className="border-b border-line bg-white/90 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-content px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-lg tracking-[0.2em] font-semibold">
              선택하다
            </Link>
            {onlineCount !== null && (
              <span className="hidden items-center gap-1.5 text-xs text-muted sm:flex">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                {onlineCount.toLocaleString()}명 접속 중
              </span>
            )}
          </div>
          <div className="flex items-center gap-5">
            {isAdmin && (
              <Link to="/admin" className="text-xs text-muted transition-colors hover:text-ink">
                관리자
              </Link>
            )}
            {user ? (
              <>
                <Link
                  to="/account"
                  className="text-xs text-muted transition-colors hover:text-ink"
                >
                  계정
                </Link>
                <button
                  onClick={signOut}
                  className="text-xs text-muted transition-colors hover:text-ink"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-xs text-muted transition-colors hover:text-ink"
              >
                로그인
              </Link>
            )}
          </div>
        </div>

        <nav className="flex gap-8 -mb-px">
          {MENU.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  "pb-4 text-sm transition-colors border-b-2",
                  isActive
                    ? "border-ink text-ink"
                    : "border-transparent text-muted hover:text-ink",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
