import {
  ApiError,
  DummyProductsService,
  DummyUsersService,
  DummyCartsService,
} from "@/lib/dummyjson-api";
import {
  FilterOptions,
  PaginatedResponse,
  type DummyProduct,
  type DummyUser,
} from "@/types";
import {
  type DummyCart,
  type DummyCartsResponse,
} from "@/types/dummyjson";

/**
 * Cache simples para dados que raramente mudam
 */
class SimpleCache {
  private static cache = new Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  >();

  static set<T>(key: string, data: T, ttlMinutes: number = 30): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    });
  }

  static get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  static clear(): void {
    this.cache.clear();
  }
}

/**
 * Serviço para gerenciamento de usuários usando DummyJSON API
 * Operações somente leitura devido às limitações da API
 */
export class UsersService {
  private static usersService = new DummyUsersService();
  /**
   * Busca lista paginada de usuários com filtros opcionais
   * @param filters - Opções de filtro e paginação
   * @returns Promise com resposta paginada contendo usuários
   * @throws {ApiError} Quando ocorre erro na API
   * @throws {Error} Para outros tipos de erro
   */
  static async getUsers(
    filters?: FilterOptions
  ): Promise<PaginatedResponse<DummyUser>> {
    try {
      // Validação básica dos filtros
      if (filters?.limit !== undefined && (filters.limit < 1 || filters.limit > 100)) {
        throw new Error("Limite deve estar entre 1 e 100");
      }

      if (filters?.skip && filters.skip < 0) {
        throw new Error("Skip deve ser maior ou igual a 0");
      }

      return await this.usersService.getUsers(filters);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca um usuário específico por ID
   * @param id - ID único do usuário
   * @returns Promise com o usuário encontrado ou null se não existir
   * @throws {Error} Quando ID é inválido ou ocorre erro na API
   */
  static async getUserById(id: string): Promise<DummyUser | null> {
    try {
      // Validação do ID
      if (!id || typeof id !== "string" || id.trim().length === 0) {
        throw new Error(
          "ID do usuário é obrigatório e deve ser uma string válida"
        );
      }

      return await this.usersService.getUserById(id.trim());
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }

      throw error;
    }
  }
}

/**
 * Serviço para gerenciamento de produtos usando DummyJSON API
 * Inclui operações CRUD completas e cache para categorias
 */
export class ProductsService {
  private static readonly CATEGORIES_CACHE_KEY = "product_categories";
  private static readonly CATEGORIES_CACHE_TTL = 60; // 60 minutos
  private static productsService = new DummyProductsService();

  /**
   * Busca lista paginada de produtos com filtros opcionais
   * @param filters - Opções de filtro e paginação
   * @returns Promise com resposta paginada contendo produtos
   * @throws {ApiError} Quando ocorre erro na API
   * @throws {Error} Para outros tipos de erro
   */
  static async getProducts(
    filters?: FilterOptions
  ): Promise<PaginatedResponse<DummyProduct>> {
    try {
      // Validação básica dos filtros
      if (filters?.limit !== undefined && (filters.limit < 1 || filters.limit > 100)) {
        throw new Error("Limite deve estar entre 1 e 100");
      }

      if (filters?.skip && filters.skip < 0) {
        throw new Error("Skip deve ser maior ou igual a 0");
      }

      return await this.productsService.getProducts(filters);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca um produto específico por ID
   * @param id - ID único do produto
   * @returns Promise com o produto encontrado ou null se não existir
   * @throws {Error} Quando ID é inválido ou ocorre erro na API
   */
  static async getProductById(id: string): Promise<DummyProduct | null> {
    try {
      // Validação do ID
      if (!id || typeof id !== "string" || id.trim().length === 0) {
        throw new Error(
          "ID do produto é obrigatório e deve ser uma string válida"
        );
      }

      return await this.productsService.getProductById(id.trim());
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }

      throw error;
    }
  }

  /**
   * Busca todas as categorias de produtos disponíveis
   * Utiliza cache para melhorar performance, já que categorias raramente mudam
   * @returns Promise com array de categorias
   * @throws {Error} Quando ocorre erro na API
   */
  static async getCategories(): Promise<string[]> {
    try {
      // Verifica se existe no cache
      const cachedCategories = SimpleCache.get<string[]>(
        this.CATEGORIES_CACHE_KEY
      );
      if (cachedCategories) {
        return cachedCategories;
      }

      // Busca da API e armazena no cache
      const categories = await this.productsService.getCategories();
      SimpleCache.set(
        this.CATEGORIES_CACHE_KEY,
        categories,
        this.CATEGORIES_CACHE_TTL
      );

      return categories;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Limpa o cache de categorias
   * Útil quando se sabe que as categorias foram alteradas
   */
  static clearCategoriesCache(): void {
    SimpleCache.clear();
  }
}

/**
 * Serviço para gerenciamento de carrinhos usando DummyJSON API
 * Inclui operações de leitura e cálculo de estatísticas de vendas
 */
export class CartsService {
  private static cartsService = new DummyCartsService();

  /**
   * Busca lista paginada de carrinhos com filtros opcionais
   * @param filters - Opções de filtro e paginação
   * @returns Promise com resposta paginada contendo carrinhos
   * @throws {ApiError} Quando ocorre erro na API
   * @throws {Error} Para outros tipos de erro
   */
  static async getCarts(
    filters?: FilterOptions
  ): Promise<PaginatedResponse<DummyCart>> {
    try {
      // Validação básica dos filtros
      if (filters?.limit !== undefined && (filters.limit < 1 || filters.limit > 100)) {
        throw new Error("Limite deve estar entre 1 e 100");
      }

      if (filters?.skip && filters.skip < 0) {
        throw new Error("Skip deve ser maior ou igual a 0");
      }

      return await this.cartsService.getCarts(filters);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca um carrinho específico por ID
   * @param id - ID único do carrinho
   * @returns Promise com o carrinho encontrado ou null se não existir
   * @throws {Error} Quando ID é inválido ou ocorre erro na API
   */
  static async getCartById(id: string): Promise<DummyCart | null> {
    try {
      // Validação do ID
      if (!id || typeof id !== "string" || id.trim().length === 0) {
        throw new Error(
          "ID do carrinho é obrigatório e deve ser uma string válida"
        );
      }

      return await this.cartsService.getCartById(id.trim());
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }

      throw error;
    }
  }

  /**
   * Busca carrinhos por usuário
   * @param userId - ID do usuário
   * @returns Promise com dados dos carrinhos do usuário
   * @throws {Error} Quando userId é inválido ou ocorre erro na API
   */
  static async getCartsByUser(userId: string): Promise<DummyCartsResponse> {
    try {
      // Validação do userId
      if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
        throw new Error(
          "ID do usuário é obrigatório e deve ser uma string válida"
        );
      }

      return await this.cartsService.getCartsByUser(userId.trim());
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calcula estatísticas de vendas baseadas nos carrinhos
   * @returns Promise com dados de vendas calculados
   * @throws {Error} Quando ocorre erro na API ou no cálculo
   */
  static async getSalesStats(): Promise<{
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    totalQuantity: number;
    averageOrderValue: number;
  }> {
    try {
      return await this.cartsService.getSalesStats();
    } catch (error) {
      throw error;
    }
  }

}
