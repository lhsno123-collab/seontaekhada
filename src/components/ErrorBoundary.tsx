import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  message: string | null;
}

/**
 * 렌더링 중 예외가 나도 백지 대신 이유를 보여준다.
 * 배포된 사이트에서 원인을 바로 알 수 있어야 한다.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { message: null };

  static getDerivedStateFromError(error: Error): State {
    return { message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("화면을 그리는 중 오류가 났습니다", error, info);
  }

  render() {
    if (this.state.message === null) return this.props.children;

    return (
      <div className="mx-auto max-w-content px-6 py-24">
        <h1 className="mb-4 text-2xl font-semibold">화면을 불러오지 못했습니다.</h1>
        <p className="mb-8 text-sm text-muted">
          아래 내용을 그대로 알려주시면 원인을 찾을 수 있습니다.
        </p>
        <pre className="overflow-x-auto rounded-xl border border-line px-5 py-4 text-xs">
          {this.state.message}
        </pre>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 rounded-full bg-ink px-7 py-2.5 text-sm text-white"
        >
          새로고침
        </button>
      </div>
    );
  }
}
