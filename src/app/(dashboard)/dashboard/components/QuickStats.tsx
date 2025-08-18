'use client';

import { Paper, Typography, Box } from '@mui/material';
import type { QuickStats as QuickStatsType } from '../lib/dashboard-data';

interface QuickStatsProps {
  stats: QuickStatsType;
}

/**
 * Client component for quick stats display
 * Handles conditional styling for low stock warning
 */
export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Estatísticas Rápidas
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            Usuários Ativos
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {stats.activeUsers.toLocaleString()}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            Pedidos Pendentes
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {stats.pendingOrders.toLocaleString()}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            Itens com Estoque Baixo
          </Typography>
          <Typography 
            variant="body2" 
            fontWeight="bold" 
            color={stats.lowStockItems > 0 ? "warning.main" : "text.primary"}
          >
            {stats.lowStockItems.toLocaleString()}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            Receita de Hoje
          </Typography>
          <Typography variant="body2" fontWeight="bold" color="success.main">
            ${stats.todayRevenue.toLocaleString()}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}