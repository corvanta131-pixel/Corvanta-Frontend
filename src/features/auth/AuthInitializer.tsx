import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import { useInitializeAuth } from '../../features/auth/hooks';

export function AuthInitializer() {
  const { initializeAuth } = useInitializeAuth();
  const isInitializing = useAppSelector((state) => state.auth.isInitializing);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-950" />
      </div>
    );
  }

  return <Outlet />;
}