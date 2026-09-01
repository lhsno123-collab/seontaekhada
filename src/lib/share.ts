export const isKakaoConfigured = Boolean(import.meta.env.VITE_KAKAO_JS_KEY?.trim());

let kakaoLoadPromise: Promise<void> | null = null;

/** 카카오 JS SDK를 한 번만 불러오고 초기화한다. */
function loadKakao(): Promise<void> {
  if (window.Kakao?.isInitialized()) return Promise.resolve();
  if (kakaoLoadPromise) return kakaoLoadPromise;

  kakaoLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
    script.crossOrigin = "anonymous";
    script.onload = () => {
      window.Kakao!.init(import.meta.env.VITE_KAKAO_JS_KEY!);
      resolve();
    };
    script.onerror = () => reject(new Error("카카오 SDK를 불러오지 못했습니다."));
    document.head.appendChild(script);
  });

  return kakaoLoadPromise;
}

export async function shareToKakao(params: {
  title: string;
  description: string;
  url: string;
}): Promise<void> {
  await loadKakao();
  window.Kakao!.Share.sendDefault({
    objectType: "text",
    text: `${params.title}\n${params.description}`,
    link: { mobileWebUrl: params.url, webUrl: params.url },
  });
}

export async function copyLink(url: string): Promise<void> {
  await navigator.clipboard.writeText(url);
}

/** 파일 이름으로 못 쓰는 문자를 지우고 길이를 줄인다. */
export function toFileSlug(text: string): string {
  return text.replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 40) || "선택하다";
}
