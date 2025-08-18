import { Box, Card, CardContent, CardHeader, Typography } from "@mui/material";
import { Metadata } from "next";
import { UsersStats, UsersTable } from "./components";
import UsersFiltersClient from "./components/UsersFiltersClient";
import { filterUsers, getUsersData } from "./lib/users-data";

// Metadata for SEO
export const metadata: Metadata = {
  title: "Usuários - Gerenciamento",
  description:
    "Visualize e gerencie os usuários cadastrados no sistema. Acesse informações detalhadas, estatísticas e filtros avançados.",
  keywords: [
    "usuários",
    "gerenciamento",
    "administração",
    "perfis",
    "estatísticas",
    "dashboard",
  ],
};

interface UsersPageProps {
  searchParams: {
    search?: string;
    role?: string;
    page?: string;
  };
}

/**
 * Server-Side Rendered Users Page
 * Busca todos os dados no servidor para melhor SEO e performance inicial
 * Os dados são processados no servidor e enviados para os componentes
 */
export default async function UsersPage({ searchParams }: UsersPageProps) {
  // Extrai parâmetros de busca da URL
  const searchTerm = searchParams.search || "";
  const roleFilter = searchParams.role || "";

  // Busca todos os dados de usuários no servidor
  const { users, stats, total } = await getUsersData();

  // Aplica filtros no servidor
  const filteredUsers = filterUsers(users, searchTerm, roleFilter);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Gerenciamento de Usuários
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Visualize e gerencie os usuários cadastrados no sistema.
      </Typography>

      {/* Estatísticas dos Usuários */}
      <UsersStats stats={stats} />

      {/* Card Principal */}
      <Card>
        <CardHeader
          title={
            <Typography variant="h5" fontWeight="bold">
              Usuários ({total})
            </Typography>
          }
          subheader="Visualize os usuários cadastrados no sistema"
        />
        <CardContent>
          {/* Filtros - Componente Client-side para interatividade */}
          <UsersFiltersClient
            initialSearch={searchTerm}
            initialRole={roleFilter}
          />

          {/* Tabela de Usuários */}
          <UsersTable users={filteredUsers} isLoading={false} error={null} />
        </CardContent>
      </Card>
    </Box>
  );
}
