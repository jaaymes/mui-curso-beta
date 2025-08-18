'use client';

import { Alert, Box, Typography, Button } from '@mui/material';
import { RefreshRounded } from '@mui/icons-material';

interface DashboardErrorProps {
  error?: string;
  retry?: () => void;
}

/**
 * Error component for dashboard
 * Can be used for both SSR errors and client-side error boundaries
 */
export function DashboardError({ error, retry }: DashboardErrorProps) {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard Overview
      </Typography>
      <Alert 
        severity="error" 
        sx={{ mb: 3 }}
        action={
          retry && (
            <Button 
              color="inherit" 
              size="small" 
              onClick={retry}
              startIcon={<RefreshRounded />}
            >
              Tentar Novamente
            </Button>
          )
        }
      >
        {error || 'Erro ao carregar dados do dashboard. Tente novamente mais tarde.'}
      </Alert>
    </Box>
  );
}