import { redirect } from 'next/navigation';
import Home from '@/app/page';

// Mock do redirect do Next.js
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

describe('Home Page', () => {
  beforeEach(() => {
    mockRedirect.mockClear();
  });

  /**
   * Testa se a página principal redireciona para /login
   */
  it('redirects to login page', async () => {
    await Home();

    expect(mockRedirect).toHaveBeenCalledWith('/login');
    expect(mockRedirect).toHaveBeenCalledTimes(1);
  });

  /**
   * Testa se a função é assíncrona
   */
  it('is an async function', () => {
    const result = Home();
    expect(result).toBeInstanceOf(Promise);
  });

  /**
   * Testa se não há efeitos colaterais além do redirect
   */
  it('only calls redirect without side effects', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await Home();

    expect(consoleSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith('/login');

    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});