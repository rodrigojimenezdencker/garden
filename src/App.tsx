import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './router';

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-garden-50">
      <div className="rounded-[2rem] border border-garden-100 bg-white/85 p-8 text-center text-garden-700 shadow-sm backdrop-blur-sm">
        Cargando...
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
