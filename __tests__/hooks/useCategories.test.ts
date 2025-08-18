/**
 * Testes para o hook useCategories
 * Verifica o funcionamento do hook de busca de categorias
 */
import { renderHook, waitFor } from '@testing-library/react';
import { useCategories } from '@/hooks/useCategories';
import { ProductsService } from '@/lib/dataService';

// Mock do ProductsService
jest.mock('@/lib/dataService', () => ({
  ProductsService: {
    getCategories: jest.fn(),
  },
}));

// Mock do console.error para evitar logs desnecessários
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

const mockProductsService = ProductsService as jest.Mocked<typeof ProductsService>;

describe('useCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe('successful data fetching', () => {
    /**
     * Testa se o hook busca categorias com sucesso
     */
    it('should fetch categories successfully', async () => {
      const mockCategories = ['electronics', 'beauty', 'furniture', 'groceries'];
      mockProductsService.getCategories.mockResolvedValue(mockCategories);

      const { result } = renderHook(() => useCategories());

      // Estado inicial
      expect(result.current.isLoading).toBe(true);
      expect(result.current.categories).toEqual([]);
      expect(result.current.error).toBe(null);

      // Aguarda a resolução da promise
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Estado final
      expect(result.current.categories).toEqual(mockCategories);
      expect(result.current.error).toBe(null);
      expect(mockProductsService.getCategories).toHaveBeenCalledTimes(1);
    });

    /**
     * Testa se o hook funciona com lista vazia de categorias
     */
    it('should handle empty categories list', async () => {
      mockProductsService.getCategories.mockResolvedValue([]);

      const { result } = renderHook(() => useCategories());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.categories).toEqual([]);
      expect(result.current.error).toBe(null);
    });

    /**
     * Testa se o hook funciona com muitas categorias
     */
    it('should handle large categories list', async () => {
      const mockCategories = Array.from({ length: 50 }, (_, i) => `category-${i}`);
      mockProductsService.getCategories.mockResolvedValue(mockCategories);

      const { result } = renderHook(() => useCategories());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.categories).toEqual(mockCategories);
      expect(result.current.categories).toHaveLength(50);
    });
  });

  describe('error handling', () => {
    /**
     * Testa se o hook trata erros corretamente
     */
    it('should handle API errors gracefully', async () => {
      const errorMessage = 'API Error: Failed to fetch';
      mockProductsService.getCategories.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useCategories());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.categories).toEqual(['electronics', 'beauty', 'furniture', 'groceries']);
    });

    /**
     * Testa se o hook trata erros não-Error corretamente
     */
    it('should handle non-Error rejections', async () => {
      mockProductsService.getCategories.mockRejectedValue('String error');

      const { result } = renderHook(() => useCategories());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Falha ao buscar categorias');
      expect(result.current.categories).toEqual(['electronics', 'beauty', 'furniture', 'groceries']);
    });

    /**
     * Testa se o hook trata rejeições undefined
     */
    it('should handle undefined rejections', async () => {
      mockProductsService.getCategories.mockRejectedValue(undefined);

      const { result } = renderHook(() => useCategories());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Falha ao buscar categorias');
      expect(result.current.categories).toEqual(['electronics', 'beauty', 'furniture', 'groceries']);
    });

    /**
     * Testa se o hook fornece categorias fallback em caso de erro
     */
    it('should provide fallback categories on error', async () => {
      mockProductsService.getCategories.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCategories());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const expectedFallbackCategories = ['electronics', 'beauty', 'furniture', 'groceries'];
      expect(result.current.categories).toEqual(expectedFallbackCategories);
      expect(result.current.categories).toHaveLength(4);
    });
  });

  describe('loading states', () => {
    /**
     * Testa se o estado de loading é gerenciado corretamente
     */
    it('should manage loading state correctly', async () => {
      let resolvePromise: (value: string[]) => void;
      const promise = new Promise<string[]>((resolve) => {
        resolvePromise = resolve;
      });
      
      mockProductsService.getCategories.mockReturnValue(promise);

      const { result } = renderHook(() => useCategories());

      // Deve começar com loading true
      expect(result.current.isLoading).toBe(true);
      expect(result.current.categories).toEqual([]);
      expect(result.current.error).toBe(null);

      // Resolve a promise
      resolvePromise!(['test-category']);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.categories).toEqual(['test-category']);
    });

    /**
     * Testa se o loading é definido como false mesmo em caso de erro
     */
    it('should set loading to false on error', async () => {
      mockProductsService.getCategories.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useCategories());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('hook behavior', () => {
    /**
     * Testa se o hook só faz uma chamada à API por montagem
     */
    it('should only call API once per mount', async () => {
      mockProductsService.getCategories.mockResolvedValue(['test']);

      const { result, rerender } = renderHook(() => useCategories());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Re-renderiza o hook
      rerender();

      // Deve ter chamado a API apenas uma vez
      expect(mockProductsService.getCategories).toHaveBeenCalledTimes(1);
    });

    /**
     * Testa se o hook retorna os valores corretos
     */
    it('should return correct values structure', () => {
      const { result } = renderHook(() => useCategories());

      expect(result.current).toHaveProperty('categories');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');

      expect(Array.isArray(result.current.categories)).toBe(true);
      expect(typeof result.current.isLoading).toBe('boolean');
      expect(result.current.error === null || typeof result.current.error === 'string').toBe(true);
    });
  });

  describe('edge cases', () => {
    /**
     * Testa se o hook funciona quando o serviço retorna null
     */
    it('should handle null response from service', async () => {
      mockProductsService.getCategories.mockResolvedValue(null as any);

      const { result } = renderHook(() => useCategories());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.categories).toBe(null);
      expect(result.current.error).toBe(null);
    });

    /**
     * Testa se o hook funciona com categorias que contêm caracteres especiais
     */
    it('should handle categories with special characters', async () => {
      const specialCategories = [
        'electronics & gadgets',
        'beauty/cosmetics',
        'home & garden',
        'sports/outdoor',
        'books & media'
      ];
      mockProductsService.getCategories.mockResolvedValue(specialCategories);

      const { result } = renderHook(() => useCategories());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.categories).toEqual(specialCategories);
    });
  });
});