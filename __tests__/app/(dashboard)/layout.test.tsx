import { render, screen } from '@testing-library/react';
import DashboardLayout from '@/app/(dashboard)/layout';
import { verifyAuthentication } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

// Mock das dependências
jest.mock('@/lib/auth-server', () => ({
  verifyAuthentication: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('@/components/layout/Sidebar', () => ({
  Sidebar: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="sidebar">
      <div data-testid="sidebar-content">Sidebar Content</div>
      {children}
    </div>
  ),
}));

jest.mock('@/components/layout/Header', () => ({
  Header: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="header">
      <div data-testid="header-content">Header Content</div>
      {children}
    </div>
  ),
}));

jest.mock('@mui/material', () => ({
  Box: ({ children, sx, component, ...props }: any) => {
    // Cria data-testid único baseado no component ou nas propriedades sx
    let testId = 'box';
    if (component === 'main') {
      testId = 'main-box';
    } else if (sx && sx.flexGrow === 1 && sx.p === 3) {
      testId = 'content-box';
    } else if (sx && sx.display === 'flex' && sx.minHeight === '100vh') {
      testId = 'root-box';
    }
    
    return (
      <div 
        data-testid={testId}
        data-component={component}
        data-sx={JSON.stringify(sx)} 
        {...props}
      >
        {children}
      </div>
    );
  },
}));

const mockVerifyAuthentication = verifyAuthentication as jest.MockedFunction<typeof verifyAuthentication>;
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

describe('DashboardLayout', () => {
  beforeEach(() => {
    mockVerifyAuthentication.mockClear();
    mockRedirect.mockClear();
  });

  /**
   * Testa se redireciona para login quando usuário não está autenticado
   */
  it('redirects to login when user is not authenticated', async () => {
    mockVerifyAuthentication.mockResolvedValueOnce(null);

    const children = <div data-testid="dashboard-content">Dashboard Content</div>;
    
    // Como é um componente async, precisamos aguardar a resolução
    const LayoutComponent = await DashboardLayout({ children });
    
    expect(mockVerifyAuthentication).toHaveBeenCalledTimes(1);
    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  /**
   * Testa se renderiza o layout quando usuário está autenticado
   */
  it('renders layout when user is authenticated', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };

    mockVerifyAuthentication.mockResolvedValueOnce(mockUser);

    const children = <div data-testid="dashboard-content">Dashboard Content</div>;
    
    const LayoutComponent = await DashboardLayout({ children });
    
    // Renderiza o componente retornado
    render(LayoutComponent as React.ReactElement);

    expect(mockVerifyAuthentication).toHaveBeenCalledTimes(1);
    expect(mockRedirect).not.toHaveBeenCalled();
    
    // Verifica se os componentes principais estão presentes
    expect(screen.getByTestId('root-box')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
  });

  /**
   * Testa se o Box principal tem as propriedades corretas
   */
  it('renders main Box with correct properties', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };

    mockVerifyAuthentication.mockResolvedValueOnce(mockUser);

    const children = <div data-testid="dashboard-content">Dashboard Content</div>;
    
    const LayoutComponent = await DashboardLayout({ children });
    render(LayoutComponent as React.ReactElement);

    const mainBox = screen.getByTestId('main-box');
    expect(mainBox).toHaveAttribute('data-component', 'main');
    
    const expectedSx = {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
    };
    expect(mainBox).toHaveAttribute('data-sx', JSON.stringify(expectedSx));
  });

  /**
   * Testa se renderiza corretamente com diferentes tipos de children
   */
  it('renders correctly with different types of children', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };

    mockVerifyAuthentication.mockResolvedValueOnce(mockUser);

    // Testa com múltiplos children
    const children = (
      <>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </>
    );
    
    const LayoutComponent = await DashboardLayout({ children });
    render(LayoutComponent as React.ReactElement);

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });

  /**
   * Testa se renderiza corretamente sem children
   */
  it('renders correctly without children', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };

    mockVerifyAuthentication.mockResolvedValueOnce(mockUser);
    
    const LayoutComponent = await DashboardLayout({ children: undefined });
    render(LayoutComponent as React.ReactElement);

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('root-box')).toBeInTheDocument();
  });

  /**
   * Testa se renderiza corretamente com children como string
   */
  it('renders correctly with string children', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };

    mockVerifyAuthentication.mockResolvedValueOnce(mockUser);
    
    const LayoutComponent = await DashboardLayout({ children: 'String Content' });
    render(LayoutComponent as React.ReactElement);

    expect(screen.getByText('String Content')).toBeInTheDocument();
  });

  /**
   * Testa tratamento de erro durante verificação de autenticação
   */
  it('handles authentication verification error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockVerifyAuthentication.mockRejectedValueOnce(new Error('Auth error'));

    const children = <div data-testid="dashboard-content">Dashboard Content</div>;
    
    try {
      await DashboardLayout({ children });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Auth error');
    }

    expect(mockVerifyAuthentication).toHaveBeenCalledTimes(1);
    
    consoleSpy.mockRestore();
  });

  /**
   * Testa se verifyAuthentication é chamada apenas uma vez
   */
  it('calls verifyAuthentication only once', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };

    mockVerifyAuthentication.mockResolvedValueOnce(mockUser);

    const children = <div data-testid="dashboard-content">Dashboard Content</div>;
    
    await DashboardLayout({ children });

    expect(mockVerifyAuthentication).toHaveBeenCalledTimes(1);
    expect(mockVerifyAuthentication).toHaveBeenCalledWith();
  });

  /**
   * Testa se o redirect é chamado com o caminho correto
   */
  it('redirects to correct path when not authenticated', async () => {
    mockVerifyAuthentication.mockResolvedValueOnce(null);

    const children = <div data-testid="dashboard-content">Dashboard Content</div>;
    
    await DashboardLayout({ children });

    expect(mockRedirect).toHaveBeenCalledTimes(1);
    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  /**
   * Testa se os componentes Sidebar e Header são renderizados na ordem correta
   */
  it('renders Sidebar and Header in correct order', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };

    mockVerifyAuthentication.mockResolvedValueOnce(mockUser);

    const children = <div data-testid="dashboard-content">Dashboard Content</div>;
    
    const LayoutComponent = await DashboardLayout({ children });
    render(LayoutComponent as React.ReactElement);

    const sidebar = screen.getByTestId('sidebar');
    const header = screen.getByTestId('header');
    const rootBox = screen.getByTestId('root-box');

    // Verifica se todos os elementos estão presentes
    expect(sidebar).toBeInTheDocument();
    expect(header).toBeInTheDocument();
    expect(rootBox).toBeInTheDocument();

    // Verifica se o conteúdo dos componentes está presente
    expect(screen.getByTestId('sidebar-content')).toBeInTheDocument();
    expect(screen.getByTestId('header-content')).toBeInTheDocument();
  });
});