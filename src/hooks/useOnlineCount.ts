import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * 지금 이 사이트를 열어둔 사람 수. Supabase Realtime Presence로 센다 —
 * DB에 아무것도 저장하지 않고, 탭을 닫거나 연결이 끊기면 자동으로 빠진다.
 * 그래서 정확한 '순 방문자'가 아니라 '지금 이 순간 연결돼 있는 탭 수'에 가깝다.
 */
export function useOnlineCount(): number | null {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase.channel("online-users", {
      config: { presence: { key: crypto.randomUUID() } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        setCount(Object.keys(channel.presenceState()).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return count;
}
