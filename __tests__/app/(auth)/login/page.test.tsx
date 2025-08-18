import { render, screen } from '@testing-library/react';
import LoginPage from '@/app/(auth)/login/page';
import { setCookie } from '@/lib/cookies';

// Mock das dependências
jest.mock('@/lib/cookies', () => ({
  setCookie: jest.fn(),
}));

jest.mock('@/components/auth/LoginForm', () => ({
  LoginForm: ({ loginAction }: { loginAction: Function }) => (
    <div data-testid="login-form">
      <button
        data-testid="test-login-action"
        onClick={() => {
          const formData = new FormData();
          formData.append('username', 'test');
          formData.append('password', 'test');
          loginAction(formData);
        }}
      >
        Test Login
      </button>
    </div>
  ),
}));

jest.mock('@mui/material', () => ({
  Card: ({ children, elevation, sx }: any) => (
    <div data-testid="login-card" data-elevation={elevation} data-sx={JSON.stringify(sx)}>
      {children}
    </div>
  ),
  CardContent: ({ children, sx }: any) => (
    <div data-testid="card-content" data-sx={JSON.stringify(sx)}>
      {children}
    </div>
  ),
  Box: ({ children, sx, ...props }: any) => (
    <div data-testid="box" data-sx={JSON.stringify(sx)} {...props}>
      {children}
    </div>
  ),
  Typography: ({ children, variant, component, ...props }: any) => (
    <div data-testid={`typography-${variant}`} data-component={component} {...props}>
      {children}
    </div>
  ),
  Divider: ({ children, sx }: any) => (
    <div data-testid="divider" data-sx={JSON.stringify(sx)}>
      {children}
    </div>
  ),
  Chip: ({ label, size }: any) => (
    <div data-testid="chip" data-label={label} data-size={size}>
      {label}
    </div>
  ),
}));

jest.mock('@mui/icons-material', () => ({
  Dashboard: (props: any) => <svg data-testid="DashboardIcon" {...props}><path /></svg>,
}));

// Mock do fetch global
global.fetch = jest.fn();

const mockSetCookie = setCookie as jest.MockedFunction<typeof setCookie>;
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('LoginPage', () => {
  beforeEach(() => {
    mockSetCookie.mockClear();
    mockFetch.mockClear();
  });

  /**
   * Testa se a página de login renderiza todos os elementos principais
   */
  it('renders all main elements', () => {
    render(<LoginPage />);

    // Verifica elementos principais
    expect(screen.getByTestId('login-card')).toBeInTheDocument();
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
    expect(screen.getByTestId('DashboardIcon')).toBeInTheDocument();
    expect(screen.getByTestId('login-form')).toBeInTheDocument();

    // Verifica textos
    expect(screen.getByTestId('typography-h4')).toHaveTextContent('Aplicativo Dashboard');
    expect(screen.getByTestId('typography-body1')).toHaveTextContent(
      'Faça login para acessar seu painel administrativo'
    );

    // Verifica credenciais de demonstração
    expect(screen.getByTestId('chip')).toHaveAttribute('data-label', 'Credenciais de Demonstração');
    expect(screen.getByText('emilys / emilyspass')).toBeInTheDocument();
    expect(screen.getByText('michaelw / michaelwpass')).toBeInTheDocument();
    expect(screen.getByText('sophiab / sophiabpass')).toBeInTheDocument();
  });

  /**
   * Testa se o Card tem as propriedades corretas
   */
  it('renders Card with correct properties', () => {
    render(<LoginPage />);

    const card = screen.getByTestId('login-card');
    expect(card).toHaveAttribute('data-elevation', '8');

    const expectedSx = {
      borderRadius: 2,
      overflow: 'visible',
    };
    expect(card).toHaveAttribute('data-sx', JSON.stringify(expectedSx));
  });

  /**
   * Testa se o CardContent tem padding correto
   */
  it('renders CardContent with correct padding', () => {
    render(<LoginPage />);

    const cardContent = screen.getByTestId('card-content');
    const expectedSx = { p: 4 };
    expect(cardContent).toHaveAttribute('data-sx', JSON.stringify(expectedSx));
  });

  /**
   * Testa se a seção de credenciais de demonstração tem os estilos corretos
   */
  it('renders demo credentials section with correct styles', () => {
    render(<LoginPage />);

    const demoBox = screen.getAllByTestId('box').find(box => {
      const sx = JSON.parse(box.getAttribute('data-sx') || '{}');
      return sx.bgcolor === 'grey.50';
    });

    expect(demoBox).toBeInTheDocument();

    const expectedSx = {
      bgcolor: 'grey.50',
      p: 2,
      borderRadius: 1,
      border: '1px solid',
      borderColor: 'grey.200',
    };

    expect(demoBox).toHaveAttribute('data-sx', JSON.stringify(expectedSx));
  });

  /**
   * Testa se todas as credenciais de demonstração estão presentes
   */
  it('displays all demo credentials', () => {
    render(<LoginPage />);

    const credentials = [
      'emilys / emilyspass',
      'michaelw / michaelwpass',
      'sophiab / sophiabpass',
    ];

    credentials.forEach(credential => {
      expect(screen.getByText(credential)).toBeInTheDocument();
    });

    expect(screen.getByText('Contas de Demonstração (DummyJSON):')).toBeInTheDocument();
  });

  /**
   * Testa se o Chip tem as propriedades corretas
   */
  it('renders Chip with correct properties', () => {
    render(<LoginPage />);

    const chip = screen.getByTestId('chip');
    expect(chip).toHaveAttribute('data-label', 'Credenciais de Demonstração');
    expect(chip).toHaveAttribute('data-size', 'small');
  });

  /**
   * Testa se o ícone Dashboard tem as propriedades corretas
   */
  it('renders Dashboard icon with correct properties', () => {
    render(<LoginPage />);

    const icon = screen.getByTestId('DashboardIcon');
    expect(icon).toBeInTheDocument();
  });

  /**
   * Testa se o título tem as propriedades corretas
   */
  it('renders title with correct properties', () => {
    render(<LoginPage />);

    const title = screen.getByTestId('typography-h4');
    expect(title).toHaveAttribute('data-component', 'h1');
    expect(title).toHaveTextContent('Aplicativo Dashboard');
  });

  /**
   * Testa se a descrição tem as propriedades corretas
   */
  it('renders description with correct properties', () => {
    render(<LoginPage />);

    const description = screen.getByTestId('typography-body1');
    expect(description).toHaveTextContent(
      'Faça login para acessar seu painel administrativo'
    );
  });

  /**
   * Testa se o Divider está presente
   */
  it('renders Divider with Chip', () => {
    render(<LoginPage />);

    const divider = screen.getByTestId('divider');
    expect(divider).toBeInTheDocument();
    expect(divider).toContainElement(screen.getByTestId('chip'));
  });
});

// Testes para a loginAction (Server Action)
describe('loginAction', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockSetCookie.mockClear();
  });

  /**
   * Testa login bem-sucedido
   */
  it('handles successful login', async () => {
    const mockUserData = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      gender: 'male',
      image: 'test.jpg',
      accessToken: 'test-token',
      refreshToken: 'refresh-token',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserData,
    } as Response);

    // Renderiza a página para acessar a loginAction
    render(<LoginPage />);

    // Simula o clique no botão de teste que chama loginAction
    const testButton = screen.getByTestId('test-login-action');
    testButton.click();

    // Aguarda a execução
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockFetch).toHaveBeenCalledWith('https://dummyjson.com/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'test',
        password: 'test',
        expiresInMins: 30,
      }),
    });
  });

  /**
   * Testa login com falha
   */
  it('handles failed login', async () => {
    const mockErrorData = {
      message: 'Credenciais inválidas',
    };

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => mockErrorData,
    } as Response);

    render(<LoginPage />);

    const testButton = screen.getByTestId('test-login-action');
    testButton.click();

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  /**
   * Testa erro de rede
   */
  it('handles network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<LoginPage />);

    const testButton = screen.getByTestId('test-login-action');
    testButton.click();

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith('Erro no login:', expect.any(Error));

    consoleSpy.mockRestore();
  });
});