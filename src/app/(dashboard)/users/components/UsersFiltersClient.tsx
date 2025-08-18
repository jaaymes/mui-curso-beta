"use client";

import {
  Clear as ClearIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { type AdvancedSearchFilter } from "../lib/users-data";
import AdvancedSearchDialog from "./AdvancedSearchDialog";

interface UsersFiltersClientProps {
  initialSearch?: string;
  initialRole?: string;
}

/**
 * Componente cliente para filtros de usuários
 * Gerencia busca simples, filtro por função e busca avançada
 */
export default function UsersFiltersClient({
  initialSearch = "",
  initialRole = "",
}: UsersFiltersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [roleFilter, setRoleFilter] = useState(initialRole);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<
    AdvancedSearchFilter[]
  >([]);

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter]);

  // Atualizar URL com parâmetros de busca
  const updateURL = () => {
    const params = new URLSearchParams(searchParams);

    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }

    if (roleFilter) {
      params.set("role", roleFilter);
    } else {
      params.delete("role");
    }

    // Resetar página ao alterar filtros
    params.delete("page");

    router.push(`?${params.toString()}`);
  };

  // Limpar todos os filtros
  const handleClearFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setAdvancedFilters([]);

    // Limpar URL
    router.push("/users");
  };

  // Executar busca avançada
  const handleAdvancedSearch = (filters: AdvancedSearchFilter[]) => {
    setAdvancedFilters(filters);

    // Atualizar URL com filtros avançados
    const params = new URLSearchParams();

    // Serializar filtros avançados para URL
    if (filters.length > 0) {
      params.set("advanced", JSON.stringify(filters));
    }

    // Resetar página
    params.delete("page");

    router.push(`?${params.toString()}`);
  };

  // Verificar se há filtros ativos
  const hasActiveFilters =
    searchTerm || roleFilter || advancedFilters.length > 0;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "center",
          flexWrap: "wrap",
          mb: 3,
        }}
      >
        {/* Campo de busca */}
        <TextField
          placeholder="Buscar usuários..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
            ),
          }}
          sx={{ minWidth: 300, flex: 1 }}
          size="small"
        />

        {/* Filtro por função */}
        <TextField
          select
          label="Função"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          sx={{ minWidth: 150 }}
          size="small"
        >
          <MenuItem value="">Todas</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="user">Usuário</MenuItem>
          <MenuItem value="moderator">Moderador</MenuItem>
        </TextField>

        {/* Botão de busca avançada */}
        <Tooltip title="Busca Avançada">
          <IconButton
            onClick={() => setAdvancedSearchOpen(true)}
            color={advancedFilters.length > 0 ? "primary" : "default"}
            sx={{
              border: "1px solid",
              borderColor:
                advancedFilters.length > 0 ? "primary.main" : "divider",
            }}
          >
            <FilterListIcon />
          </IconButton>
        </Tooltip>

        {/* Botão limpar filtros */}
        {hasActiveFilters && (
          <Button
            onClick={handleClearFilters}
            startIcon={<ClearIcon />}
            variant="outlined"
            color="inherit"
            size="small"
          >
            Limpar Filtros
          </Button>
        )}
      </Box>

      {/* Diálogo de busca avançada */}
      <AdvancedSearchDialog
        open={advancedSearchOpen}
        onClose={() => setAdvancedSearchOpen(false)}
        onSearch={handleAdvancedSearch}
        initialFilters={advancedFilters}
      />
    </>
  );
}
