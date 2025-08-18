'use client';

import { useEffect } from 'react';
import { DashboardError } from './components/DashboardError';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for the dashboard page
 * Handles server-side rendering errors and provides a retry mechanism
 */
export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error for monitoring
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <DashboardError 
      error={`Falha ao carregar o dashboard: ${error?.message || 'Erro desconhecido'}`}
      retry={reset}
    />
  );
}