"use client";

import { StatsCard } from "@/components/ui/StatsCard";
import {
  Inventory,
  ShoppingCart,
  Warning,
  RemoveShoppingCart,
} from "@mui/icons-material";
import { Box, Grid } from "@mui/material";
import { ProductsStats as ProductsStatsType } from "../lib/products-data";

interface ProductsStatsProps {
  stats: ProductsStatsType;
}

/**
 * Componente de estatísticas dos produtos
 * Exibe métricas importantes sobre o inventário e produtos do sistema
 */
export function ProductsStats({ stats }: ProductsStatsProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Total de Produtos"
            value={stats.totalProducts}
            icon={<Inventory />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Produtos em Estoque"
            value={stats.activeProducts}
            icon={<ShoppingCart />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Estoque Baixo"
            value={stats.lowStockProducts}
            icon={<Warning />}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Fora de Estoque"
            value={stats.outOfStockProducts}
            icon={<RemoveShoppingCart />}
            color="error"
          />
        </Grid>
      </Grid>
    </Box>
  );
}