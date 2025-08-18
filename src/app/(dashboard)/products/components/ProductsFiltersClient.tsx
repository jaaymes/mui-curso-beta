/**
 * Componente client-side para filtros interativos com debounced search
 * Implementa loading states e melhores práticas de UX baseado na implementação do UsersFiltersClient
 */
"use client";

import { Clear as ClearIcon, Search as SearchIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface ProductsFiltersClientProps {
  searchTerm: string;
  categoryFilter: string;
  categories: string[];
}

/**
 * Componente cliente para filtros de produtos
 * Implementa debounced search e loading states para melhor UX
 */
export function ProductsFiltersClient({
  searchTerm: initialSearch,
  categoryFilter: initialCategory,
  categories,
}: ProductsFiltersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce para busca - aguarda 500ms após última digitação
  useEffect(() => {
    // Se não há mudanças nos filtros, não faz nada
    if (searchTerm === initialSearch && categoryFilter === initialCategory) {
      return;
    }

    setIsLoading(true);

    const timer = setTimeout(() => {
      updateURL();
      setIsLoading(false);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm, categoryFilter]);

  // Atualizar URL com parâmetros de busca
  const updateURL = () => {
    const params = new URLSearchParams(searchParams);

    if (searchTerm.trim()) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }

    if (categoryFilter) {
      params.set("category", categoryFilter);
    } else {
      params.delete("category");
    }

    // Resetar página ao alterar filtros
    params.delete("page");

    router.push(`?${params.toString()}`);
  };

  // Limpar todos os filtros
  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setIsLoading(true);

    // Limpar URL e desabilitar loading após navegação
    router.push("/products");
    
    // Limpar loading após um pequeno delay para permitir a navegação
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  };

  // Verificar se há filtros ativos
  const hasActiveFilters = searchTerm.trim() || categoryFilter;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        alignItems: "center",
        flexWrap: "wrap",
        mb: 3,
        p: 3,
        bgcolor: "background.paper",
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
      }}
    >
      {/* Campo de busca */}
      <TextField
        placeholder="Buscar produtos por nome, descrição ou marca..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
            endAdornment: isLoading && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ minWidth: 350, flex: 1 }}
        size="small"
      />

      {/* Filtro por categoria */}
      <TextField
        select
        label="Categoria"
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        sx={{ minWidth: 200 }}
        size="small"
      >
        <MenuItem value="">Todas as categorias</MenuItem>
        {categories.map((category, index) => (
          <MenuItem key={index} value={category}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </MenuItem>
        ))}
      </TextField>

      {/* Botão limpar filtros */}
      {hasActiveFilters && (
        <Button
          onClick={handleClearFilters}
          startIcon={<ClearIcon />}
          variant="outlined"
          color="inherit"
          size="small"
          disabled={isLoading}
        >
          Limpar Filtros
        </Button>
      )}
    </Box>
  );
}
