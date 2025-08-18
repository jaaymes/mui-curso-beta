/**
 * Testes para o hook useAuth (Zustand store)
 * Verifica o funcionamento do store de autenticação
 */
import { useAuth } from '@/store/use-auth';
import { clearServerAuthCookies } from '@/lib/cookies';
import { redirect } from 'next/navigation';
import { DummyLoginResponse } from '@/types';
import { act, renderHook } from '@testing-library/react';

// Mock das dependências
jest.mock('@/lib/cookies', () => ({
  clearServerAuthCookies: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

const mockClearServerAuthCookies = clearServerAuthCookies as jest.MockedFunction<typeof clearServerAuthCookies>;
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

// Mock do localStorage para o persist middleware
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useAuth Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Reset do store para estado inicial
    const { result } = renderHook(() => useAuth());
    act(() => {
      result.current.clearAuth();
    });
  });

  describe('initial state', () => {
    /**
     * Testa se o estado inicial está correto
     */
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAuth());
      
      expect(result.current.user).toBe(null);
      expect(result.current.token).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    /**
     * Testa se as funções estão disponíveis
     */
    it('should have all required functions', () => {
      const { result } = renderHook(() => useAuth());
      
      expect(typeof result.current.setUser).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.setLoading).toBe('function');
      expect(typeof result.current.clearAuth).toBe('function');
    });
  });

  describe('setUser action', () => {
    const mockUserData: DummyLoginResponse = {
      id: 1,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      image: 'https://example.com/avatar.jpg',
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    };

    /**
     * Testa se setUser define o usuário corretamente
     */
    it('should set user data correctly', () => {
      const { result } = renderHook(() => useAuth());
      
      act(() => {
        result.current.setUser(mockUserData);
      });

      expect(result.current.user).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        role: 'user',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
      });
      
      expect(result.current.token).toBe('mock-access-token');
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    /**
     * Testa se setUser funciona com dados mínimos
     */
    it('should handle minimal user data', () => {
      const minimalUserData: DummyLoginResponse = {
        id: 2,
        email: 'minimal@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'janesmith',
        image: '',
        accessToken: 'minimal-token',
        refreshToken: 'minimal-refresh'
      };

      const { result } = renderHook(() => useAuth());
      
      act(() => {
        result.current.setUser(minimalUserData);
      });

      expect(result.current.user?.name).toBe('Jane Smith');
      expect(result.current.user?.avatar).toBe('');
      expect(result.current.isAuthenticated).toBe(true);
    });

    /**
     * Testa se setUser converte ID numérico para string
     */
    it('should convert numeric ID to string', () => {
      const { result } = renderHook(() => useAuth());
      
      act(() => {
        result.current.setUser({ ...mockUserData, id: 999 });
      });

      expect(result.current.user?.id).toBe('999');
      expect(typeof result.current.user?.id).toBe('string');
    });
  });

  describe('logout action', () => {
    /**
     * Testa se logout limpa o estado corretamente
     */
    it('should clear state and call server logout', async () => {
      const { result } = renderHook(() => useAuth());
      
      // Primeiro define um usuário
      act(() => {
        result.current.setUser({
          id: 1,
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          image: 'avatar.jpg',
          accessToken: 'token',
          refreshToken: 'refresh'
        });
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Faz logout
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBe(null);
      expect(result.current.token).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      
      expect(mockClearServerAuthCookies).toHaveBeenCalledTimes(1);
      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });

    /**
     * Testa se logout funciona mesmo quando não há usuário logado
     */
    it('should work when no user is logged in', async () => {
      const { result } = renderHook(() => useAuth());
      
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBe(null);
      expect(mockClearServerAuthCookies).toHaveBeenCalledTimes(1);
      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });
  });

  describe('setLoading action', () => {
    /**
     * Testa se setLoading define o estado de loading corretamente
     */
    it('should set loading state correctly', () => {
      const { result } = renderHook(() => useAuth());
      
      act(() => {
        result.current.setLoading(true);
      });
      
      expect(result.current.isLoading).toBe(true);
      
      act(() => {
        result.current.setLoading(false);
      });
      
      expect(result.current.isLoading).toBe(false);
    });

    /**
     * Testa se setLoading não afeta outros estados
     */
    it('should not affect other state properties', () => {
      const { result } = renderHook(() => useAuth());
      
      const initialUser = result.current.user;
      const initialToken = result.current.token;
      const initialAuth = result.current.isAuthenticated;
      
      act(() => {
        result.current.setLoading(true);
      });
      
      expect(result.current.user).toBe(initialUser);
      expect(result.current.token).toBe(initialToken);
      expect(result.current.isAuthenticated).toBe(initialAuth);
    });
  });

  describe('clearAuth action', () => {
    /**
     * Testa se clearAuth reseta o estado para inicial
     */
    it('should reset state to initial values', () => {
      const { result } = renderHook(() => useAuth());
      
      // Define um usuário primeiro
      act(() => {
        result.current.setUser({
          id: 1,
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          image: 'avatar.jpg',
          accessToken: 'token',
          refreshToken: 'refresh'
        });
        result.current.setLoading(true);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(true);

      // Limpa o estado
      act(() => {
        result.current.clearAuth();
      });

      expect(result.current.user).toBe(null);
      expect(result.current.token).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    /**
     * Testa se clearAuth não chama funções externas
     */
    it('should not call external functions', () => {
      const { result } = renderHook(() => useAuth());
      
      act(() => {
        result.current.clearAuth();
      });

      expect(mockClearServerAuthCookies).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe('persistence', () => {
    /**
     * Testa se o estado mantém consistência após mudanças
     */
    it('should maintain state consistency', async () => {
      const { result } = renderHook(() => useAuth());
      
      act(() => {
        result.current.setUser({
          id: 1,
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          image: 'avatar.jpg',
          accessToken: 'token',
          refreshToken: 'refresh'
        });
      });

      // Verifica se o estado foi definido corretamente
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.id).toBe('1');
      expect(result.current.token).toBe('token');
    });

    /**
     * Testa se o loading não afeta outros estados
     */
    it('should handle loading state independently', async () => {
      const { result } = renderHook(() => useAuth());
      
      act(() => {
        result.current.setUser({
          id: 1,
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          image: 'avatar.jpg',
          accessToken: 'token',
          refreshToken: 'refresh'
        });
        result.current.setLoading(true);
      });

      // Verifica se o loading não afeta outros estados
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.id).toBe('1');
      expect(result.current.token).toBe('token');
    });
  });

  describe('edge cases', () => {
    /**
     * Testa se o store funciona com dados de usuário inválidos
     */
    it('should handle invalid user data gracefully', () => {
      const { result } = renderHook(() => useAuth());
      
      const invalidUserData = {
        id: 0,
        email: '',
        firstName: '',
        lastName: '',
        username: '',
        image: '',
        accessToken: '',
        refreshToken: ''
      };

      act(() => {
        result.current.setUser(invalidUserData);
      });

      expect(result.current.user?.id).toBe('0');
      expect(result.current.user?.name).toBe(' ');
      expect(result.current.isAuthenticated).toBe(true);
    });

    /**
     * Testa se múltiplas chamadas de setUser funcionam corretamente
     */
    it('should handle multiple setUser calls', () => {
      const { result } = renderHook(() => useAuth());
      
      const userData1 = {
        id: 1,
        email: 'user1@example.com',
        firstName: 'User',
        lastName: 'One',
        username: 'user1',
        image: 'avatar1.jpg',
        accessToken: 'token1',
        refreshToken: 'refresh1'
      };

      const userData2 = {
        id: 2,
        email: 'user2@example.com',
        firstName: 'User',
        lastName: 'Two',
        username: 'user2',
        image: 'avatar2.jpg',
        accessToken: 'token2',
        refreshToken: 'refresh2'
      };

      act(() => {
        result.current.setUser(userData1);
      });

      expect(result.current.user?.id).toBe('1');
      expect(result.current.token).toBe('token1');

      act(() => {
        result.current.setUser(userData2);
      });

      expect(result.current.user?.id).toBe('2');
      expect(result.current.token).toBe('token2');
    });
  });
});