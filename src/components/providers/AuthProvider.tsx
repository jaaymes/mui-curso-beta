"use client";

import { createContext, useContext, ReactNode } from 'react';
import { User } from '@/types';

/**
 * Interface do contexto de autenticação para SSR
 * Contém apenas os dados do usuário, sem lógica de estado client-side
 */
interface AuthContextType {
  user: User;
  isAuthenticated: boolean;
}

/**
 * Contexto de autenticação para componentes que precisam acessar dados do usuário
 * Este contexto é populado com dados do servidor (SSR)
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider de autenticação que recebe dados do usuário do servidor
 * Este componente é usado para fornecer dados de autenticação para componentes filhos
 */
interface AuthProviderProps {
  user: User;
  children: ReactNode;
}

export function AuthProvider({ user, children }: AuthProviderProps) {
  const contextValue: AuthContextType = {
    user,
    isAuthenticated: true, // Se chegou até aqui, o usuário está autenticado
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acessar o contexto de autenticação
 * Retorna os dados do usuário autenticado
 */
export function useAuthSSR(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthSSR deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}