"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  AUTH_COOKIE_NAMES,
  DEFAULT_COOKIE_CONFIG,
  type AuthCookieData,
  type CookieData,
  type CookieOptions,
} from "./cookie-types";

/**
 * Server Action genérica para definir um cookie de forma segura
 * Função principal que permite definir qualquer cookie com chave dinâmica
 *
 * @param key - Nome/chave do cookie
 * @param value - Valor do cookie
 * @param options - Opções adicionais para configuração do cookie
 */
export async function setCookie(
  key: string,
  value: string,
  options?: Partial<CookieOptions>
): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();

    // Validar parâmetros obrigatórios
    if (!key || key.trim() === "") {
      return {
        success: false,
        error: "Nome do cookie é obrigatório",
      };
    }

    if (value === undefined || value === null) {
      return {
        success: false,
        error: "Valor do cookie é obrigatório",
      };
    }

    // Configurações finais dos cookies mesclando padrões com opções fornecidas
    const cookieOptions: CookieOptions = {
      ...DEFAULT_COOKIE_CONFIG,
      ...options,
    };

    // Definir o cookie
    cookieStore.set(key, value, cookieOptions);

    return { success: true };
  } catch (error) {
    console.error(`Erro ao definir cookie '${key}':`, error);
    return {
      success: false,
      error: "Erro interno ao definir cookie",
    };
  }
}

/**
 * Server Action para definir múltiplos cookies de uma vez
 * Útil para operações que precisam definir vários cookies simultaneamente
 *
 * @param data - Objeto com pares chave-valor dos cookies
 * @param options - Opções adicionais para configuração dos cookies
 */
export async function setCookies(
  data: CookieData,
  options?: Partial<CookieOptions>
): Promise<{ success: boolean; error?: string; failedCookies?: string[] }> {
  try {
    const failedCookies: string[] = [];

    // Definir cada cookie individualmente
    for (const [key, value] of Object.entries(data)) {
      const result = await setCookie(key, value, options);
      if (!result.success) {
        failedCookies.push(key);
      }
    }

    return {
      success: failedCookies.length === 0,
      error:
        failedCookies.length > 0
          ? `Falha ao definir cookies: ${failedCookies.join(", ")}`
          : undefined,
      failedCookies: failedCookies.length > 0 ? failedCookies : undefined,
    };
  } catch (error) {
    console.error("Erro ao definir múltiplos cookies:", error);
    return {
      success: false,
      error: "Erro interno ao definir múltiplos cookies",
    };
  }
}

/**
 * Server Action para definir cookies de autenticação (função de compatibilidade)
 * Mantém a interface original para não quebrar código existente
 *
 * @param data - Dados de autenticação incluindo token e informações do usuário
 * @param options - Opções adicionais para configuração dos cookies
 */
export async function setAuthCookies(
  data: AuthCookieData,
  options?: Partial<CookieOptions>
): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieData: CookieData = {};

    // Validar se o token foi fornecido
    if (!data.token || data.token.trim() === "") {
      return {
        success: false,
        error: "Token de autenticação é obrigatório",
      };
    }

    // Preparar dados dos cookies
    cookieData[AUTH_COOKIE_NAMES.AUTH_TOKEN] = data.token;

    if (data.refreshToken) {
      cookieData[AUTH_COOKIE_NAMES.REFRESH_TOKEN] = data.refreshToken;
    }

    if (data.userData) {
      // Validar se é um JSON válido
      JSON.parse(data.userData);
      cookieData[AUTH_COOKIE_NAMES.USER_DATA] = data.userData;
    }

    // Configurações específicas para autenticação
    const authOptions: Partial<CookieOptions> = {
      ...options,
      maxAge: data.expiresInMins
        ? data.expiresInMins * 60
        : options?.maxAge || DEFAULT_COOKIE_CONFIG.maxAge,
    };

    // Definir cookie do token principal
    const tokenResult = await setCookie(
      AUTH_COOKIE_NAMES.AUTH_TOKEN,
      data.token,
      authOptions
    );

    if (!tokenResult.success) {
      return tokenResult;
    }

    // Definir refresh token com vida útil maior
    if (data.refreshToken) {
      await setCookie(AUTH_COOKIE_NAMES.REFRESH_TOKEN, data.refreshToken, {
        ...authOptions,
        maxAge: (authOptions.maxAge || DEFAULT_COOKIE_CONFIG.maxAge) * 24,
      });
    }

    // Definir dados do usuário (não httpOnly para acesso client-side)
    if (data.userData) {
      await setCookie(AUTH_COOKIE_NAMES.USER_DATA, data.userData, {
        ...authOptions,
        httpOnly: false,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao definir cookies de autenticação:", error);
    return {
      success: false,
      error: "Erro interno ao definir cookies de autenticação",
    };
  }
}

/**
 * Server Action genérica para remover um cookie específico
 * Função principal que permite remover qualquer cookie por chave
 *
 * @param key - Nome/chave do cookie para remover
 */
export async function deleteCookie(
  key: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();

    if (!key || key.trim() === "") {
      return {
        success: false,
        error: "Nome do cookie é obrigatório",
      };
    }

    if (cookieStore.has(key)) {
      cookieStore.delete(key);
    }

    return { success: true };
  } catch (error) {
    console.error(`Erro ao remover cookie '${key}':`, error);
    return {
      success: false,
      error: "Erro interno ao remover cookie",
    };
  }
}

/**
 * Server Action para remover múltiplos cookies de forma segura
 * Esta função deve ser usada durante logout ou quando tokens expiram
 *
 * @param cookieNames - Array de nomes de cookies para remover (opcional)
 * @param redirectTo - URL para redirecionamento após limpeza (opcional)
 */
export async function deleteCookies(
  cookieNames?: string[],
  redirectTo?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();

    // Lista padrão de cookies para remover
    const defaultCookiesToDelete = [
      AUTH_COOKIE_NAMES.AUTH_TOKEN,
      AUTH_COOKIE_NAMES.REFRESH_TOKEN,
      AUTH_COOKIE_NAMES.USER_DATA,
    ];

    // Usar cookies fornecidos ou padrão
    const cookiesToDelete =
      cookieNames && cookieNames.length > 0
        ? cookieNames
        : defaultCookiesToDelete;

    // Remover cada cookie especificado
    for (const cookieName of cookiesToDelete) {
      if (cookieStore.has(cookieName)) {
        cookieStore.delete(cookieName);
      }
    }

    // Redirecionar se URL foi fornecida
    if (redirectTo) {
      redirect(redirectTo);
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao remover cookies de autenticação:", error);
    return {
      success: false,
      error: "Erro interno ao remover cookies de autenticação",
    };
  }
}

/**
 * Server Action genérica para obter o valor de um cookie
 * Função principal que permite obter qualquer cookie por chave
 *
 * @param key - Nome/chave do cookie
 * @returns Valor do cookie ou undefined se não existir
 */
export async function getCookie(key: string): Promise<string | null> {
  try {
    if (!key || key.trim() === "") {
      console.error("Nome do cookie é obrigatório");
      return null;
    }

    const cookieStore = await cookies();
    const cookie = cookieStore.get(key);

    return cookie?.value || null;
  } catch (error) {
    console.error("Erro ao obter cookie:", error);
    return null;
  }
}

/**
 * Server Action para verificar se cookies de autenticação existem
 * Útil para verificações de autenticação em Server Components
 *
 * @returns Objeto com informações sobre cookies existentes
 */
export async function checkAuthCookies(): Promise<{
  hasAuthToken: boolean;
  hasRefreshToken: boolean;
  hasUserData: boolean;
  tokenValue?: string;
}> {
  try {
    const cookieStore = await cookies();

    const authToken = cookieStore.get(AUTH_COOKIE_NAMES.AUTH_TOKEN);
    const refreshToken = cookieStore.get(AUTH_COOKIE_NAMES.REFRESH_TOKEN);
    const userData = cookieStore.get(AUTH_COOKIE_NAMES.USER_DATA);

    return {
      hasAuthToken: !!authToken?.value,
      hasRefreshToken: !!refreshToken?.value,
      hasUserData: !!userData?.value,
      tokenValue: authToken?.value,
    };
  } catch (error) {
    console.error("Erro ao verificar cookies de autenticação:", error);
    return {
      hasAuthToken: false,
      hasRefreshToken: false,
      hasUserData: false,
    };
  }
}

/**
 * Server Action para atualizar apenas o token de autenticação
 * Útil durante refresh de tokens sem afetar outros cookies
 *
 * @param newToken - Novo token de autenticação
 * @param expiresInMins - Tempo de expiração em minutos (opcional)
 */
export async function updateAuthToken(
  newToken: string,
  expiresInMins?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!newToken || newToken.trim() === "") {
      return {
        success: false,
        error: "Novo token é obrigatório",
      };
    }

    const cookieOptions: CookieOptions = {
      ...DEFAULT_COOKIE_CONFIG,
      maxAge: expiresInMins ? expiresInMins * 60 : DEFAULT_COOKIE_CONFIG.maxAge,
    };

    return await setCookie(
      AUTH_COOKIE_NAMES.AUTH_TOKEN,
      newToken,
      cookieOptions
    );
  } catch (error) {
    console.error("Erro ao atualizar token de autenticação:", error);
    return {
      success: false,
      error: "Erro interno ao atualizar token",
    };
  }
}

/**
 * Server Action para logout completo com limpeza de cookies e redirecionamento
 * Combina deleteCookies com redirecionamento automático para login
 */
export async function serverLogout(): Promise<void> {
  await deleteCookies(undefined, "/login");
}

/**
 * Server Action para logout sem redirecionamento automático
 * Use esta função quando quiser controlar o redirecionamento manualmente
 * @param additionalCookies - Cookies adicionais para remover além dos padrão de auth
 */
export async function clearServerAuthCookies(
  additionalCookies?: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();

    // Lista padrão de cookies para remover
    const defaultCookiesToDelete = [
      AUTH_COOKIE_NAMES.AUTH_TOKEN,
      AUTH_COOKIE_NAMES.REFRESH_TOKEN,
      AUTH_COOKIE_NAMES.USER_DATA,
    ];

    // Adicionar cookies adicionais se fornecidos
    const cookiesToDelete = additionalCookies
      ? [...defaultCookiesToDelete, ...additionalCookies]
      : defaultCookiesToDelete;

    // Remover cada cookie especificado
    for (const cookieName of cookiesToDelete) {
      if (cookieStore.has(cookieName)) {
        cookieStore.delete(cookieName);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao limpar cookies de autenticação no servidor:", error);
    return {
      success: false,
      error: "Erro interno ao limpar cookies de autenticação",
    };
  }
}
