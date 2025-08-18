"use server";

import { DummyUser } from "@/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAMES } from "./cookie-types";

/**
 * Cached authentication verification for improved dashboard performance
 * Caches valid authentication for 30 seconds to reduce redundant API calls
 */
const getAuthVerification = async (token: string): Promise<DummyUser | null> => {
  try {
    // Fazer requisição para a rota /api/me para verificar autenticação
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const response = await fetch(`${baseUrl}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 30 }, // Revalidate every 30 seconds
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro na verificação de autenticação:", error);
    return null;
  }
};

/**
 * Verifica a autenticação do usuário no servidor usando cache otimizado
 * Esta função deve ser usada em Server Components para autenticação SSR
 */
export async function verifyAuthentication(): Promise<DummyUser | null> {
  try {
    const cookieStore = await cookies();

    // Usar o nome padronizado do cookie
    const token = cookieStore.get(AUTH_COOKIE_NAMES.AUTH_TOKEN)?.value;

    if (!token) {
      return null;
    }

    return await getAuthVerification(token);
  } catch (error) {
    console.error("Erro na verificação de autenticação:", error);
    return null;
  }
}

/**
 * Função para fazer logout removendo o cookie de autenticação
 * Esta função pode ser usada em Server Actions
 */
export async function serverLogout() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAMES.AUTH_TOKEN);
  redirect("/login");
}
