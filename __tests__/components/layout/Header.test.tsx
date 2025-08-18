import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '@/components/layout/Header';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/store/use-auth';

// Mock das dependências
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

jest.mock('@/store/use-auth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@mui/material', () => ({
  AppBar: ({ children, position, color, elevation, sx }: any) => (
    <div 
      data-testid="app-bar" 
      data-position={position}
      data-color={color}
      data-elevation={elevation}
      data-sx={JSON.stringify(sx)}
    >
      {children}
    </div>
  ),
  Toolbar: ({ children, sx }: any) => (
    <div data-testid="toolbar" data-sx={JSON.stringify(sx)}>
      {children}
    </div>
  ),
  Typography: ({ children, variant, fontWeight, color, ...props }: any) => (
    <div 
      data-testid={`typography-${variant}`} 
      data-font-weight={fontWeight}
      data-color={color}
      {...props}
    >
      {children}
    </div>
  ),
  Box: ({ children, sx, display, alignItems, gap, ...props }: any) => (
    <div 
      data-testid="box" 
      data-display={display}
      data-align-items={alignItems}
      data-gap={gap}
      data-sx={JSON.stringify(sx)}
      {...props}
    >
      {children}
    </div>
  ),
  IconButton: ({ children, onClick, sx, color, ...props }: any) => (
    <button 
      data-testid={props['data-testid'] || 'icon-button'}
      onClick={onClick}
      data-color={color}
      data-sx={JSON.stringify(sx)}
      {...props}
    >
      {children}
    </button>
  ),
  Avatar: ({ src, sx, children }: any) => (
    <div 
      data-testid="avatar" 
      data-src={src}
      data-sx={JSON.stringify(sx)}
    >
      {children}
    </div>
  ),
  Menu: ({ children, anchorEl, open, onClose, onClick, transformOrigin, anchorOrigin, PaperProps }: any) => (
    open ? (
      <div 
        data-testid="menu" 
        data-open={open}
        data-transform-origin={JSON.stringify(transformOrigin)}
        data-anchor-origin={JSON.stringify(anchorOrigin)}
        data-paper-props={JSON.stringify(PaperProps)}
        onClick={onClick}
      >
        {children}
      </div>
    ) : null
  ),
  MenuItem: ({ children, onClick, ...props }: any) => (
    <div 
      data-testid={props['data-testid'] || 'menu-item'}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  ),
  Divider: (props: any) => <div data-testid="divider" {...props} />,
  ListItemIcon: ({ children }: any) => (
    <div data-testid="list-item-icon">{children}</div>
  ),
  FormControlLabel: ({ control, label, sx }: any) => (
    <div data-testid="form-control-label" data-sx={JSON.stringify(sx)}>
      {control}
      <span data-testid="form-label">{label}</span>
    </div>
  ),
  Switch: ({ checked, onChange, size, ...props }: any) => (
    <input 
      type="checkbox"
      data-testid={props['data-testid'] || 'switch'}
      checked={checked}
      onChange={onChange}
      data-size={size}
      {...props}
    />
  ),
}));

jest.mock('@mui/icons-material', () => ({
  Notifications: (props: any) => <svg data-testid="NotificationsIcon" {...props}><path /></svg>,
  AccountCircle: (props: any) => <svg data-testid="AccountCircleIcon" {...props}><path /></svg>,
  Settings: (props: any) => <svg data-testid="SettingsIcon" {...props}><path /></svg>,
  Logout: (props: any) => <svg data-testid="LogoutIcon" {...props}><path /></svg>,
  Brightness4: (props: any) => <svg data-testid="Brightness4Icon" {...props}><path /></svg>,
  Brightness7: (props: any) => <svg data-testid="Brightness7Icon" {...props}><path /></svg>,
}));

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const mockUser = {
  id: 1,
  name: 'João Silva',
  email: 'joao@example.com',
  avatar: 'https://example.com/avatar.jpg',
  role: 'admin',
};

const mockThemeConfig = {
  mode: 'light' as const,
  primaryColor: '#1976d2',
};

const mockToggleMode = jest.fn();
const mockLogout = jest.fn();

describe('Header', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
      login: jest.fn(),
      isAuthenticated: true,
    });

    mockUseTheme.mockReturnValue({
      themeConfig: mockThemeConfig,
      toggleMode: mockToggleMode,
      updateTheme: jest.fn(),
    });

    mockToggleMode.mockClear();
    mockLogout.mockClear();
  });

  /**
   * Testa se o Header renderiza todos os elementos principais
   */
  it('renders all main elements', () => {
    render(<Header />);

    expect(screen.getByTestId('app-bar')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('typography-h6')).toHaveTextContent('Painel');
    expect(screen.getByTestId('notifications-button')).toBeInTheDocument();
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
  });

  /**
   * Testa se o AppBar tem as propriedades corretas
   */
  it('renders AppBar with correct properties', () => {
    render(<Header />);

    const appBar = screen.getByTestId('app-bar');
    expect(appBar).toHaveAttribute('data-position', 'static');
    expect(appBar).toHaveAttribute('data-color', 'inherit');
    expect(appBar).toHaveAttribute('data-elevation', '0');

    const expectedSx = {
      borderBottom: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.paper',
    };
    expect(appBar).toHaveAttribute('data-sx', JSON.stringify(expectedSx));
  });

  /**
   * Testa se o Toolbar tem as propriedades corretas
   */
  it('renders Toolbar with correct properties', () => {
    render(<Header />);

    const toolbar = screen.getByTestId('toolbar');
    const expectedSx = { justifyContent: 'space-between' };
    expect(toolbar).toHaveAttribute('data-sx', JSON.stringify(expectedSx));
  });

  /**
   * Testa se o título é renderizado corretamente
   */
  it('renders title correctly', () => {
    render(<Header />);

    const title = screen.getByTestId('typography-h6');
    expect(title).toHaveTextContent('Painel');
    expect(title).toHaveAttribute('data-font-weight', 'bold');
    expect(title).toHaveAttribute('data-color', 'text.primary');
  });

  /**
   * Testa se o Avatar é renderizado com as propriedades corretas
   */
  it('renders Avatar with correct properties', () => {
    render(<Header />);

    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveAttribute('data-src', mockUser.avatar);
    expect(avatar).toHaveTextContent('J'); // Primeira letra do nome

    const expectedSx = {
      width: 32,
      height: 32,
      bgcolor: 'primary.main',
    };
    expect(avatar).toHaveAttribute('data-sx', JSON.stringify(expectedSx));
  });

  /**
   * Testa se o Avatar renderiza a primeira letra quando não há avatar
   */
  it('renders Avatar with first letter when no avatar', () => {
    mockUseAuth.mockReturnValue({
      user: { ...mockUser, avatar: undefined },
      logout: mockLogout,
      login: jest.fn(),
      isAuthenticated: true,
    });

    render(<Header />);

    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveTextContent('J');
  });

  /**
   * Testa se o menu do usuário abre ao clicar no avatar
   */
  it('opens user menu when clicking avatar', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const userMenuButton = screen.getByTestId('user-menu');
    await user.click(userMenuButton);

    expect(screen.getByTestId('menu')).toBeInTheDocument();
  });

  /**
   * Testa se o menu do usuário fecha ao clicar fora
   */
  it('closes user menu when clicking outside', async () => {
    const user = userEvent.setup();
    render(<Header />);

    // Abre o menu
    const userMenuButton = screen.getByTestId('user-menu');
    await user.click(userMenuButton);
    expect(screen.getByTestId('menu')).toBeInTheDocument();

    // Simula clique no menu (que fecha o menu)
    const menu = screen.getByTestId('menu');
    fireEvent.click(menu);

    await waitFor(() => {
      expect(screen.queryByTestId('menu')).not.toBeInTheDocument();
    });
  });

  /**
   * Testa se as informações do usuário são exibidas no menu
   */
  it('displays user information in menu', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const userMenuButton = screen.getByTestId('user-menu');
    await user.click(userMenuButton);

    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
  });

  /**
   * Testa se os itens do menu são renderizados
   */
  it('renders menu items', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const userMenuButton = screen.getByTestId('user-menu');
    await user.click(userMenuButton);

    expect(screen.getByText('Perfil')).toBeInTheDocument();
    expect(screen.getByText('Sair')).toBeInTheDocument();
    expect(screen.getByTestId('AccountCircleIcon')).toBeInTheDocument();
    expect(screen.getByTestId('LogoutIcon')).toBeInTheDocument();
  });

  /**
   * Testa se o toggle de tema funciona corretamente
   */
  it('handles theme toggle correctly', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const userMenuButton = screen.getByTestId('user-menu');
    await user.click(userMenuButton);

    const themeToggle = screen.getByTestId('theme-toggle');
    expect(themeToggle).not.toBeChecked(); // Modo light
    expect(screen.getByTestId('Brightness7Icon')).toBeInTheDocument();

    await user.click(themeToggle);
    expect(mockToggleMode).toHaveBeenCalledTimes(1);
  });

  /**
   * Testa se o toggle de tema mostra o ícone correto para modo escuro
   */
  it('shows correct icon for dark mode', async () => {
    mockUseTheme.mockReturnValue({
      themeConfig: { ...mockThemeConfig, mode: 'dark' },
      toggleMode: mockToggleMode,
      updateTheme: jest.fn(),
    });

    const user = userEvent.setup();
    render(<Header />);

    const userMenuButton = screen.getByTestId('user-menu');
    await user.click(userMenuButton);

    const themeToggle = screen.getByTestId('theme-toggle');
    expect(themeToggle).toBeChecked(); // Modo dark
    expect(screen.getByTestId('Brightness4Icon')).toBeInTheDocument();
  });

  /**
   * Testa se o logout funciona corretamente
   */
  it('handles logout correctly', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const userMenuButton = screen.getByTestId('user-menu');
    await user.click(userMenuButton);

    const logoutButton = screen.getByTestId('logout-button');
    await user.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  /**
   * Testa se o botão de notificações está presente
   */
  it('renders notifications button', () => {
    render(<Header />);

    const notificationsButton = screen.getByTestId('notifications-button');
    expect(notificationsButton).toBeInTheDocument();
    expect(notificationsButton).toHaveAttribute('data-color', 'inherit');
    expect(screen.getByTestId('NotificationsIcon')).toBeInTheDocument();
  });

  /**
   * Testa se o menu tem as propriedades corretas
   */
  it('renders menu with correct properties', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const userMenuButton = screen.getByTestId('user-menu');
    await user.click(userMenuButton);

    const menu = screen.getByTestId('menu');
    expect(menu).toHaveAttribute('data-open', 'true');

    const expectedTransformOrigin = { horizontal: 'right', vertical: 'top' };
    const expectedAnchorOrigin = { horizontal: 'right', vertical: 'bottom' };
    const expectedPaperProps = { sx: { mt: 1, minWidth: 250 } };

    expect(menu).toHaveAttribute('data-transform-origin', JSON.stringify(expectedTransformOrigin));
    expect(menu).toHaveAttribute('data-anchor-origin', JSON.stringify(expectedAnchorOrigin));
    expect(menu).toHaveAttribute('data-paper-props', JSON.stringify(expectedPaperProps));
  });

  /**
   * Testa se os dividers estão presentes no menu
   */
  it('renders dividers in menu', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const userMenuButton = screen.getByTestId('user-menu');
    await user.click(userMenuButton);

    const dividers = screen.getAllByTestId('divider');
    expect(dividers).toHaveLength(3); // 3 dividers no menu
  });

  /**
   * Testa se o componente funciona sem usuário
   */
  it('handles missing user gracefully', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      logout: mockLogout,
      login: jest.fn(),
      isAuthenticated: false,
    });

    render(<Header />);

    expect(screen.getByTestId('app-bar')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
  });

  /**
   * Testa se o FormControlLabel tem as propriedades corretas
   */
  it('renders FormControlLabel with correct properties', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const userMenuButton = screen.getByTestId('user-menu');
    await user.click(userMenuButton);

    const formControlLabel = screen.getByTestId('form-control-label');
    const expectedSx = { m: 0 };
    expect(formControlLabel).toHaveAttribute('data-sx', JSON.stringify(expectedSx));

    const formLabel = screen.getByTestId('form-label');
    expect(formLabel).toBeInTheDocument();
    expect(screen.getByText('Modo Escuro')).toBeInTheDocument();
  });
});