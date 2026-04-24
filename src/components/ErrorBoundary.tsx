import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Error capturado:', error, info);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-garden-50 p-4">
          <div className="w-full max-w-md rounded-[2rem] border border-garden-100 bg-white/90 p-8 text-center shadow-sm backdrop-blur-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
              🌿
            </div>
            <h1 className="mt-5 text-2xl font-semibold text-garden-950">
              Algo salió mal
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Intenta recargar la página
            </p>
            <button
              className="mt-6 rounded-full bg-garden-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-garden-700"
              onClick={() => window.location.reload()}
              type="button"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
