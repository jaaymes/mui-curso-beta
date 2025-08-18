"use client";

import { FilterOptions } from "@/types";
import { Clear, Search } from "@mui/icons-material";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
} from "@mui/material";
import { useState } from "react";

interface FilterBarProps {
  onFiltersChange: (filters: FilterOptions) => void;
  categories?: string[];
  roles?: string[];
}

export function FilterBar({
  onFiltersChange,
  categories = [],
  roles = [],
}: FilterBarProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    category: "",
    role: "",
    sortBy: "name",
    sortOrder: "asc",
  });

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterOptions = {
      search: "",
      category: "",
      role: "",
      sortBy: "name",
      sortOrder: "asc",
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = filters.search || filters.category || filters.role;

  return (
    <Paper sx={{ p: 2, mb: 3 }} data-testid="products-filters">
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            placeholder="Buscar..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            data-testid="search-input"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>

        {categories.length > 0 && (
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={filters.category || ""}
                label="Category"
                onChange={(e) => handleFilterChange("category", e.target.value)}
                data-testid="category-select"
              >
                <MenuItem value="">Todas as Categorias</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {roles.length > 0 && (
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Função</InputLabel>
              <Select
                value={filters.role || ""}
                label="Role"
                onChange={(e) => handleFilterChange("role", e.target.value)}
              >
                <MenuItem value="">Todas as Funções</MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Ordenar Por</InputLabel>
            <Select
              value={filters.sortBy || "name"}
              label="Sort By"
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            >
              <MenuItem value="name">Nome</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="createdAt">Data de Criação</MenuItem>
              {categories.length > 0 && (
                <MenuItem value="category">Category</MenuItem>
              )}
              {categories.length > 0 && (
                <MenuItem value="price">Preço</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Box display="flex" gap={1}>
            <FormControl fullWidth>
              <InputLabel>Ordem</InputLabel>
              <Select
                value={filters.sortOrder || "asc"}
                label="Order"
                onChange={(e) =>
                  handleFilterChange("sortOrder", e.target.value)
                }
              >
                <MenuItem value="asc">Crescente</MenuItem>
                <MenuItem value="desc">Decrescente</MenuItem>
              </Select>
            </FormControl>
            {hasActiveFilters && (
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                sx={{ minWidth: "auto", px: 2 }}
                data-testid="clear-filters-button"
              >
                <Clear />
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
