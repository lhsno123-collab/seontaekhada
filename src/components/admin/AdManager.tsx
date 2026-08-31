import { useCallback, useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

interface AdRow {
  id: string;
  title: string;
  body: string | null;
  link_url: string | null;
  image_url: string | null;
  show_on: string;
  position: number;
  is_active: boolean;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AdManager({ onError }: { onError: (m: string) => void }) {
  const [ads, setAds] = useState<AdRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showOn, setShowOn] = useState(today());

  const reload = useCallback(async () => {
    const { data, error } = await supabase
      .from("ads")
      .select("id, title, body, link_url, image_url, show_on, position, is_active")
      .order("show_on", { ascending: false })
      .order("position", { ascending: true });

    if (error) onError(error.message);
    setAds((data ?? []) as AdRow[]);
    setLoading(false);
  }, [onError]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (saving || !title.trim()) return;

    setSaving(true);
    const { error } = await supabase.from("ads").insert({
      title: title.trim(),
      body: body.trim() || null,
      link_url: linkUrl.trim() || null,
      image_url: imageUrl.trim() || null,
      show_on: showOn,
      position: ads.filter((a) => a.show_on === showOn).length,
    });

    if (error) onError(error.message);
    else {
      setTitle("");
      setBody("");
      setLinkUrl("");
      setImageUrl("");
      await reload();
    }
    setSaving(false);
  }

  async function toggle(ad: AdRow) {
    const { error } = await supabase
      .from("ads")
      .update({ is_active: !ad.is_active })
      .eq("id", ad.id);
    if (error) onError(error.message);
    await reload();
  }

  async function remove(ad: AdRow) {
    if (!confirm("이 광고를 삭제할까요?")) return;
    const { error } = await supabase.from("ads").delete().eq("id", ad.id);
    if (error) onError(error.message);
    await reload();
  }

  return (
    <div className="space-y-16">
      <section>
        <h2 className="mb-6 text-sm tracking-wide text-muted">광고 등록</h2>
        <form onSubmit={handleCreate} className="space-y-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="제목"
            className="w-full border-b border-line bg-transparent pb-3 text-lg outline-none transition-colors focus:border-ink"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            placeholder="설명 (선택 사항)"
            className="w-full resize-none border-b border-line bg-transparent pb-3 outline-none transition-colors focus:border-ink"
          />
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="링크 주소 (선택 사항)"
            className="w-full border-b border-line bg-transparent pb-3 outline-none transition-colors focus:border-ink"
          />
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="이미지 주소 (선택 사항)"
            className="w-full border-b border-line bg-transparent pb-3 outline-none transition-colors focus:border-ink"
          />
          <label className="block">
            <span className="mb-2 block text-xs text-muted">게시일</span>
            <input
              type="date"
              value={showOn}
              onChange={(e) => setShowOn(e.target.value)}
              className="border-b border-line bg-transparent pb-2 outline-none transition-colors focus:border-ink"
            />
          </label>
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="rounded-full bg-ink px-7 py-2.5 text-sm text-white transition-opacity disabled:opacity-30"
          >
            {saving ? "등록 중…" : "등록"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-6 text-sm tracking-wide text-muted">등록된 광고</h2>
        {loading && <p className="text-sm text-muted">불러오는 중…</p>}
        {!loading && ads.length === 0 && (
          <p className="text-sm text-muted">등록된 광고가 없습니다.</p>
        )}

        <div className="space-y-3">
          {ads.map((ad) => (
            <article
              key={ad.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-line px-6 py-4"
            >
              <div>
                <p className="font-medium">{ad.title}</p>
                <p className="mt-1 text-xs text-muted">
                  {ad.show_on} · {ad.is_active ? "게시 중" : "숨김"}
                </p>
              </div>
              <div className="flex shrink-0 gap-2 text-xs">
                <button
                  onClick={() => toggle(ad)}
                  className="rounded-full border border-line px-4 py-1.5"
                >
                  {ad.is_active ? "숨기기" : "게시"}
                </button>
                <button
                  onClick={() => remove(ad)}
                  className="rounded-full border border-line px-4 py-1.5 text-muted"
                >
                  삭제
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
