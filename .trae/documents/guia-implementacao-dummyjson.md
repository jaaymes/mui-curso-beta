# Guia de Implementação - Integração DummyJSON

## 1. Visão Geral da Implementação

Este guia detalha a implementação completa para substituir os dados mockados pela integração real com a API DummyJSON, incluindo autenticação JWT, operações CRUD e gerenciamento de estado.

## 2. Estrutura de Arquivos a Modificar

```
src/
├── lib/
│   ├── api.ts (NOVO)
│   ├── dummyJsonService.ts (NOVO)
│   └── dataService.ts (MODIFICAR)
├── types/
│   └── dummyjson.ts (NOVO)
├── contexts/
│   └── AuthContext.tsx (MODIFICAR)
├── hooks/
│   ├── useUsers.ts (MODIFICAR)
│   └── useProducts.ts (MODIFICAR)
└── data/
    └── mockData.ts (REMOVER)
```

## 3. Implementação dos Serviços de API

### 3.1 Cliente HTTP Base (src/lib/api.ts)

```typescript
/**
 * Cliente HTTP configurado para DummyJSON API
 * Inclui interceptadores para autenticação e tratamento de erros
 */

interface APIConfig {
  baseURL: string;
  timeout: number;
}

interface APIResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

class APIClient {
  private baseURL: string;
  private timeout: number;

  constructor(config: APIConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
  }

  /**
   * Interceptador para adicionar token de autenticação nas requisições
   */
  private addAuthHeader(headers: HeadersInit = {}): HeadersInit {
    const token = localStorage.getItem('dummyjson-token');
    return {
      'Content-Type': 'application/json',
      ...headers,
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Interceptador para tratamento de respostas e erros
   */
  private async handleResponse<T>(response: Response): Promise<APIResponse<T>> {
    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado ou inválido
        localStorage.removeItem('dummyjson-token');
        localStorage.removeItem('dummyjson-user');
        window.location.href = '/login';
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return {
      data,
      status: response.status,
      statusText: response.statusText
    };
  }

  /**
   * Método GET genérico
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.addAuthHeader(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const result = await this.handleResponse<T>(response);
      return result.data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Método POST genérico
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.addAuthHeader(),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const result = await this.handleResponse<T>(response);
      return result.data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Método PUT genérico
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.addAuthHeader(),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const result = await this.handleResponse<T>(response);
      return result.data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Método DELETE genérico
   */
  async delete<T>(endpoint: string): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.addAuthHeader(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const result = await this.handleResponse<T>(response);
      return result.data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}

// Instância configurada para DummyJSON
export const apiClient = new APIClient({
  baseURL: 'https://dummyjson.com',
  timeout: 10000
});
```

### 3.2 Tipos DummyJSON (src/types/dummyjson.ts)

```typescript
/**
 * Tipos TypeScript para integração com DummyJSON API
 */

export interface DummyJSONUser {
  id: number;
  firstName: string;
  lastName: string;
  maidenName: string;
  age: number;
  gender: 'male' | 'female';
  email: string;
  phone: string;
  username: string;
  password: string;
  birthDate: string;
  image: string;
  bloodGroup: string;
  height: number;
  weight: number;
  eyeColor: string;
  hair: {
    color: string;
    type: string;
  };
  domain: string;
  ip: string;
  address: {
    address: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    postalCode: string;
    state: string;
  };
  macAddress: string;
  university: string;
  bank: {
    cardExpire: string;
    cardNumber: string;
    cardType: string;
    currency: string;
    iban: string;
  };
  company: {
    address: {
      address: string;
      city: string;
      coordinates: {
        lat: number;
        lng: number;
      };
      postalCode: string;
      state: string;
    };
    department: string;
    name: string;
    title: string;
  };
  ein: string;
  ssn: string;
  userAgent: string;
}

export interface DummyJSONProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

export interface DummyJSONAuthResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token: string;
}

export interface DummyJSONPaginatedResponse<T> {
  [key: string]: T[] | number;
  total: number;
  skip: number;
  limit: number;
}

export interface DummyJSONUsersResponse extends DummyJSONPaginatedResponse<DummyJSONUser> {
  users: DummyJSONUser[];
}

export interface DummyJSONProductsResponse extends DummyJSONPaginatedResponse<DummyJSONProduct> {
  products: DummyJSONProduct[];
}

// Tipos para criação/atualização
export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: 'male' | 'female';
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: number;
}

export interface CreateProductRequest {
  title: string;
  description: string;
  price: number;
  brand: string;
  category: string;
  stock?: number;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: number;
}

// Mapeamento para tipos locais
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 3.3 Serviço DummyJSON (src/lib/dummyJsonService.ts)

```typescript
/**
 * Serviço para integração com DummyJSON API
 * Implementa todas as operações CRUD para usuários e produtos
 */

import { apiClient } from './api';
import {
  DummyJSONUser,
  DummyJSONProduct,
  DummyJSONAuthResponse,
  DummyJSONUsersResponse,
  DummyJSONProductsResponse,
  CreateUserRequest,
  UpdateUserRequest,
  CreateProductRequest,
  UpdateProductRequest,
  User,
  Product
} from '@/types/dummyjson';
import { FilterOptions, PaginatedResponse } from '@/types';

/**
 * Mapeia usuário DummyJSON para formato local
 */
function mapDummyJSONUserToLocal(dummyUser: DummyJSONUser): User {
  return {
    id: dummyUser.id.toString(),
    email: dummyUser.email,
    name: `${dummyUser.firstName} ${dummyUser.lastName}`,
    avatar: dummyUser.image,
    role: dummyUser.id === 1 ? 'admin' : 'user', // Primeiro usuário como admin
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Mapeia produto DummyJSON para formato local
 */
function mapDummyJSONProductToLocal(dummyProduct: DummyJSONProduct): Product {
  return {
    id: dummyProduct.id.toString(),
    name: dummyProduct.title,
    description: dummyProduct.description,
    price: dummyProduct.price,
    category: dummyProduct.category,
    stock: dummyProduct.stock,
    imageUrl: dummyProduct.thumbnail,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export class DummyJSONService {
  /**
   * Autentica usuário via DummyJSON
   */
  static async login(username: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const response = await apiClient.post<DummyJSONAuthResponse>('/auth/login', {
        username,
        password
      });

      // Armazenar token
      localStorage.setItem('dummyjson-token', response.token);
      
      // Mapear usuário para formato local
      const user: User = {
        id: response.id.toString(),
        email: response.email,
        name: `${response.firstName} ${response.lastName}`,
        avatar: response.image,
        role: response.id === 1 ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Armazenar dados do usuário
      localStorage.setItem('dummyjson-user', JSON.stringify(user));

      return { user, token: response.token };
    } catch (error) {
      throw new Error('Credenciais inválidas');
    }
  }

  /**
   * Busca usuários com paginação e filtros
   */
  static async getUsers(filters?: FilterOptions): Promise<PaginatedResponse<User>> {
    const params: Record<string, any> = {
      limit: filters?.pageSize || 10,
      skip: filters?.page ? (filters.page - 1) * (filters.pageSize || 10) : 0
    };

    // Adicionar campos específicos se necessário
    if (filters?.search) {
      params.select = 'id,firstName,lastName,email,image,phone';
    }

    const response = await apiClient.get<DummyJSONUsersResponse>('/users', params);
    
    let filteredUsers = response.users;

    // Aplicar filtro de busca localmente (DummyJSON não suporta busca por texto)
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }

    const mappedUsers = filteredUsers.map(mapDummyJSONUserToLocal);

    return {
      data: mappedUsers,
      total: response.total,
      page: Math.floor(response.skip / response.limit) + 1,
      pageSize: response.limit,
      totalPages: Math.ceil(response.total / response.limit)
    };
  }

  /**
   * Busca usuário por ID
   */
  static async getUserById(id: string): Promise<User | null> {
    try {
      const response = await apiClient.get<DummyJSONUser>(`/users/${id}`);
      return mapDummyJSONUserToLocal(response);
    } catch (error) {
      return null;
    }
  }

  /**
   * Cria novo usuário
   */
  static async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<DummyJSONUser>('/users/add', userData);
    return mapDummyJSONUserToLocal(response);
  }

  /**
   * Atualiza usuário existente
   */
  static async updateUser(id: string, userData: Partial<UpdateUserRequest>): Promise<User> {
    const response = await apiClient.put<DummyJSONUser>(`/users/${id}`, userData);
    return mapDummyJSONUserToLocal(response);
  }

  /**
   * Exclui usuário
   */
  static async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }

  /**
   * Busca produtos com paginação e filtros
   */
  static async getProducts(filters?: FilterOptions): Promise<PaginatedResponse<Product>> {
    const params: Record<string, any> = {
      limit: filters?.pageSize || 10,
      skip: filters?.page ? (filters.page - 1) * (filters.pageSize || 10) : 0
    };

    let endpoint = '/products';
    
    // Filtrar por categoria se especificado
    if (filters?.category) {
      endpoint = `/products/category/${filters.category}`;
    }

    const response = await apiClient.get<DummyJSONProductsResponse>(endpoint, params);
    
    let filteredProducts = response.products;

    // Aplicar filtro de busca localmente
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm)
      );
    }

    const mappedProducts = filteredProducts.map(mapDummyJSONProductToLocal);

    return {
      data: mappedProducts,
      total: response.total,
      page: Math.floor(response.skip / response.limit) + 1,
      pageSize: response.limit,
      totalPages: Math.ceil(response.total / response.limit)
    };
  }

  /**
   * Busca produto por ID
   */
  static async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await apiClient.get<DummyJSONProduct>(`/products/${id}`);
      return mapDummyJSONProductToLocal(response);
    } catch (error) {
      return null;
    }
  }

  /**
   * Cria novo produto
   */
  static async createProduct(productData: CreateProductRequest): Promise<Product> {
    const response = await apiClient.post<DummyJSONProduct>('/products/add', productData);
    return mapDummyJSONProductToLocal(response);
  }

  /**
   * Atualiza produto existente
   */
  static async updateProduct(id: string, productData: Partial<UpdateProductRequest>): Promise<Product> {
    const response = await apiClient.put<DummyJSONProduct>(`/products/${id}`, productData);
    return mapDummyJSONProductToLocal(response);
  }

  /**
   * Exclui produto
   */
  static async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  }

  /**
   * Busca categorias de produtos
   */
  static async getProductCategories(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/products/categories');
    return response;
  }
}
```

## 4. Atualização do Contexto de Autenticação

### 4.1 AuthContext.tsx Atualizado

```typescript
"use client";

import { AuthState, User } from "@/types";
import { DummyJSONService } from "@/lib/dummyJsonService";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType extends AuthState {
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "dummyjson-token";
const USER_KEY = "dummyjson-user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    /**
     * Verifica se existe sessão ativa ao carregar a aplicação
     */
    const initializeAuth = () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // Limpar dados inválidos
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  /**
   * Realiza login via DummyJSON API
   */
  const login = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      const { user, token } = await DummyJSONService.login(username, password);

      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Erro ao fazer login" 
      };
    }
  };

  /**
   * Realiza logout e limpa dados de sessão
   */
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  /**
   * Atualiza dados do usuário na sessão
   */
  const updateUser = (userData: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...userData };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      setAuthState((prev) => ({ ...prev, user: updatedUser }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

## 5. Credenciais de Teste DummyJSON

Para testar a integração, use as seguintes credenciais válidas da API DummyJSON:

```typescript
// Credenciais de teste disponíveis
const testCredentials = [
  { username: 'kminchelle', password: '0lelplR' },
  { username: 'dferrari', password: 'Vru55Y4' },
  { username: 'dpettegre', password: 'YVmWktM' },
  { username: 'jhixon', password: 'GyLnCB8' },
  { username: 'atuny0', password: '9uQFF1Lh' }
];
```

## 6. Próximos Passos

1. **Remover arquivo mockData.ts**
2. **Atualizar hooks useUsers.ts e useProducts.ts** para usar DummyJSONService
3. **Atualizar dataService.ts** para usar os novos serviços
4. **Testar integração** com credenciais válidas
5. **Implementar tratamento de erros** específicos da API
6. **Adicionar loading states** apropriados
7. **Configurar interceptadores** para renovação automática de token

Esta implementação fornece uma base sólida para substituir completamente os dados mockados pela integração real com DummyJSON, mantendo a compatibilidade com a interface existente.