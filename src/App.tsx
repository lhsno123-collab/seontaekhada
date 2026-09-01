import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import ErrorBoundary from "@/components/ErrorBoundary";
import ConfigBanner from "@/components/ConfigBanner";
import WelcomePopup from "@/components/WelcomePopup";
import Vote from "@/pages/Vote";
import Suggest from "@/pages/Suggest";
import Board from "@/pages/Board";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Account from "@/pages/Account";
import Admin from "@/pages/Admin";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-white">
          <ConfigBanner />
          <Header />
          <main>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Vote />} />
                <Route path="/suggest" element={<Suggest />} />
                <Route path="/board" element={<Board />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/account" element={<Account />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="*" element={<Vote />} />
              </Routes>
            </ErrorBoundary>
          </main>
          <footer className="border-t border-line">
            <div className="mx-auto max-w-content px-6 py-10 text-xs text-muted">
              <p className="mb-3">
                선택하다는 통계적 표본을 구성하는 공식 여론조사가 아닌 참고용 비공식
                설문입니다.
              </p>
              <div className="flex gap-4">
                <Link to="/terms" className="hover:text-ink">
                  이용약관
                </Link>
                <Link to="/privacy" className="hover:text-ink">
                  개인정보처리방침
                </Link>
              </div>
            </div>
          </footer>
          <WelcomePopup />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
