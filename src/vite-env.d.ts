/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  /** 선택 사항. 없으면 카카오톡 공유 버튼이 자동으로 숨는다. */
  readonly VITE_KAKAO_JS_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** 카카오 JS SDK. 공식 타입 패키지를 쓰기엔 무거워서 필요한 만큼만 선언한다. */
interface Window {
  Kakao?: {
    init: (key: string) => void;
    isInitialized: () => boolean;
    Share: {
      sendDefault: (options: {
        objectType: "text";
        text: string;
        link: { mobileWebUrl: string; webUrl: string };
      }) => void;
    };
  };
}
