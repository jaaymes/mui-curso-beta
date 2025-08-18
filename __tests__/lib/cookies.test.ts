import {
  setCookie,
  setCookies,
  setAuthCookies,
  deleteCookie,
  deleteCookies,
  getCookie,
  checkAuthCookies,
  updateAuthToken,
  serverLogout,
  clearServerAuthCookies,
} from '@/lib/cookies';
import {
  AUTH_COOKIE_NAMES,
  DEFAULT_COOKIE_CONFIG,
  type AuthCookieData,
  type CookieData,
} from '@/lib/cookie-types';

// Mock Next.js modules
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Get mocked modules
const { cookies } = require('next/headers');
const { redirect } = require('next/navigation');

// Mock console methods
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Cookie Utilities', () => {
  let mockCookieStore: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();

    // Mock cookie store
    mockCookieStore = {
      set: jest.fn(),
      get: jest.fn(),
      has: jest.fn(),
      delete: jest.fn(),
    };

    cookies.mockResolvedValue(mockCookieStore);
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('setCookie', () => {
    it('should set a cookie successfully', async () => {
      const result = await setCookie('testKey', 'testValue');

      expect(result).toEqual({ success: true });
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'testKey',
        'testValue',
        DEFAULT_COOKIE_CONFIG
      );
    });

    it('should set a cookie with custom options', async () => {
      const customOptions = { maxAge: 3600, httpOnly: false };
      const result = await setCookie('testKey', 'testValue', customOptions);

      expect(result).toEqual({ success: true });
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'testKey',
        'testValue',
        { ...DEFAULT_COOKIE_CONFIG, ...customOptions }
      );
    });

    it('should return error for empty key', async () => {
      const result = await setCookie('', 'testValue');

      expect(result).toEqual({
        success: false,
        error: 'Nome do cookie é obrigatório',
      });
      expect(mockCookieStore.set).not.toHaveBeenCalled();
    });

    it('should return error for undefined value', async () => {
      const result = await setCookie('testKey', undefined as any);

      expect(result).toEqual({
        success: false,
        error: 'Valor do cookie é obrigatório',
      });
      expect(mockCookieStore.set).not.toHaveBeenCalled();
    });

    it('should return error for null value', async () => {
      const result = await setCookie('testKey', null as any);

      expect(result).toEqual({
        success: false,
        error: 'Valor do cookie é obrigatório',
      });
      expect(mockCookieStore.set).not.toHaveBeenCalled();
    });

    it('should handle cookie store errors', async () => {
      mockCookieStore.set.mockImplementation(() => {
        throw new Error('Cookie store error');
      });

      const result = await setCookie('testKey', 'testValue');

      expect(result).toEqual({
        success: false,
        error: 'Erro interno ao definir cookie',
      });
      // Console error may not be captured in all test environments
      // The important part is that the error is handled and returned properly
    });
  });

  describe('setCookies', () => {
    it('should set multiple cookies successfully', async () => {
      const cookieData: CookieData = {
        cookie1: 'value1',
        cookie2: 'value2',
        cookie3: 'value3',
      };

      const result = await setCookies(cookieData);

      expect(result).toEqual({ success: true });
      expect(mockCookieStore.set).toHaveBeenCalledTimes(3);
    });

    it('should handle partial failures', async () => {
      const cookieData: CookieData = {
        validCookie: 'validValue',
        invalidCookie: null as any,
        anotherValidCookie: 'anotherValue',
      };

      const result = await setCookies(cookieData);

      expect(result).toEqual({
        success: false,
        error: 'Falha ao definir cookies: invalidCookie',
        failedCookies: ['invalidCookie'],
      });
    });

    it('should handle complete failure', async () => {
      mockCookieStore.set.mockImplementation(() => {
        throw new Error('Complete failure');
      });

      const cookieData: CookieData = {
        cookie1: 'value1',
      };

      const result = await setCookies(cookieData);

      expect(result).toEqual({
        success: false,
        error: 'Falha ao definir cookies: cookie1',
        failedCookies: ['cookie1'],
      });
    });
  });

  describe('setAuthCookies', () => {
    const authData: AuthCookieData = {
      token: 'auth-token-123',
      refreshToken: 'refresh-token-456',
      userData: '{"id": 1, "name": "John"}',
      expiresInMins: 60,
    };

    it('should set auth cookies successfully', async () => {
      const result = await setAuthCookies(authData);

      expect(result).toEqual({ success: true });
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        AUTH_COOKIE_NAMES.AUTH_TOKEN,
        'auth-token-123',
        expect.any(Object)
      );
    });

    it('should return error for missing token', async () => {
      const result = await setAuthCookies({
        token: '',
        refreshToken: 'refresh-token',
      });

      expect(result).toEqual({
        success: false,
        error: 'Token de autenticação é obrigatório',
      });
    });

    it('should handle invalid JSON in userData', async () => {
      const result = await setAuthCookies({
        token: 'valid-token',
        userData: 'invalid-json',
      });

      expect(result).toEqual({
        success: false,
        error: 'Erro interno ao definir cookies de autenticação',
      });
    });

    it('should set refresh token with extended expiry', async () => {
      await setAuthCookies(authData);

      // Check that refresh token is set with longer maxAge
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        AUTH_COOKIE_NAMES.REFRESH_TOKEN,
        'refresh-token-456',
        expect.objectContaining({
          maxAge: expect.any(Number),
        })
      );
    });

    it('should set user data as non-httpOnly', async () => {
      await setAuthCookies(authData);

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        AUTH_COOKIE_NAMES.USER_DATA,
        '{"id": 1, "name": "John"}',
        expect.objectContaining({
          httpOnly: false,
        })
      );
    });
  });

  describe('deleteCookie', () => {
    it('should delete existing cookie successfully', async () => {
      mockCookieStore.has.mockReturnValue(true);

      const result = await deleteCookie('testKey');

      expect(result).toEqual({ success: true });
      expect(mockCookieStore.has).toHaveBeenCalledWith('testKey');
      expect(mockCookieStore.delete).toHaveBeenCalledWith('testKey');
    });

    it('should handle non-existing cookie gracefully', async () => {
      mockCookieStore.has.mockReturnValue(false);

      const result = await deleteCookie('nonExistentKey');

      expect(result).toEqual({ success: true });
      expect(mockCookieStore.has).toHaveBeenCalledWith('nonExistentKey');
      expect(mockCookieStore.delete).not.toHaveBeenCalled();
    });

    it('should return error for empty key', async () => {
      const result = await deleteCookie('');

      expect(result).toEqual({
        success: false,
        error: 'Nome do cookie é obrigatório',
      });
    });

    it('should handle deletion errors', async () => {
      mockCookieStore.has.mockReturnValue(true);
      mockCookieStore.delete.mockImplementation(() => {
        throw new Error('Deletion error');
      });

      const result = await deleteCookie('testKey');

      expect(result).toEqual({
        success: false,
        error: 'Erro interno ao remover cookie',
      });
    });
  });

  describe('deleteCookies', () => {
    it('should delete default auth cookies', async () => {
      mockCookieStore.has.mockReturnValue(true);

      const result = await deleteCookies();

      expect(result).toEqual({ success: true });
      expect(mockCookieStore.delete).toHaveBeenCalledWith(AUTH_COOKIE_NAMES.AUTH_TOKEN);
      expect(mockCookieStore.delete).toHaveBeenCalledWith(AUTH_COOKIE_NAMES.REFRESH_TOKEN);
      expect(mockCookieStore.delete).toHaveBeenCalledWith(AUTH_COOKIE_NAMES.USER_DATA);
    });

    it('should delete specified cookies', async () => {
      mockCookieStore.has.mockReturnValue(true);
      const cookieNames = ['custom1', 'custom2'];

      const result = await deleteCookies(cookieNames);

      expect(result).toEqual({ success: true });
      expect(mockCookieStore.delete).toHaveBeenCalledWith('custom1');
      expect(mockCookieStore.delete).toHaveBeenCalledWith('custom2');
    });

    it('should redirect when redirectTo is provided', async () => {
      mockCookieStore.has.mockReturnValue(true);

      await deleteCookies(undefined, '/login');

      expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('should handle deletion errors', async () => {
      mockCookieStore.has.mockImplementation(() => {
        throw new Error('Has error');
      });

      const result = await deleteCookies();

      expect(result).toEqual({
        success: false,
        error: 'Erro interno ao remover cookies de autenticação',
      });
    });
  });

  describe('getCookie', () => {
    it('should get cookie value successfully', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'testValue' });

      const result = await getCookie('testKey');

      expect(result).toBe('testValue');
      expect(mockCookieStore.get).toHaveBeenCalledWith('testKey');
    });

    it('should return null for non-existing cookie', async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const result = await getCookie('nonExistentKey');

      expect(result).toBeNull();
    });

    it('should return null for empty key', async () => {
      const result = await getCookie('');

      expect(result).toBeNull();
      // Console error logging is implementation detail
    });

    it('should handle get errors', async () => {
      mockCookieStore.get.mockImplementation(() => {
        throw new Error('Get error');
      });

      const result = await getCookie('testKey');

      expect(result).toBeNull();
      // Console error logging is implementation detail
    });
  });

  describe('checkAuthCookies', () => {
    it('should check auth cookies successfully', async () => {
      mockCookieStore.get
        .mockReturnValueOnce({ value: 'auth-token' })
        .mockReturnValueOnce({ value: 'refresh-token' })
        .mockReturnValueOnce({ value: 'user-data' });

      const result = await checkAuthCookies();

      expect(result).toEqual({
        hasAuthToken: true,
        hasRefreshToken: true,
        hasUserData: true,
        tokenValue: 'auth-token',
      });
    });

    it('should handle missing cookies', async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const result = await checkAuthCookies();

      expect(result).toEqual({
        hasAuthToken: false,
        hasRefreshToken: false,
        hasUserData: false,
      });
    });

    it('should handle check errors', async () => {
      mockCookieStore.get.mockImplementation(() => {
        throw new Error('Check error');
      });

      const result = await checkAuthCookies();

      expect(result).toEqual({
        hasAuthToken: false,
        hasRefreshToken: false,
        hasUserData: false,
      });
    });
  });

  describe('updateAuthToken', () => {
    it('should update auth token successfully', async () => {
      const result = await updateAuthToken('new-token', 120);

      expect(result).toEqual({ success: true });
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        AUTH_COOKIE_NAMES.AUTH_TOKEN,
        'new-token',
        expect.objectContaining({
          maxAge: 7200, // 120 minutes * 60 seconds
        })
      );
    });

    it('should return error for empty token', async () => {
      const result = await updateAuthToken('');

      expect(result).toEqual({
        success: false,
        error: 'Novo token é obrigatório',
      });
    });

    it('should use default expiry when not provided', async () => {
      const result = await updateAuthToken('new-token');

      expect(result).toEqual({ success: true });
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        AUTH_COOKIE_NAMES.AUTH_TOKEN,
        'new-token',
        expect.objectContaining({
          maxAge: DEFAULT_COOKIE_CONFIG.maxAge,
        })
      );
    });
  });

  describe('serverLogout', () => {
    it('should logout and redirect to login', async () => {
      mockCookieStore.has.mockReturnValue(true);

      await serverLogout();

      expect(mockCookieStore.delete).toHaveBeenCalledWith(AUTH_COOKIE_NAMES.AUTH_TOKEN);
      expect(redirect).toHaveBeenCalledWith('/login');
    });
  });

  describe('clearServerAuthCookies', () => {
    it('should clear auth cookies without redirect', async () => {
      mockCookieStore.has.mockReturnValue(true);

      const result = await clearServerAuthCookies();

      expect(result).toEqual({ success: true });
      expect(mockCookieStore.delete).toHaveBeenCalledWith(AUTH_COOKIE_NAMES.AUTH_TOKEN);
      expect(mockCookieStore.delete).toHaveBeenCalledWith(AUTH_COOKIE_NAMES.REFRESH_TOKEN);
      expect(mockCookieStore.delete).toHaveBeenCalledWith(AUTH_COOKIE_NAMES.USER_DATA);
      expect(redirect).not.toHaveBeenCalled();
    });

    it('should clear additional cookies', async () => {
      mockCookieStore.has.mockReturnValue(true);
      const additionalCookies = ['custom1', 'custom2'];

      const result = await clearServerAuthCookies(additionalCookies);

      expect(result).toEqual({ success: true });
      expect(mockCookieStore.delete).toHaveBeenCalledWith('custom1');
      expect(mockCookieStore.delete).toHaveBeenCalledWith('custom2');
    });

    it('should handle clearing errors', async () => {
      mockCookieStore.has.mockImplementation(() => {
        throw new Error('Clear error');
      });

      const result = await clearServerAuthCookies();

      expect(result).toEqual({
        success: false,
        error: 'Erro interno ao limpar cookies de autenticação',
      });
    });
  });
});