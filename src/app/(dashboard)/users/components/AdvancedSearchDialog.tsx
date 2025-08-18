'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import { SEARCH_FIELDS, type AdvancedSearchFilter } from '../lib/users-data';

interface AdvancedSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onSearch: (filters: AdvancedSearchFilter[]) => void;
  initialFilters?: AdvancedSearchFilter[];
}

/**
 * Componente de diálogo para busca avançada de usuários
 * Permite criar múltiplos filtros usando campos específicos da API DummyJSON
 */
export default function AdvancedSearchDialog({
  open,
  onClose,
  onSearch,
  initialFilters = [],
}: AdvancedSearchDialogProps) {
  const [filters, setFilters] = useState<AdvancedSearchFilter[]>(
    initialFilters.length > 0 ? initialFilters : [{ key: '', value: '' }]
  );

  // Adicionar novo filtro
  const handleAddFilter = () => {
    setFilters([...filters, { key: '', value: '' }]);
  };

  // Remover filtro
  const handleRemoveFilter = (index: number) => {
    if (filters.length > 1) {
      setFilters(filters.filter((_, i) => i !== index));
    }
  };

  // Atualizar filtro
  const handleFilterChange = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    const newFilters = [...filters];
    newFilters[index][field] = value;
    setFilters(newFilters);
  };

  // Executar busca
  const handleSearch = () => {
    const validFilters = filters.filter(
      (filter) => filter.key && filter.value.trim()
    );
    
    if (validFilters.length > 0) {
      onSearch(validFilters);
      onClose();
    }
  };

  // Limpar filtros
  const handleClear = () => {
    setFilters([{ key: '', value: '' }]);
  };

  // Obter opções de campos disponíveis
  const getFieldOptions = () => {
    return Object.entries(SEARCH_FIELDS).map(([label, value]) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      value,
    }));
  };

  // Obter label do campo
  const getFieldLabel = (key: string) => {
    const entry = Object.entries(SEARCH_FIELDS).find(([, value]) => value === key);
    return entry ? entry[0].charAt(0).toUpperCase() + entry[0].slice(1) : key;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '400px' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Busca Avançada de Usuários</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Configure filtros específicos para buscar usuários usando campos detalhados.
          Você pode combinar múltiplos critérios para refinar sua pesquisa.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filters.map((filter, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.paper',
              }}
            >
              <TextField
                select
                label="Campo"
                value={filter.key}
                onChange={(e) => handleFilterChange(index, 'key', e.target.value)}
                sx={{ minWidth: 200 }}
                size="small"
              >
                {getFieldOptions().map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Valor"
                value={filter.value}
                onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                placeholder="Digite o valor para buscar..."
                sx={{ flex: 1 }}
                size="small"
              />

              {filters.length > 1 && (
                <IconButton
                  onClick={() => handleRemoveFilter(index)}
                  color="error"
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddFilter}
            variant="outlined"
            size="small"
          >
            Adicionar Filtro
          </Button>

          {filters.some(f => f.key && f.value) && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="caption" color="text.secondary">
                Filtros ativos:
              </Typography>
              {filters
                .filter(f => f.key && f.value)
                .map((filter, index) => (
                  <Chip
                    key={index}
                    label={`${getFieldLabel(filter.key)}: ${filter.value}`}
                    size="small"
                    variant="outlined"
                  />
                ))}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={handleClear} color="inherit">
          Limpar
        </Button>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSearch}
          variant="contained"
          disabled={!filters.some(f => f.key && f.value.trim())}
        >
          Buscar
        </Button>
      </DialogActions>
    </Dialog>
  );
}