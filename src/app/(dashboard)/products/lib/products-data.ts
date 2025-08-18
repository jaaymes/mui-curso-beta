import { ProductsService } from "@/lib/dataService";
import type { DummyResponse, DummyProduct } from "@/types";

/**
 * Products Data Module
 *
 * Este módulo fornece funções para buscar dados de produtos diretamente das APIs
 * sem qualquer mecanismo de cache, garantindo dados sempre atualizados.
 *
 * Características:
 * - Requisições diretas às APIs
 * - Busca paralela para melhor performance
 * - Tratamento robusto de erros com fallbacks
 * - Dados sempre atualizados
 */

// Tipos específicos para dados de produtos
export interface ProductsStats {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalProductsTrend: number;
  activeProductsTrend: number;
  lowStockProductsTrend: number;
  outOfStockProductsTrend: number;
  averagePrice: number;
  totalValue: number;
}

export interface ProductsData {
  products: DummyProduct[];
  stats: ProductsStats;
  total: number;
  categories: string[];
}

// Interface para filtros de busca avançada
export interface AdvancedSearchFilter {
  key: string;
  value: string;
}

// Mapeamento de campos de busca disponíveis
// NOTA: Funcionalidade de filtro por estoque foi removida para simplificar a interface do usuário
// e focar apenas em filtros de categoria, que são mais relevantes para a experiência de navegação.
// O estoque é melhor gerenciado através de relatórios específicos e alertas automáticos.
export const SEARCH_FIELDS = {
  title: "title", // Busca por título
  description: "description", // Busca por descrição
  category: "category", // Busca por categoria - filtro principal mantido
  brand: "brand", // Busca por marca
  price: "price", // Busca por preço
  rating: "rating", // Busca por avaliação
  tags: "tags", // Busca por tags
} as const;

/**
 * Função para buscar produtos por categoria
 * Utiliza o endpoint /products/category/{category}
 * Exemplo: https://dummyjson.com/products/category/smartphones
 */
export async function searchProductsByCategory(
  category: string,
  page: number = 1,
  pageSize: number = 30
): Promise<{ products: DummyProduct[]; total: number }> {
  try {
    const limit = pageSize;
    const skip = (page - 1) * limit;

    // Construir endpoint para busca por categoria
    const endpoint = `/products/category/${encodeURIComponent(
      category
    )}?limit=${limit}&skip=${skip}`;

    // Fazer requisição direta à API DummyJSON
    const response = await fetch(`https://dummyjson.com${endpoint}`);

    if (!response.ok) {
      throw new Error(`Erro na busca por categoria: ${response.status}`);
    }

    const data: DummyResponse<DummyProduct> = await response.json();

    // Retornar dados diretamente sem transformação
    const products = data.products || [];

    return {
      products,
      total: data.total || 0,
    };
  } catch (error) {
    console.error("Erro na busca por categoria:", error);
    return {
      products: [],
      total: 0,
    };
  }
}

/**
 * Função para buscar produtos por nome/termo
 * Utiliza o endpoint /products/search?q={termo}
 * Exemplo: https://dummyjson.com/products/search?q=phone
 */
export async function searchProductsByName(
  searchTerm: string,
  page: number = 1,
  pageSize: number = 30
): Promise<{ products: DummyProduct[]; total: number }> {
  try {
    const limit = pageSize;
    const skip = (page - 1) * limit;

    // Construir endpoint para busca por nome/termo
    const endpoint = `/products/search?q=${encodeURIComponent(
      searchTerm
    )}&limit=${limit}&skip=${skip}`;

    // Fazer requisição direta à API DummyJSON
    const response = await fetch(`https://dummyjson.com${endpoint}`);

    if (!response.ok) {
      throw new Error(`Erro na busca por nome: ${response.status}`);
    }

    const data: DummyResponse<DummyProduct> = await response.json();

    // Retornar dados diretamente sem transformação
    const products = data.products || [];

    return {
      products,
      total: data.total || 0,
    };
  } catch (error) {
    console.error("Erro na busca por nome:", error);
    return {
      products: [],
      total: 0,
    };
  }
}

/**
 * Função para busca avançada usando filtros específicos da API DummyJSON
 * Utiliza as funções específicas baseadas no tipo de filtro
 */
export async function searchProductsByFilter(
  filter: AdvancedSearchFilter,
  page: number = 1,
  pageSize: number = 30
): Promise<{ products: DummyProduct[]; total: number }> {
  try {
    // Usar função específica baseada no tipo de filtro
    if (filter.key === 'category') {
      return await searchProductsByCategory(filter.value, page, pageSize);
    } else if (filter.key === 'title' || filter.key === 'name') {
      return await searchProductsByName(filter.value, page, pageSize);
    } else {
      // Para outros tipos de busca, usar busca por nome como fallback
      return await searchProductsByName(filter.value, page, pageSize);
    }
  } catch (error) {
    console.error("Erro na busca avançada de produtos:", error);
    return {
      products: [],
      total: 0,
    };
  }
}

/**
 * Função de busca unificada que combina busca por categoria e por nome
 * Primeiro tenta buscar por categoria, depois por nome se necessário
 */
export async function searchProducts(
  searchTerm: string,
  category?: string,
  page: number = 1,
  pageSize: number = 30
): Promise<{ products: DummyProduct[]; total: number }> {
  try {
    // Se categoria for especificada, buscar por categoria
    if (category && category.trim() !== '') {
      return await searchProductsByCategory(category, page, pageSize);
    }

    // Se termo de busca for especificado, buscar por nome
    if (searchTerm && searchTerm.trim() !== '') {
      return await searchProductsByName(searchTerm, page, pageSize);
    }

    // Se nenhum filtro for especificado, retornar todos os produtos
    const allProductsResponse = await getAllProducts();
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = allProductsResponse.data.slice(startIndex, endIndex);

    return {
      products: paginatedProducts,
      total: allProductsResponse.total,
    };
  } catch (error) {
    console.error("Erro na busca unificada de produtos:", error);
    return {
      products: [],
      total: 0,
    };
  }
}

/**
 * Função para busca múltipla com vários filtros
 * Permite combinar diferentes critérios de busca
 */
export async function searchProductsWithMultipleFilters(
  filters: AdvancedSearchFilter[],
  page: number = 1,
  pageSize: number = 30
): Promise<{ products: DummyProduct[]; total: number }> {
  try {
    // Separar filtros por tipo para otimizar as buscas
    const categoryFilters = filters.filter(f => f.key === 'category');
    const nameFilters = filters.filter(f => f.key === 'title' || f.key === 'name');
    const otherFilters = filters.filter(f => f.key !== 'category' && f.key !== 'title' && f.key !== 'name');

    const searchPromises: Promise<{ products: DummyProduct[]; total: number }>[] = [];

    // Buscar por categorias
    categoryFilters.forEach(filter => {
      searchPromises.push(searchProductsByCategory(filter.value, 1, 100));
    });

    // Buscar por nomes
    nameFilters.forEach(filter => {
      searchPromises.push(searchProductsByName(filter.value, 1, 100));
    });

    // Buscar outros filtros usando busca por nome como fallback
    otherFilters.forEach(filter => {
      searchPromises.push(searchProductsByName(filter.value, 1, 100));
    });

    const results = await Promise.all(searchPromises);

    // Combinar e deduplificar resultados
    const allProducts = results.flatMap((result) => result.products);
    const uniqueProducts = allProducts.filter(
      (product, index, self) => index === self.findIndex((p) => p.id === product.id)
    );

    // Aplicar paginação aos resultados combinados
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = uniqueProducts.slice(startIndex, endIndex);

    return {
      products: paginatedProducts,
      total: uniqueProducts.length,
    };
  } catch (error) {
    console.error("Erro na busca múltipla de produtos:", error);
    return {
      products: [],
      total: 0,
    };
  }
}

// Função de transformação removida - usando DummyProduct diretamente

/**
 * Função principal para buscar todos os dados de produtos
 * Faz requisições diretas às APIs sem cache
 * Usa Promise.allSettled para resiliência a falhas parciais
 */
export async function getProductsData(): Promise<ProductsData> {
  try {
    // Busca paralela com tratamento robusto de erros
    const results = await Promise.allSettled([
      getAllProducts(),
      getProductsStats(),
      getCategories(),
    ]);

    // Extrai dados ou usa fallbacks em caso de erro
    const [productsResult, statsResult, categoriesResult] = results;

    const productsData =
      productsResult.status === "fulfilled"
        ? productsResult.value
        : { data: [], total: 0 };

    const stats =
      statsResult.status === "fulfilled"
        ? statsResult.value
        : {
            totalProducts: 0,
            activeProducts: 0,
            lowStockProducts: 0,
            outOfStockProducts: 0,
            totalProductsTrend: 0,
            activeProductsTrend: 0,
            lowStockProductsTrend: 0,
            outOfStockProductsTrend: 0,
            averagePrice: 0,
            totalValue: 0,
          };

    const categories =
      categoriesResult.status === "fulfilled"
        ? categoriesResult.value
        : [];

    return {
      products: productsData.data,
      stats,
      total: productsData.total,
      categories,
    };
  } catch (error) {
    console.error("Erro ao buscar dados de produtos:", error);

    // Retorna dados vazios em caso de erro crítico
    return {
      products: [],
      stats: {
        totalProducts: 0,
        activeProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        totalProductsTrend: 0,
        activeProductsTrend: 0,
        lowStockProductsTrend: 0,
        outOfStockProductsTrend: 0,
        averagePrice: 0,
        totalValue: 0,
      },
      total: 0,
      categories: [],
    };
  }
}

/**
 * Busca todos os produtos usando o ProductsService
 * Sem cache, sempre dados atualizados
 */
async function getAllProducts(): Promise<{ data: DummyProduct[]; total: number }> {
  try {
    const response = await ProductsService.getProducts({ pageSize: 100 });
    return {
      data: response.data,
      total: response.total,
    };
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return { data: [], total: 0 };
  }
}

/**
 * Calcula estatísticas dos produtos baseado nos dados reais
 * Gera métricas úteis para o dashboard
 */
async function getProductsStats(): Promise<ProductsStats> {
  try {
    // Buscar todos os produtos para calcular estatísticas
    const response = await ProductsService.getProducts({ pageSize: 100 });
    const products = response.data;

    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.stock > 0).length;
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock < 10).length;
    const outOfStockProducts = products.filter(p => p.stock === 0).length;

    // Calcular preço médio e valor total
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
    const averagePrice = totalProducts > 0 ? products.reduce((sum, product) => sum + product.price, 0) / totalProducts : 0;

    // Simular trends (em um cenário real, seria comparado com dados históricos)
    const totalProductsTrend = Math.floor(Math.random() * 20) - 10; // -10 a +10
    const activeProductsTrend = Math.floor(Math.random() * 15) - 5; // -5 a +10
    const lowStockProductsTrend = Math.floor(Math.random() * 10) - 5; // -5 a +5
    const outOfStockProductsTrend = Math.floor(Math.random() * 8) - 4; // -4 a +4

    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalProductsTrend,
      activeProductsTrend,
      lowStockProductsTrend,
      outOfStockProductsTrend,
      averagePrice: Math.round(averagePrice * 100) / 100, // Arredondar para 2 casas decimais
      totalValue: Math.round(totalValue * 100) / 100,
    };
  } catch (error) {
    console.error("Erro ao calcular estatísticas de produtos:", error);
    return {
      totalProducts: 0,
      activeProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      totalProductsTrend: 0,
      activeProductsTrend: 0,
      lowStockProductsTrend: 0,
      outOfStockProductsTrend: 0,
      averagePrice: 0,
      totalValue: 0,
    };
  }
}

/**
 * Busca todas as categorias disponíveis
 */
async function getCategories(): Promise<string[]> {
  try {
    return await ProductsService.getCategories();
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return [];
  }
}

/**
 * Busca um produto específico por ID
 */
export async function getProductById(id: string): Promise<DummyProduct | null> {
  try {
    return await ProductsService.getProductById(id);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return null;
  }
}

/**
 * Filtra produtos baseado em critérios de busca
 * Usado para filtros client-side após carregamento inicial
 * 
 * NOTA: Filtros de estoque foram removidos desta função para simplificar a lógica de filtros.
 * Rationale para remoção:
 * - Filtros de estoque são melhor gerenciados através de dashboards específicos
 * - Reduz complexidade da interface de usuário
 * - Melhora performance ao eliminar verificações desnecessárias
 * - Foco em filtros mais relevantes para descoberta de produtos (categoria e busca textual)
 */
export function filterProducts(
  products: DummyProduct[],
  searchTerm: string = "",
  categoryFilter: string = ""
): DummyProduct[] {
  return products.filter((product) => {
    const matchesSearch = !searchTerm || 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
}

/**
 * Pagina produtos para exibição
 * Usado para paginação client-side
 */
export function paginateProducts(
  products: DummyProduct[],
  page: number = 0,
  limit: number = 10
): DummyProduct[] {
  const startIndex = page * limit;
  return products.slice(startIndex, startIndex + limit);
}