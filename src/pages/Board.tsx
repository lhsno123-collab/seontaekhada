import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Ad } from "@/lib/types";

export default function Board() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const { data } = await supabase
          .from("ads")
          .select("id, title, body, link_url, image_url, position")
          .order("position", { ascending: true });
        if (!cancelled) setAds((data ?? []) as Ad[]);
      } finally {
        // 요청이 실패해도 '불러오는 중…' 에 머물지 않게 한다
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-content px-6 py-16 md:py-24">
      <p className="text-xs tracking-[0.25em] text-muted mb-6">오늘의 광고판</p>
      <h1 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight mb-12">
        오늘 하루만 걸리는 자리.
      </h1>

      {loading && <p className="text-sm text-muted">불러오는 중…</p>}

      {!loading && ads.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line px-8 py-16 text-center">
          <p className="mb-2">오늘은 아직 비어 있습니다.</p>
          <p className="text-sm text-muted">이 자리를 쓰고 싶다면 문의해 주세요.</p>
        </div>
      )}

      <div className="space-y-4">
        {ads.map((ad) => (
          <AdCard key={ad.id} ad={ad} />
        ))}
      </div>
    </div>
  );
}

function AdCard({ ad }: { ad: Ad }) {
  const content = (
    <div className="rounded-2xl border border-line px-7 py-6 transition-colors hover:border-ink/40">
      {ad.image_url && (
        <img
          src={ad.image_url}
          alt=""
          className="mb-5 w-full rounded-xl object-cover"
          loading="lazy"
        />
      )}
      <p className="text-xl font-medium">{ad.title}</p>
      {ad.body && <p className="mt-2 text-sm leading-relaxed text-muted">{ad.body}</p>}
    </div>
  );

  if (!ad.link_url) return content;

  return (
    <a href={ad.link_url} target="_blank" rel="noopener noreferrer nofollow" className="block">
      {content}
    </a>
  );
}
