import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

/** 로그인한 사용자가 관리자인지. admins 테이블에 본인 행이 있는지로 판별한다. */
export function useIsAdmin(): { isAdmin: boolean; checking: boolean } {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user || !isSupabaseConfigured) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }

    let cancelled = false;
    supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setIsAdmin(Boolean(data));
        setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  return { isAdmin, checking };
}
