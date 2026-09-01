import { NavLink, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const MENU = [
  { to: "/", label: "선택하다 투표하기", end: true },
  { to: "/suggest", label: "선택하다 주제추천", end: false },
  { to: "/board", label: "오늘의 광고판", end: false },
];

export default function Header() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();

  return (
    <header className="border-b border-line bg-white/90 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-content px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-lg tracking-[0.2em] font-semibold">
            선택하다
          </Link>
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
