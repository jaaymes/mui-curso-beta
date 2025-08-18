/**
 * Configurações padrão para cookies
 * Seguindo as melhores práticas de segurança para aplicações Next.js
 */
export const DEFAULT_COOKIE_CONFIG = {
  // Configurações de segurança
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  // Tempo de expiração padrão: 30 minutos
  maxAge: 30 * 60, // 30 minutos em segundos
};

/**
 * Nomes padrão de cookies para autenticação
 * Podem ser usados como valores padrão nas funções
 */
export const AUTH_COOKIE_NAMES = {
  // Nome do cookie de token de acesso
  AUTH_TOKEN: "auth-token",
  // Nome do cookie de token de refresh
  REFRESH_TOKEN: "refresh-token",
  // Nome do cookie de dados do usuário
  USER_DATA: "user-data",
};

/**
 * Interface para definir opções de cookies
 */
export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  path?: string;
  maxAge?: number;
  expires?: Date;
}

/**
 * Interface para dados de cookie genérico
 */
export interface CookieData {
  [key: string]: string;
}

/**
 * Interface para dados de autenticação (compatibilidade)
 */
export interface AuthCookieData {
  token: string;
  refreshToken?: string;
  userData?: string; // JSON stringified user data
  expiresInMins?: number;
}
