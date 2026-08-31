import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Vote from "@/pages/Vote";
import Suggest from "@/pages/Suggest";
import Board from "@/pages/Board";
import Login from "@/pages/Login";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-white">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Vote />} />
              <Route path="/suggest" element={<Suggest />} />
              <Route path="/board" element={<Board />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Vote />} />
            </Routes>
          </main>
          <footer className="border-t border-line">
            <div className="mx-auto max-w-content px-6 py-10 text-xs text-muted">
              선택하다
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
