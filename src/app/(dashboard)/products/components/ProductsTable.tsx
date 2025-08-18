"use client";

import { ProductDetailDialog } from "@/components/ui/ProductDetailDialog";
import { DummyProduct } from "@/types";
import { Visibility } from "@mui/icons-material";
import {
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

interface ProductsTableProps {
  products: DummyProduct[];
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Componente de tabela de produtos
 * Exibe lista de produtos com paginação e ação de visualizar detalhes
 */
export function ProductsTable({
  products,
  isLoading = false,
  error = null,
}: ProductsTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedProduct, setSelectedProduct] = useState<DummyProduct | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  /**
   * Aplica paginação aos produtos
   */
  const paginatedProducts = products.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  /**
   * Abre o diálogo de detalhes do produto
   */
  const handleViewDetails = (product: DummyProduct) => {
    setSelectedProduct(product);
    setDetailDialogOpen(true);
  };

  /**
   * Fecha o diálogo de detalhes
   */
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedProduct(null);
  };

  /**
   * Formata o preço para exibição
   */
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  /**
   * Retorna a cor do chip baseado no estoque
   */
  const getStockChipColor = (stock: number) => {
    if (stock === 0) return "error";
    if (stock <= 10) return "warning";
    return "success";
  };

  /**
   * Retorna o texto do status do estoque
   */
  const getStockStatus = (stock: number) => {
    if (stock === 0) return "Fora de Estoque";
    if (stock <= 10) return "Estoque Baixo";
    return "Em Estoque";
  };

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Produto</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Preço</TableCell>
              <TableCell>Estoque</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              // Enhanced loading state with multiple skeleton rows
              Array.from(new Array(5)).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          bgcolor: "action.hover",
                          "@keyframes pulse": {
                            "0%": { opacity: 1 },
                            "50%": { opacity: 0.5 },
                            "100%": { opacity: 1 }
                          },
                          animation: "pulse 1.5s ease-in-out infinite",
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Carregando produtos...
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell><Box sx={{ width: 80, height: 20, bgcolor: "action.hover", borderRadius: 1 }} /></TableCell>
                  <TableCell><Box sx={{ width: 60, height: 20, bgcolor: "action.hover", borderRadius: 1 }} /></TableCell>
                  <TableCell><Box sx={{ width: 100, height: 20, bgcolor: "action.hover", borderRadius: 1 }} /></TableCell>
                  <TableCell align="center"><Box sx={{ width: 80, height: 20, bgcolor: "action.hover", borderRadius: 1, mx: "auto" }} /></TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ 
                    color: "error.main",
                    py: 4,
                  }}
                >
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    <Typography variant="body1" color="error.main" fontWeight="medium">
                      Erro ao carregar produtos
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tente recarregar a página ou entre em contato com o suporte
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={5} 
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    <Typography variant="body1" color="text.secondary" fontWeight="medium">
                      Nenhum produto encontrado
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Tente ajustar os filtros de busca ou limpar os filtros
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {product.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {product.id}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                      color="primary"
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {formatPrice(product.price)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={getStockStatus(product.stock)}
                        color={getStockChipColor(product.stock)}
                        size="small"
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        ({product.stock} unidades)
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver detalhes">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(product)}
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
        count={products.length}
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
      <ProductDetailDialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        product={selectedProduct}
      />
    </>
  );
}