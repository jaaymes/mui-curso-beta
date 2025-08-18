"use client";

import { type DummyProduct } from "@/types";
import {
  AttachMoney,
  Category,
  Close,
  Description,
  Image,
  Inventory,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";

interface ProductDetailDialogProps {
  open: boolean;
  onClose: () => void;
  product: DummyProduct | null;
}

/**
 * Componente de diálogo para visualização detalhada dos dados do produto
 * Baseado no UserDetailDialog, adaptado para mostrar informações de produtos
 */
export function ProductDetailDialog({
  open,
  onClose,
  product,
}: ProductDetailDialogProps) {
  if (!product) return null;

  /**
   * Determina a cor do chip de estoque baseado na quantidade
   */
  const getStockColor = (stock: number) => {
    if (stock === 0) return "error";
    if (stock < 10) return "warning";
    return "success";
  };

  /**
   * Formata o preço para exibição em reais
   */
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      data-testid="product-detail-dialog"
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Detalhes do Produto
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          data-testid="close-dialog-button"
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Header com Imagem e Informações Básicas */}
          <Box display="flex" alignItems="center" gap={3}>
            <Box
              component="img"
              src={product.images[0]}
              alt={`Imagem do produto ${product.title}`}
              sx={{
                width: 120,
                height: 120,
                borderRadius: 2,
                objectFit: "cover",
                bgcolor: "grey.100",
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
            <Box flex={1}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {product.title}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <AttachMoney fontSize="small" color="action" />
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                  {formatPrice(product.price)}
                </Typography>
              </Box>
              <Chip
                label={`${product.stock} em estoque`}
                color={
                  getStockColor(product.stock) as
                    | "success"
                    | "warning"
                    | "error"
                }
                size="medium"
                variant="outlined"
              />
            </Box>
          </Box>

          <Divider />

          {/* Informações Detalhadas */}
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Category color="action" />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Categoria
                </Typography>
                <Typography variant="body1">
                  {product.category.charAt(0).toUpperCase() +
                    product.category.slice(1)}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
              <Description color="action" sx={{ mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Descrição
                </Typography>
                <Typography variant="body1">
                  {product.description || "Não informado"}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Inventory color="action" />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Estoque Disponível
                </Typography>
                <Typography variant="body1">
                  {product.stock} unidades
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Image color="action" />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  ID do Produto
                </Typography>
                <Typography variant="body1">#{product.id}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={onClose} variant="contained" fullWidth>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
