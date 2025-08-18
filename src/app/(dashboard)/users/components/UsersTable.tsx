"use client";

import { UserDetailDialog } from "@/components/ui/UserDetailDialog";
import { DummyUser } from "@/types";
import { Visibility } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";

interface UsersTableProps {
  users: DummyUser[];
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Componente de tabela de usuários
 * Exibe lista de usuários com paginação e ação de visualizar detalhes
 */
export function UsersTable({
  users,
  isLoading = false,
  error = null,
}: UsersTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState<DummyUser | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  /**
   * Aplica paginação aos usuários
   */
  const paginatedUsers = users.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  /**
   * Abre o diálogo de detalhes do usuário
   */
  const handleViewDetails = (user: DummyUser) => {
    setSelectedUser(user);
    setDetailDialogOpen(true);
  };

  /**
   * Fecha o diálogo de detalhes
   */
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Usuário</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Função</TableCell>
              <TableCell>Data de Nascimento</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ color: "error.main" }}
                >
                  Erro ao carregar usuários
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar src={user.image} sx={{ width: 40, height: 40 }}>
                        {user.firstName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {`${user.firstName} ${user.lastName}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.username}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        user.role.charAt(0).toUpperCase() + user.role.slice(1)
                      }
                      color={
                        user.role === "admin"
                          ? "primary"
                          : user.role === "moderator"
                          ? "secondary"
                          : "default"
                      }
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.birthDate).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver detalhes">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(user)}
                        color="primary"
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginação */}
      <TablePagination
        component="div"
        count={users.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Linhas por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
        }
      />

      {/* Diálogo de Detalhes */}
      <UserDetailDialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        user={selectedUser}
      />
    </>
  );
}
