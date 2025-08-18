import { verifyAuthentication, serverLogout } from '@/lib/auth-server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_COOKIE_NAMES } from '@/lib/cookie-types';
import { DummyUser } from '@/types';

// Mock das dependências
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock do fetch global
global.fetch = jest.fn();

const mockCookies = cookies as jest.MockedFunction<typeof cookies>;
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

const mockUser: DummyUser = {
  id: 1,
  firstName: 'João',
  lastName: 'Silva',
  maidenName: '',
  email: 'joao@example.com',
  username: 'joaosilva',
  password: '',
  image: 'https://example.com/avatar.jpg',
  phone: '11999999999',
  age: 30,
  gender: 'male',
  birthDate: '1993-01-01',
  address: {
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    stateCode: 'SP',
    postalCode: '01234-567',
    coordinates: { lat: -23.5505, lng: -46.6333 },
    country: 'Brasil',
  },
  company: {
    department: 'TI',
    name: 'Tech Corp',
    title: 'Desenvolvedor',
    address: {
      address: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      stateCode: 'SP',
      postalCode: '01310-100',
      coordinates: { lat: -23.5618, lng: -46.6565 },
      country: 'Brasil',
    },
  },
  bank: {
    cardExpire: '12/25',
    cardNumber: '1234567890123456',
    cardType: 'Visa',
    currency: 'BRL',
    iban: 'BR1234567890123456789012345',
  },
  macAddress: '00:11:22:33:44:55',
  university: 'USP',
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0',
  crypto: {
    coin: 'Bitcoin',
    wallet: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    network: 'Bitcoin',
  },
  role: 'admin',
  ein: '12-3456789',
  ssn: '123-45-6789',
  bloodGroup: 'O+',
  height: 175,
  weight: 70,
  eyeColor: 'Brown',
  hair: {
    color: 'Black',
    type: 'Straight',
  },
};

const mockCookieStore = {
  get: jest.fn(),
  delete: jest.fn(),
};

describe('auth-server', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCookies.mockResolvedValue(mockCookieStore as any);
    process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
  });

  describe('verifyAuthentication', () => {
    /**
     * Testa se a verificação de autenticação funciona com token válido
     */
    it('returns user data when token is valid', async () => {
      const mockToken = 'valid-token-123';
      mockCookieStore.get.mockReturnValue({ value: mockToken });
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      } as Response);

      const result = await verifyAuthentication();

      expect(result).toEqual(mockUser);
      expect(mockCookies).toHaveBeenCalled();
      expect(mockCookieStore.get).toHaveBeenCalledWith(AUTH_COOKIE_NAMES.AUTH_TOKEN);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/auth/me',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
          next: { revalidate: 30 },
        }
      );
    });

    /**
     * Testa se retorna null quando não há token
     */
    it('returns null when no token is present', async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const result = await verifyAuthentication();

      expect(result).toBeNull();
      expect(mockCookies).toHaveBeenCalled();
      expect(mockCookieStore.get).toHaveBeenCalledWith(AUTH_COOKIE_NAMES.AUTH_TOKEN);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    /**
     * Testa se retorna null quando o token é inválido
     */
    it('returns null when token is invalid', async () => {
      const mockToken = 'invalid-token';
      mockCookieStore.get.mockReturnValue({ value: mockToken });
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      const result = await verifyAuthentication();

      expect(result).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/auth/me',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`,
          },
          next: { revalidate: 30 },
        }
      );
    });

    /**
     * Testa se retorna null quando há erro de rede
     */
    it('returns null when network error occurs', async () => {
      const mockToken = 'valid-token';
      mockCookieStore.get.mockReturnValue({ value: mockToken });
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await verifyAuthentication();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Erro na verificação de autenticação:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    /**
     * Testa se retorna null quando a resposta não é JSON válido
     */
    it('returns null when response is not valid JSON', async () => {
      const mockToken = 'valid-token';
      mockCookieStore.get.mockReturnValue({ value: mockToken });
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await verifyAuthentication();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Erro na verificação de autenticação:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    /**
     * Testa se funciona com token vazio
     */
    it('returns null when token is empty string', async () => {
      mockCookieStore.get.mockReturnValue({ value: '' });

      const result = await verifyAuthentication();

      expect(result).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    /**
     * Testa se funciona sem NEXT_PUBLIC_BASE_URL
     */
    it('handles missing NEXT_PUBLIC_BASE_URL', async () => {
      delete process.env.NEXT_PUBLIC_BASE_URL;
      const mockToken = 'valid-token';
      mockCookieStore.get.mockReturnValue({ value: mockToken });
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      } as Response);

      const result = await verifyAuthentication();

      expect(result).toEqual(mockUser);
      expect(mockFetch).toHaveBeenCalledWith(
        'undefined/auth/me',
        expect.any(Object)
      );
    });

    /**
     * Testa se trata erro ao acessar cookies
     */
    it('handles error when accessing cookies', async () => {
      mockCookies.mockRejectedValueOnce(new Error('Cookie access error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await verifyAuthentication();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Erro na verificação de autenticação:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    /**
     * Testa se usa cache corretamente (revalidate: 30)
     */
    it('uses correct cache configuration', async () => {
      const mockToken = 'valid-token';
      mockCookieStore.get.mockReturnValue({ value: mockToken });
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      } as Response);

      await verifyAuthentication();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          next: { revalidate: 30 },
        })
      );
    });
  });

  describe('serverLogout', () => {
    /**
     * Testa se o logout remove o cookie e redireciona
     */
    it('deletes auth cookie and redirects to login', async () => {
      await serverLogout();

      expect(mockCookies).toHaveBeenCalled();
      expect(mockCookieStore.delete).toHaveBeenCalledWith(AUTH_COOKIE_NAMES.AUTH_TOKEN);
      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });

    /**
     * Testa se trata erro ao acessar cookies durante logout
     */
    it('handles error when accessing cookies during logout', async () => {
      mockCookies.mockRejectedValueOnce(new Error('Cookie access error'));

      await expect(serverLogout()).rejects.toThrow('Cookie access error');
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    /**
     * Testa se trata erro ao deletar cookie
     */
    it('handles error when deleting cookie', async () => {
      mockCookieStore.delete.mockImplementation(() => {
        throw new Error('Delete error');
      });

      await expect(serverLogout()).rejects.toThrow('Delete error');
    });

    /**
     * Testa se trata erro no redirecionamento
     */
    it('handles error during redirect', async () => {
      // Reset mocks para garantir comportamento limpo
      mockCookieStore.delete.mockImplementation(() => {});
      mockRedirect.mockImplementation(() => {
        throw new Error('Redirect error');
      });

      await expect(serverLogout()).rejects.toThrow('Redirect error');
      expect(mockCookieStore.delete).toHaveBeenCalledWith(AUTH_COOKIE_NAMES.AUTH_TOKEN);
    });

    /**
     * Testa se funciona mesmo quando o cookie não existe
     */
    it('works even when cookie does not exist', async () => {
      // Reset mocks para garantir comportamento limpo
      mockCookieStore.delete.mockImplementation(() => {});
      mockRedirect.mockImplementation(() => {});

      await serverLogout();

      expect(mockCookieStore.delete).toHaveBeenCalledWith(AUTH_COOKIE_NAMES.AUTH_TOKEN);
      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });
  });

  describe('getAuthVerification (internal function)', () => {
    /**
     * Testa se a função interna de verificação funciona com diferentes códigos de status
     */
    it('handles different HTTP status codes correctly', async () => {
      const mockToken = 'valid-token';
      mockCookieStore.get.mockReturnValue({ value: mockToken });
      
      // Teste com 403 Forbidden
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
      } as Response);

      let result = await verifyAuthentication();
      expect(result).toBeNull();

      // Teste com 500 Internal Server Error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      result = await verifyAuthentication();
      expect(result).toBeNull();
    });

    /**
     * Testa se funciona com diferentes tipos de dados de usuário
     */
    it('handles different user data formats', async () => {
      const mockToken = 'valid-token';
      mockCookieStore.get.mockReturnValue({ value: mockToken });
      
      const minimalUser = {
        id: 1,
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao@example.com',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => minimalUser,
      } as Response);

      const result = await verifyAuthentication();

      expect(result).toEqual(minimalUser);
    });
  });
});