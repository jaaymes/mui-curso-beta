import { UsersService } from "@/lib/dataService";
import type { DummyResponse, DummyUser } from "@/types";

/**
 * Users Data Module
 *
 * Este módulo fornece funções para buscar dados de usuários diretamente das APIs
 * sem qualquer mecanismo de cache, garantindo dados sempre atualizados.
 *
 * Características:
 * - Requisições diretas às APIs
 * - Busca paralela para melhor performance
 * - Tratamento robusto de erros com fallbacks
 * - Dados sempre atualizados
 */

// Tipos específicos para dados de usuários
export interface UsersStats {
  totalUsers: number;
  activeUsers: number;
  admins: number;
  newRegistrations: number;
  totalUsersTrend: number;
  activeUsersTrend: number;
  adminsTrend: number;
  newRegistrationsTrend: number;
}

export interface UsersData {
  users: DummyUser[];
  stats: UsersStats;
  total: number;
}

// Interface para filtros de busca avançada
export interface AdvancedSearchFilter {
  key: string;
  value: string;
}

// Mapeamento de campos de busca disponíveis
export const SEARCH_FIELDS = {
  name: "firstName", // Busca por primeiro nome
  lastName: "lastName", // Busca por sobrenome
  email: "email", // Busca por email
  username: "username", // Busca por username
  phone: "phone", // Busca por telefone
  company: "company.name", // Busca por nome da empresa
  role: "role", // Busca por função
  age: "age", // Busca por idade
  hairColor: "hair.color", // Busca por cor do cabelo
  eyeColor: "eyeColor", // Busca por cor dos olhos
  city: "address.city", // Busca por cidade
  state: "address.state", // Busca por estado
  country: "address.country", // Busca por país
  university: "university", // Busca por universidade
  department: "company.department", // Busca por departamento
} as const;

/**
 * Função para busca avançada usando filtros específicos da API DummyJSON
 * Utiliza o endpoint /users/filter?key=campo&value=valor
 */
export async function searchUsersByFilter(
  filter: AdvancedSearchFilter,
  page: number = 1,
  pageSize: number = 30
): Promise<{ users: DummyUser[]; total: number }> {
  try {
    const limit = pageSize;
    const skip = (page - 1) * limit;

    // Construir endpoint com filtro específico
    const endpoint = `/users/filter?key=${encodeURIComponent(
      filter.key
    )}&value=${encodeURIComponent(filter.value)}&limit=${limit}&skip=${skip}`;

    // Fazer requisição direta usando DummyUsersService
    const response = await fetch(`https://dummyjson.com${endpoint}`);

    if (!response.ok) {
      throw new Error(`Erro na busca: ${response.status}`);
    }

    const data: DummyResponse<DummyUser> = await response.json();

    // Retornar dados diretamente como DummyUser
    const users = data.users || [];

    return {
      users,
      total: data.total || 0,
    };
  } catch (error) {
    console.error("Erro na busca avançada de usuários:", error);
    return {
      users: [],
      total: 0,
    };
  }
}

/**
 * Função para busca múltipla com vários filtros
 * Permite combinar diferentes critérios de busca
 */
export async function searchUsersWithMultipleFilters(
  filters: AdvancedSearchFilter[],
  page: number = 1,
  pageSize: number = 30
): Promise<{ users: DummyUser[]; total: number }> {
  try {
    // Para múltiplos filtros, fazemos buscas separadas e combinamos os resultados
    const searchPromises = filters.map(
      (filter) => searchUsersByFilter(filter, 1, 100) // Buscar mais resultados para filtrar
    );

    const results = await Promise.all(searchPromises);

    // Combinar e deduplificar resultados
    const allUsers = results.flatMap((result) => result.users);
    const uniqueUsers = allUsers.filter(
      (user, index, self) => index === self.findIndex((u) => u.id === user.id)
    );

    // Aplicar paginação aos resultados combinados
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedUsers = uniqueUsers.slice(startIndex, endIndex);

    return {
      users: paginatedUsers,
      total: uniqueUsers.length,
    };
  } catch (error) {
    console.error("Erro na busca múltipla de usuários:", error);
    return {
      users: [],
      total: 0,
    };
  }
}



/**
 * Função principal para buscar todos os dados de usuários
 * Faz requisições diretas às APIs sem cache
 * Usa Promise.allSettled para resiliência a falhas parciais
 */
export async function getUsersData(): Promise<UsersData> {
  try {
    // Busca paralela com tratamento robusto de erros
    const results = await Promise.allSettled([getAllUsers(), getUsersStats()]);

    // Extrai dados ou usa fallbacks em caso de erro
    const [usersResult, statsResult] = results;

    const usersData =
      usersResult.status === "fulfilled"
        ? usersResult.value
        : { data: [], total: 0 };

    const stats =
      statsResult.status === "fulfilled"
        ? statsResult.value
        : {
            totalUsers: 0,
            activeUsers: 0,
            admins: 0,
            newRegistrations: 0,
            totalUsersTrend: 0,
            activeUsersTrend: 0,
            adminsTrend: 0,
            newRegistrationsTrend: 0,
          };

    return {
      users: usersData.data,
      stats,
      total: usersData.total,
    };
  } catch (error) {
    console.error("Erro ao buscar dados de usuários:", error);

    // Retorna dados vazios em caso de erro crítico
    return {
      users: [],
      stats: {
        totalUsers: 0,
        activeUsers: 0,
        admins: 0,
        newRegistrations: 0,
        totalUsersTrend: 0,
        activeUsersTrend: 0,
        adminsTrend: 0,
        newRegistrationsTrend: 0,
      },
      total: 0,
    };
  }
}

/**
 * Busca todos os usuários da API
 * Faz requisição direta sem cache
 */
async function getAllUsers(): Promise<{ data: DummyUser[]; total: number }> {
  try {
    // Busca uma quantidade maior de usuários para ter dados suficientes
    const response = await UsersService.getUsers({
      pageSize: 100,
      page: 1,
    });

    return {
      data: response.data || [],
      total: response.total || 0,
    };
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return { data: [], total: 0 };
  }
}

/**
 * Calcula estatísticas dos usuários
 * Processa os dados para gerar métricas úteis
 */
async function getUsersStats(): Promise<UsersStats> {
  try {
    const { data: users } = await getAllUsers();

    if (!users || users.length === 0) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        admins: 0,
        newRegistrations: 0,
        totalUsersTrend: 0,
        activeUsersTrend: 0,
        adminsTrend: 0,
        newRegistrationsTrend: 0,
      };
    }

    // Calcula estatísticas baseadas nos dados dos usuários
    const totalUsers = users.length;
    const admins = users.filter((user) => user.role === "admin").length;

    // Considera usuários ativos como aqueles criados nos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = users.filter((user) => {
      const createdAt = new Date(user.birthDate);
      return createdAt >= thirtyDaysAgo;
    }).length;

    // Usuários registrados nos últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newRegistrations = users.filter((user) => {
      const createdAt = new Date(user.birthDate);
      return createdAt >= sevenDaysAgo;
    }).length;

    // Calcular tendências (simuladas para demonstração)
    const totalUsersTrend = Math.floor(Math.random() * 20) - 10; // -10 a +10
    const activeUsersTrend = Math.floor(Math.random() * 15) - 5; // -5 a +10
    const adminsTrend = Math.floor(Math.random() * 6) - 3; // -3 a +3
    const newRegistrationsTrend = Math.floor(Math.random() * 10) - 2; // -2 a +8

    return {
      totalUsers,
      activeUsers,
      admins,
      newRegistrations,
      totalUsersTrend,
      activeUsersTrend,
      adminsTrend,
      newRegistrationsTrend,
    };
  } catch (error) {
    console.error("Erro ao calcular estatísticas de usuários:", error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      admins: 0,
      newRegistrations: 0,
      totalUsersTrend: 0,
      activeUsersTrend: 0,
      adminsTrend: 0,
      newRegistrationsTrend: 0,
    };
  }
}

/**
 * Busca um usuário específico por ID
 * Função auxiliar para detalhes de usuário
 */
export async function getUserById(id: string): Promise<DummyUser | null> {
  try {
    const user = await UsersService.getUserById(id);
    return user;
  } catch (error) {
    console.error(`Erro ao buscar usuário ${id}:`, error);
    return null;
  }
}

/**
 * Filtra usuários baseado em critérios de busca
 * Função auxiliar para filtros do lado do servidor
 */
export function filterUsers(
  users: DummyUser[],
  searchTerm: string = "",
  roleFilter: string = ""
): DummyUser[] {
  return users.filter((user) => {
    const matchesSearch =
      !searchTerm ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !roleFilter || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });
}

/**
 * Aplica paginação aos usuários
 * Função auxiliar para paginação do lado do servidor
 */
export function paginateUsers(
  users: DummyUser[],
  page: number = 0,
  limit: number = 10
): DummyUser[] {
  const startIndex = page * limit;
  const endIndex = startIndex + limit;
  return users.slice(startIndex, endIndex);
}
