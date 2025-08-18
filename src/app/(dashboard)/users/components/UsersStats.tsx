import { StatsCard } from "@/components/ui/StatsCard";
import {
  AdminPanelSettings,
  Group,
  People,
  PersonAdd,
} from "@mui/icons-material";
import { Box, Grid } from "@mui/material";
import { UsersStats as UsersStatsType } from "../lib/users-data";

interface UsersStatsProps {
  stats: UsersStatsType;
}

/**
 * Componente de estatísticas dos usuários
 * Exibe métricas importantes sobre os usuários do sistema
 */
export function UsersStats({ stats }: UsersStatsProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Total de Usuários"
            value={stats.totalUsers}
            icon={<People />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Usuários Ativos"
            value={stats.activeUsers}
            icon={<Group />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Administradores"
            value={stats.admins}
            icon={<AdminPanelSettings />}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatsCard
            title="Novos Registros"
            value={stats.newRegistrations}
            icon={<PersonAdd />}
            color="secondary"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
