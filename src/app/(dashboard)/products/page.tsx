import { Box, Card, CardContent, CardHeader, Typography } from "@mui/material";
import { Suspense } from "react";
import { DummyProduct } from "@/types";
import { ProductsStats, ProductsTable } from "./components";
import { ProductsFiltersClient } from "./components/ProductsFiltersClient";
import {
  getProductsData,
  searchProducts,
  searchProductsByCategory,
  searchProductsByName,
} from "./lib/products-data";

// export const metadata: Metadata = {
//   title: "Produtos",
//   description: "Gerenciamento de produtos do sistema",
// };

interface ProductsPageProps {
  searchParams: {
    search?: string;
    category?: string;
    page?: string;
    limit?: string;
  };
}

/**
 * Página de produtos com Server-Side Rendering
 * Carrega dados diretamente no servidor e aplica filtros via URL
 */
export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  // Extrair parâmetros de busca
  const searchTerm = searchParams.search || "";
  const categoryFilter = searchParams.category || "";
  const page = parseInt(searchParams.page || "1", 10);
  const limit = parseInt(searchParams.limit || "30", 10);

  // Buscar dados no servidor aplicando filtros
  let products: DummyProduct[] = [];
  let total = 0;

  try {
    if (categoryFilter && searchTerm) {
      // Busca combinada: categoria + termo de busca
      const result = await searchProducts(
        searchTerm,
        categoryFilter,
        page,
        limit
      );
      products = result.products;
      total = result.total;
    } else if (categoryFilter) {
      // Busca apenas por categoria
      const result = await searchProductsByCategory(
        categoryFilter,
        page,
        limit
      );
      products = result.products;
      total = result.total;
    } else if (searchTerm) {
      // Busca apenas por termo
      const result = await searchProductsByName(searchTerm, page, limit);
      products = result.products;
      total = result.total;
    } else {
      // Busca todos os produtos
      const data = await getProductsData();
      products = data.products;
      total = data.total;
    }
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    // Fallback para dados básicos
    const data = await getProductsData();
    products = data.products;
    total = data.total;
  }

  // Buscar estatísticas e categorias separadamente
  const { stats, categories } = await getProductsData();
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Produtos
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Visualize os produtos cadastrados no sistema.
      </Typography>

      {/* Estatísticas dos Produtos */}
      <ProductsStats stats={stats} />

      {/* Card Principal */}
      <Card>
        <CardHeader
          title={
            <Typography variant="h5" fontWeight="bold">
              Produtos ({total})
            </Typography>
          }
          subheader="Lista de produtos disponíveis no sistema"
        />
        <CardContent>
          {/* Filtros - Componente Client-side para interatividade */}
          <Suspense fallback={<Box sx={{ p: 3, bgcolor: "background.paper", borderRadius: 2, border: 1, borderColor: "divider", mb: 3 }}><Typography>Carregando filtros...</Typography></Box>}>
            <ProductsFiltersClient
              searchTerm={searchParams.search || ""}
              categoryFilter={searchParams.category || ""}
              categories={categories}
            />
          </Suspense>

          {/* Tabela de Produtos */}
          <ProductsTable products={products} isLoading={false} error={null} />
        </CardContent>
      </Card>
    </Box>
  );
}
