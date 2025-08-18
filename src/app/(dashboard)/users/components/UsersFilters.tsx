"use client";

import { FilterList, Search } from "@mui/icons-material";
import { Box, Button, TextField } from "@mui/material";

interface UsersFiltersProps {
  searchTerm: string;
  roleFilter: string;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: string) => void;
  onClearFilters: () => void;
}

/**
 * Componente de filtros para a página de usuários
 * Permite buscar por nome/email e filtrar por função
 */
export function UsersFilters({
  searchTerm,
  roleFilter,
  onSearchChange,
  onRoleFilterChange,
  onClearFilters,
}: UsersFiltersProps) {
  return (
    <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
      <TextField
        placeholder="Buscar usuários..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
        }}
        sx={{ minWidth: 300 }}
      />
      <TextField
        select
        label="Filtrar por função"
        value={roleFilter}
        onChange={(e) => onRoleFilterChange(e.target.value)}
        SelectProps={{ native: true }}
        sx={{ minWidth: 150 }}
      >
        <option value="">Todas</option>
        <option value="admin">Admin</option>
        <option value="user">Usuário</option>
        <option value="moderator">Moderador</option>
      </TextField>
      <Button
        variant="outlined"
        startIcon={<FilterList />}
        onClick={onClearFilters}
      >
        Limpar Filtros
      </Button>
    </Box>
  );
}
