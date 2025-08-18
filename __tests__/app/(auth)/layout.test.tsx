import { render } from '@testing-library/react';
import { redirect } from 'next/navigation';
import AuthLayout from '@/app/(auth)/layout';
import { verifyAuthentication } from '@/lib/auth-server';

// Mock das dependências
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('@/lib/auth-server', () => ({
  verifyAuthentication: jest.fn(),
}));

jest.mock('@mui/material', () => ({
  Box: ({ children, sx, ...props }: any) => (
    <div data-testid="auth-box" data-sx={JSON.stringify(sx)} {...props}>
      {children}
    </div>
  ),
  Container: ({ children, maxWidth, ...props }: any) => (
    <div data-testid="auth-container" data-maxwidth={maxWidth} {...props}>
      {children}
    </div>
  ),
}));

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockVerifyAuthentication = verifyAuthentication as jest.MockedFunction<
  typeof verifyAuthentication
>;

describe('AuthLayout', () => {
  beforeEach(() => {
    mockRedirect.mockClear();
    mockVerifyAuthentication.mockClear();
  });

  /**
   * Testa se redireciona para dashboard quando usuário está autenticado
   */
  it('redirects to dashboard when user is authenticated', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };

    mockVerifyAuthentication.mockResolvedValue(mockUser);

    await AuthLayout({
      children: <div data-testid="auth-children">Auth Content</div>,
    });

    expect(mockVerifyAuthentication).toHaveBeenCalledTimes(1);
    expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
    expect(mockRedirect).toHaveBeenCalledTimes(1);
  });

  /**
   * Testa se renderiza o layout quando usuário não está autenticado
   */
  it('renders layout when user is not authenticated', async () => {
    mockVerifyAuthentication.mockResolvedValue(null);

    const result = await AuthLayout({
      children: <div data-testid="auth-children">Auth Content</div>,
    });

    expect(mockVerifyAuthentication).toHaveBeenCalledTimes(1);
    expect(mockRedirect).not.toHaveBeenCalled();

    // Renderiza o resultado para testar a estrutura
    const { getByTestId } = render(result as React.ReactElement);

    expect(getByTestId('auth-box')).toBeInTheDocument();
    expect(getByTestId('auth-container')).toBeInTheDocument();
    expect(getByTestId('auth-children')).toBeInTheDocument();
    expect(getByTestId('auth-children')).toHaveTextContent('Auth Content');
  });

  /**
   * Testa se o Box tem os estilos corretos
   */
  it('applies correct styles to Box component', async () => {
    mockVerifyAuthentication.mockResolvedValue(null);

    const result = await AuthLayout({
      children: <div>Test</div>,
    });

    const { getByTestId } = render(result as React.ReactElement);
    const boxElement = getByTestId('auth-box');

    const expectedStyles = {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    expect(boxElement).toHaveAttribute(
      'data-sx',
      JSON.stringify(expectedStyles)
    );
  });

  /**
   * Testa se o Container tem maxWidth correto
   */
  it('sets correct maxWidth on Container', async () => {
    mockVerifyAuthentication.mockResolvedValue(null);

    const result = await AuthLayout({
      children: <div>Test</div>,
    });

    const { getByTestId } = render(result as React.ReactElement);
    const containerElement = getByTestId('auth-container');

    expect(containerElement).toHaveAttribute('data-maxwidth', 'sm');
  });

  /**
   * Testa se funciona com diferentes tipos de children
   */
  it('handles different types of children', async () => {
    mockVerifyAuthentication.mockResolvedValue(null);

    const result = await AuthLayout({
      children: (
        <>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </>
      ),
    });

    const { getByTestId } = render(result as React.ReactElement);

    expect(getByTestId('child-1')).toBeInTheDocument();
    expect(getByTestId('child-2')).toBeInTheDocument();
  });

  /**
   * Testa tratamento de erro na verificação de autenticação
   */
  it('handles authentication verification error', async () => {
    mockVerifyAuthentication.mockRejectedValue(new Error('Auth error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    try {
      await AuthLayout({
        children: <div>Test</div>,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Auth error');
    }

    expect(mockVerifyAuthentication).toHaveBeenCalledTimes(1);
    consoleSpy.mockRestore();
  });
});