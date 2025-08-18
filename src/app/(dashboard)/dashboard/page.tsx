import { SalesChart } from "@/components/charts/SalesChart";
import { StatsCard } from "@/components/ui/StatsCard";
import { Inventory, People, TrendingUp } from "@mui/icons-material";
import { Box, Grid, Typography } from "@mui/material";
import { Metadata } from "next";
import { QuickStats, RecentActivities } from "./components";
import { getDashboardData } from "./lib/dashboard-data";

// Metadata for SEO
export const metadata: Metadata = {
  title: "Dashboard - Visão Geral",
  description:
    "Painel de controle com visão geral das métricas de negócio, vendas, usuários e produtos.",
  keywords: [
    "dashboard",
    "analytics",
    "vendas",
    "usuários",
    "produtos",
    "métricas",
  ],
};

/**
 * Server-Side Rendered Dashboard Page
 * Fetches all data on the server for better SEO and initial load performance
 * Data is cached and revalidated every 5 minutes
 */
export default async function DashboardPage() {
  // Fetch all dashboard data on the server
  const { stats, salesData, recentActivities, quickStats } =
    await getDashboardData();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Visão Geral do Painel
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Bem-vindo de volta! Aqui está o que está acontecendo com seu negócio
        hoje.
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatsCard
            title="Total de Usuários"
            value={stats.totalUsers}
            icon={<People />}
            color="primary"
            trend={{ value: 12.5, label: "do mês passado" }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatsCard
            title="Produtos"
            value={stats.totalProducts}
            icon={<Inventory />}
            color="secondary"
            trend={{ value: 8.2, label: "do mês passado" }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatsCard
            title="Total de Vendas"
            value={stats.totalSales}
            icon={<TrendingUp />}
            color="success"
            trend={{ value: 23.1, label: "do mês passado" }}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12 }}>
          <SalesChart
            data={salesData}
            title="Tendência de Vendas (Últimos 6 Meses)"
          />
        </Grid>
      </Grid>

      {/* Recent Activity and Quick Stats */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <RecentActivities activities={recentActivities} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <QuickStats stats={quickStats} />
        </Grid>
      </Grid>
    </Box>
  );
}
