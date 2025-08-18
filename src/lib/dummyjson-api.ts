import {
  DummyProduct,
  DummyResponse,
  DummyUser,
  FilterOptions,
  LoginRequest,
  PaginatedResponse,
  RefreshRequest,
  type DummyLoginResponse,
} from "@/types";
import type {
  DummyCart,
  DummyCartsResponse,
  DummyCategory,
} from "@/types/dummyjson";

const BASE_URL = "https://dummyjson.com";

// Token management
class TokenManager {
  private static TOKEN_KEY = "dummyjson-token";
  private static REFRESH_TOKEN_KEY = "dummyjson-refresh-token";
  private static USER_KEY = "dummyjson-user";

  static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  static setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  static getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  static setRefreshToken(refreshToken: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  static getUser(): DummyUser | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  static setUser(user: DummyUser): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  static clearAll(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }
}

// HTTP Client with automatic token handling
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = TokenManager.getToken();

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;

        try {
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.message || errorMessage;
        } catch {
          errorMessage = errorData || errorMessage;
        }

        throw new ApiError(errorMessage, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        `Network error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

// Custom ApiError class
class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// API Client instance
const apiClient = new ApiClient(BASE_URL);

// Data transformation utilities removed - using DummyProduct directly

// Authentication Service
export class AuthService {
  static async login(credentials: LoginRequest): Promise<DummyLoginResponse> {
    const response = await apiClient.post<DummyLoginResponse>(
      "/auth/login",
      credentials
    );

    // Store tokens and user data
    TokenManager.setToken(response.accessToken);
    TokenManager.setRefreshToken(response.refreshToken);

    // Store user data directly from response
    const user: DummyUser = {
      id: response.id,
      firstName: response.firstName,
      lastName: response.lastName,
      maidenName: "", // Default empty maiden name
      email: response.email,
      username: response.username,
      password: "", // Default empty password
      image: response.image,
      phone: "", // Default empty phone
      age: 0, // Default age
      gender: "male", // Default gender
      birthDate: new Date().toISOString(),
      address: {
        address: "",
        city: "",
        state: "",
        stateCode: "",
        postalCode: "",
        coordinates: { lat: 0, lng: 0 },
        country: "",
      },
      company: {
        department: "",
        name: "",
        title: "",
        address: {
          address: "",
          city: "",
          state: "",
          stateCode: "",
          postalCode: "",
          coordinates: { lat: 0, lng: 0 },
          country: "",
        },
      },
      bank: {
        cardExpire: "",
        cardNumber: "",
        cardType: "",
        currency: "",
        iban: "",
      },
      macAddress: "",
      university: "",
      ip: "",
      userAgent: "",
      crypto: {
        coin: "",
        wallet: "",
        network: "",
      },
      role: "user",
      ein: "",
      ssn: "",
      bloodGroup: "",
      height: 0,
      weight: 0,
      eyeColor: "",
      hair: {
        color: "",
        type: "",
      },
    };

    TokenManager.setUser(user);

    return response;
  }

  static async getCurrentUser(): Promise<DummyUser> {
    const dummyUser = await apiClient.get<DummyUser>("/auth/me");
    TokenManager.setUser(dummyUser);
    return dummyUser;
  }

  static async refreshToken(
    request?: RefreshRequest
  ): Promise<DummyLoginResponse> {
    const refreshToken =
      request?.refreshToken || TokenManager.getRefreshToken();
    const response = await apiClient.post<DummyLoginResponse>("/auth/refresh", {
      refreshToken,
      expiresInMins: request?.expiresInMins,
    });

    TokenManager.setToken(response.accessToken);
    TokenManager.setRefreshToken(response.refreshToken);

    return response;
  }

  static logout(): void {
    TokenManager.clearAll();
  }

  static isAuthenticated(): boolean {
    return !!TokenManager.getToken();
  }

  static getStoredUser(): DummyUser | null {
    return TokenManager.getUser();
  }
}

// Users Service
export class DummyUsersService {
  async getUsers(
    filters?: FilterOptions
  ): Promise<PaginatedResponse<DummyUser>> {
    const limit = filters?.pageSize || 30;
    const skip = filters?.page ? (filters.page - 1) * limit : 0;

    let endpoint = `/users?limit=${limit}&skip=${skip}`;

    // Add search if provided
    if (filters?.search) {
      endpoint = `/users/search?q=${encodeURIComponent(
        filters.search
      )}&limit=${limit}&skip=${skip}`;
    }

    const response = await apiClient.get<DummyResponse<DummyUser>>(endpoint);

    let dummyUsers = response.users || [];

    // Apply role filter (client-side since DummyJSON doesn't support role filtering)
    if (filters?.role) {
      dummyUsers = dummyUsers.filter((user) => user.role === filters.role);
    }

    // Apply sorting (client-side)
    if (filters?.sortBy) {
      dummyUsers.sort((a, b) => {
        const aValue = a[filters.sortBy as keyof DummyUser] as string;
        const bValue = b[filters.sortBy as keyof DummyUser] as string;

        if (filters.sortOrder === "desc") {
          return bValue.localeCompare(aValue);
        }
        return aValue.localeCompare(bValue);
      });
    }

    return {
      data: dummyUsers,
      total: response.total,
      page: Math.floor(skip / limit) + 1,
      pageSize: limit,
      totalPages: Math.ceil(response.total / limit),
    };
  }

  async getUserById(id: string): Promise<DummyUser | null> {
    try {
      const dummyUser = await apiClient.get<DummyUser>(`/users/${id}`);
      return dummyUser;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async createUser(userData: Omit<DummyUser, "id">): Promise<DummyUser> {
    const response = await apiClient.post<DummyUser>("/users/add", userData);
    return response;
  }

  async updateUser(
    id: string,
    userData: Partial<DummyUser>
  ): Promise<DummyUser> {
    const response = await apiClient.put<DummyUser>(`/users/${id}`, userData);
    return response;
  }

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }
}

// Products Service
export class DummyProductsService {
  async getProducts(
    filters?: FilterOptions
  ): Promise<PaginatedResponse<DummyProduct>> {
    const limit = filters?.pageSize || 30;
    const skip = filters?.page ? (filters.page - 1) * limit : 0;

    let endpoint = `/products?limit=${limit}&skip=${skip}`;

    // Add search if provided
    if (filters?.search) {
      endpoint = `/products/search?q=${encodeURIComponent(
        filters.search
      )}&limit=${limit}&skip=${skip}`;
    }

    // Add category filter
    if (filters?.category && !filters?.search) {
      endpoint = `/products/category/${encodeURIComponent(
        filters.category
      )}?limit=${limit}&skip=${skip}`;
    }

    // Add sorting
    if (filters?.sortBy && filters?.sortOrder) {
      endpoint += `&sortBy=${filters.sortBy}&order=${filters.sortOrder}`;
    }

    const response = await apiClient.get<DummyResponse<DummyProduct>>(endpoint);

    const products = response.products || [];

    return {
      data: products,
      total: response.total,
      page: Math.floor(skip / limit) + 1,
      pageSize: limit,
      totalPages: Math.ceil(response.total / limit),
    };
  }

  async getProductById(id: string): Promise<DummyProduct | null> {
    try {
      const dummyProduct = await apiClient.get<DummyProduct>(`/products/${id}`);
      return dummyProduct;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async createProduct(
    productData: Omit<DummyProduct, "id">
  ): Promise<DummyProduct> {
    const response = await apiClient.post<DummyProduct>(
      "/products/add",
      productData
    );
    return response;
  }

  async updateProduct(
    id: string,
    productData: Partial<DummyProduct>
  ): Promise<DummyProduct> {
    const response = await apiClient.put<DummyProduct>(
      `/products/${id}`,
      productData
    );
    return response;
  }

  async deleteProduct(id: string): Promise<DummyProduct> {
    const response = await apiClient.delete<DummyProduct>(`/products/${id}`);
    return response;
  }

  async getCategories(): Promise<string[]> {
    const categoriesResponse = await apiClient.get<DummyCategory[]>(
      "/products/categories"
    );
    // Extract just the names from the category objects
    return categoriesResponse.map((category) => category.name);
  }
}

// Carts Service
export class DummyCartsService {
  /**
   * Busca todos os carrinhos da API DummyJSON
   * @param filters - Opções de filtro para paginação
   * @returns Promise com dados paginados de carrinhos
   */
  async getCarts(
    filters?: FilterOptions
  ): Promise<PaginatedResponse<DummyCart>> {
    const limit = filters?.pageSize || 30;
    const skip = filters?.page ? (filters.page - 1) * limit : 0;

    const endpoint = `/carts?limit=${limit}&skip=${skip}`;
    const response = await apiClient.get<DummyCartsResponse>(endpoint);

    return {
      data: response.carts || [],
      total: response.total,
      page: Math.floor(skip / limit) + 1,
      pageSize: limit,
      totalPages: Math.ceil(response.total / limit),
    };
  }

  /**
   * Busca carrinho por ID
   * @param id - ID do carrinho
   * @returns Promise com dados do carrinho ou null se não encontrado
   */
  async getCartById(id: string): Promise<DummyCart | null> {
    try {
      const cart = await apiClient.get<DummyCart>(`/carts/${id}`);
      return cart;
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
   */
  async getCartsByUser(userId: string): Promise<DummyCartsResponse> {
    try {
      const response = await apiClient.get<DummyCartsResponse>(
        `/carts/user/${userId}`
      );
      return response;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return { carts: [], total: 0, skip: 0, limit: 10 };
      }
      throw error;
    }
  }

  /**
   * Calcula estatísticas de vendas baseadas nos carrinhos
   * @returns Promise com dados de vendas calculados
   */
  async getSalesStats(): Promise<{
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    totalQuantity: number;
    averageOrderValue: number;
  }> {
    const response = await apiClient.get<DummyCartsResponse>(
      "/carts?limit=100"
    );
    const carts = response.carts || [];

    const totalOrders = carts.length;
    const totalSales = carts.reduce(
      (sum, cart) => sum + cart.discountedTotal,
      0
    );
    const totalProducts = carts.reduce(
      (sum, cart) => sum + cart.totalProducts,
      0
    );
    const totalQuantity = carts.reduce(
      (sum, cart) => sum + cart.totalQuantity,
      0
    );
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return {
      totalSales,
      totalOrders,
      totalProducts,
      totalQuantity,
      averageOrderValue,
    };
  }
}

export { ApiError, TokenManager };
