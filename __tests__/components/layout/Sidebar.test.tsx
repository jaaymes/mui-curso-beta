import { render, screen } from '@testing-library/react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/store/use-auth';
import { usePathname } from 'next/navigation';

// Mock das dependências
jest.mock('@/store/use-auth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('@mui/material', () => ({
  Drawer: ({ children, variant, sx, ...props }: any) => (
    <div 
      data-testid={props['data-testid'] || 'drawer'}
      data-variant={variant}
      data-sx={JSON.stringify(sx)}
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
  Avatar: ({ sx, children }: any) => (
    <div data-testid="avatar" data-sx={JSON.stringify(sx)}>
      {children}
    </div>
  ),
  Typography: ({ children, variant, fontWeight, color, gutterBottom, ...props }: any) => {
    // Criar um testid único baseado no conteúdo para evitar conflitos
    let testId = `typography-${variant}`;
    if (typeof children === 'string') {
      if (children.includes('v1.0.0')) testId = 'typography-version';
      else if (children === 'Dashboard') testId = 'typography-title';
      else if (children.includes('Bem-vindo')) testId = 'typography-welcome';
      else if (children.includes('Função:')) testId = 'typography-role';
    }
    
    return (
      <div 
        data-testid={testId}
        data-font-weight={fontWeight}
        data-color={color}
        data-gutter-bottom={gutterBottom}
        {...props}
      >
        {children}
      </div>
    );
  },
  Divider: (props: any) => <div data-testid="divider" {...props} />,
  List: ({ children, sx }: any) => (
    <div data-testid="list" data-sx={JSON.stringify(sx)}>
      {children}
    </div>
  ),
  ListItem: ({ children, disablePadding, sx }: any) => (
    <div 
      data-testid="list-item" 
      data-disable-padding={disablePadding}
      data-sx={JSON.stringify(sx)}
    >
      {children}
    </div>
  ),
  ListItemButton: ({ children, component, href, selected, sx, ...props }: any) => (
    <div 
      data-testid={props['data-testid'] || 'list-item-button'}
      data-component={component?.displayName || 'button'}
      data-href={href}
      data-selected={selected}
      data-sx={JSON.stringify(sx)}
      {...props}
    >
      {children}
    </div>
  ),
  ListItemIcon: ({ children, sx }: any) => (
    <div data-testid="list-item-icon" data-sx={JSON.stringify(sx)}>
      {children}
    </div>
  ),
  ListItemText: ({ primary, primaryTypographyProps }: any) => (
    <div 
      data-testid="list-item-text" 
      data-primary={primary}
      data-primary-typography-props={JSON.stringify(primaryTypographyProps)}
    >
      {primary}
    </div>
  ),
}));

jest.mock('@mui/icons-material', () => ({
  Dashboard: (props: any) => <svg data-testid="DashboardIcon" {...props}><path /></svg>,
  Inventory: (props: any) => <svg data-testid="InventoryIcon" {...props}><path /></svg>,
  People: (props: any) => <svg data-testid="PeopleIcon" {...props}><path /></svg>,
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

const mockUser = {
  id: 1,
  name: 'João Silva',
  email: 'joao@example.com',
  avatar: 'https://example.com/avatar.jpg',
  role: 'admin',
};

describe('Sidebar', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      logout: jest.fn(),
      login: jest.fn(),
      isAuthenticated: true,
    });

    mockUsePathname.mockReturnValue('/dashboard');
  });

  /**
   * Testa se o Sidebar renderiza todos os elementos principais
   */
  it('renders all main elements', () => {
    render(<Sidebar width={240} />);

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByTestId('typography-title')).toHaveTextContent('Dashboard');
    expect(screen.getByTestId('typography-version')).toHaveTextContent('v1.0.0');
    expect(screen.getByTestId('list')).toBeInTheDocument();
    expect(screen.getByTestId('divider')).toBeInTheDocument();
  });

  /**
   * Testa se o Drawer tem as propriedades corretas
   */
  it('renders Drawer with correct properties', () => {
    const width = 240;
    render(<Sidebar width={width} />);

    const drawer = screen.getByTestId('sidebar');
    expect(drawer).toHaveAttribute('data-variant', 'permanent');

    const expectedSx = {
      width,
      flexShrink: 0,
      '& .MuiDrawer-paper': {
        width,
        boxSizing: 'border-box',
        borderRight: '1px solid',
        borderColor: 'divider',
      },
    };
    expect(drawer).toHaveAttribute('data-sx', JSON.stringify(expectedSx));
  });

  /**
   * Testa se o Avatar é renderizado com as propriedades corretas
   */
  it('renders Avatar with correct properties', () => {
    render(<Sidebar width={240} />);

    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveTextContent('J'); // Primeira letra do nome

    const expectedSx = {
      bgcolor: 'primary.main',
      width: 40,
      height: 40,
    };
    expect(avatar).toHaveAttribute('data-sx', JSON.stringify(expectedSx));
  });

  /**
   * Testa se todos os itens de menu são renderizados
   */
  it('renders all menu items', () => {
    render(<Sidebar width={240} />);

    expect(screen.getByTestId('nav-painel')).toBeInTheDocument();
    expect(screen.getByTestId('nav-usuários')).toBeInTheDocument();
    expect(screen.getByTestId('nav-produtos')).toBeInTheDocument();

    expect(screen.getByTestId('DashboardIcon')).toBeInTheDocument();
    expect(screen.getByTestId('PeopleIcon')).toBeInTheDocument();
    expect(screen.getByTestId('InventoryIcon')).toBeInTheDocument();

    expect(screen.getByText('Painel')).toBeInTheDocument();
    expect(screen.getByText('Usuários')).toBeInTheDocument();
    expect(screen.getByText('Produtos')).toBeInTheDocument();
  });

  /**
   * Testa se o item ativo é destacado corretamente
   */
  it('highlights active menu item correctly', () => {
    mockUsePathname.mockReturnValue('/dashboard');
    render(<Sidebar width={240} />);

    const dashboardItem = screen.getByTestId('nav-painel');
    expect(dashboardItem).toHaveAttribute('data-selected', 'true');

    const usersItem = screen.getByTestId('nav-usuários');
    expect(usersItem).toHaveAttribute('data-selected', 'false');

    const productsItem = screen.getByTestId('nav-produtos');
    expect(productsItem).toHaveAttribute('data-selected', 'false');
  });

  /**
   * Testa se o item ativo é destacado para rota de usuários
   */
  it('highlights users menu item when on users page', () => {
    mockUsePathname.mockReturnValue('/users');
    render(<Sidebar width={240} />);

    const dashboardItem = screen.getByTestId('nav-painel');
    expect(dashboardItem).toHaveAttribute('data-selected', 'false');

    const usersItem = screen.getByTestId('nav-usuários');
    expect(usersItem).toHaveAttribute('data-selected', 'true');

    const productsItem = screen.getByTestId('nav-produtos');
    expect(productsItem).toHaveAttribute('data-selected', 'false');
  });

  /**
   * Testa se o item ativo é destacado para rota de produtos
   */
  it('highlights products menu item when on products page', () => {
    mockUsePathname.mockReturnValue('/products');
    render(<Sidebar width={240} />);

    const dashboardItem = screen.getByTestId('nav-painel');
    expect(dashboardItem).toHaveAttribute('data-selected', 'false');

    const usersItem = screen.getByTestId('nav-usuários');
    expect(usersItem).toHaveAttribute('data-selected', 'false');

    const productsItem = screen.getByTestId('nav-produtos');
    expect(productsItem).toHaveAttribute('data-selected', 'true');
  });

  /**
   * Testa se subrotas são destacadas corretamente
   */
  it('highlights menu item for subroutes', () => {
    mockUsePathname.mockReturnValue('/products/123');
    render(<Sidebar width={240} />);

    const productsItem = screen.getByTestId('nav-produtos');
    expect(productsItem).toHaveAttribute('data-selected', 'true');
  });

  /**
   * Testa se os links têm os hrefs corretos
   */
  it('renders menu items with correct hrefs', () => {
    render(<Sidebar width={240} />);

    const dashboardItem = screen.getByTestId('nav-painel');
    expect(dashboardItem).toHaveAttribute('data-href', '/dashboard');

    const usersItem = screen.getByTestId('nav-usuários');
    expect(usersItem).toHaveAttribute('data-href', '/users');

    const productsItem = screen.getByTestId('nav-produtos');
    expect(productsItem).toHaveAttribute('data-href', '/products');
  });

  /**
   * Testa se os ListItemButton têm os estilos corretos
   */
  it('renders ListItemButton with correct styles', () => {
    render(<Sidebar width={240} />);

    const dashboardItem = screen.getByTestId('nav-painel');
    const expectedSx = {
      borderRadius: 1,
      '&.Mui-selected': {
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        '&:hover': {
          bgcolor: 'primary.dark',
        },
        '& .MuiListItemIcon-root': {
          color: 'primary.contrastText',
        },
      },
      '&:hover': {
        bgcolor: 'action.hover',
      },
    };
    expect(dashboardItem).toHaveAttribute('data-sx', JSON.stringify(expectedSx));
  });

  /**
   * Testa se os ListItemIcon têm os estilos corretos para item ativo
   */
  it('renders ListItemIcon with correct styles for active item', () => {
    mockUsePathname.mockReturnValue('/dashboard');
    render(<Sidebar width={240} />);

    const listItemIcons = screen.getAllByTestId('list-item-icon');
    const dashboardIcon = listItemIcons[0]; // Primeiro ícone (Dashboard)

    const expectedSx = {
      minWidth: 40,
      color: 'inherit', // Para item ativo
    };
    expect(dashboardIcon).toHaveAttribute('data-sx', JSON.stringify(expectedSx));
  });

  /**
   * Testa se os ListItemIcon têm os estilos corretos para item inativo
   */
  it('renders ListItemIcon with correct styles for inactive item', () => {
    mockUsePathname.mockReturnValue('/dashboard');
    render(<Sidebar width={240} />);

    const listItemIcons = screen.getAllByTestId('list-item-icon');
    const usersIcon = listItemIcons[1]; // Segundo ícone (Users)

    const expectedSx = {
      minWidth: 40,
      color: 'text.secondary', // Para item inativo
    };
    expect(usersIcon).toHaveAttribute('data-sx', JSON.stringify(expectedSx));
  });

  /**
   * Testa se os ListItemText têm as propriedades corretas para item ativo
   */
  it('renders ListItemText with correct properties for active item', () => {
    mockUsePathname.mockReturnValue('/dashboard');
    render(<Sidebar width={240} />);

    const listItemTexts = screen.getAllByTestId('list-item-text');
    const dashboardText = listItemTexts[0];

    expect(dashboardText).toHaveAttribute('data-primary', 'Painel');
    const expectedProps = { fontWeight: 600 };
    expect(dashboardText).toHaveAttribute('data-primary-typography-props', JSON.stringify(expectedProps));
  });

  /**
   * Testa se os ListItemText têm as propriedades corretas para item inativo
   */
  it('renders ListItemText with correct properties for inactive item', () => {
    mockUsePathname.mockReturnValue('/dashboard');
    render(<Sidebar width={240} />);

    const listItemTexts = screen.getAllByTestId('list-item-text');
    const usersText = listItemTexts[1];

    expect(usersText).toHaveAttribute('data-primary', 'Usuários');
    const expectedProps = { fontWeight: 400 };
    expect(usersText).toHaveAttribute('data-primary-typography-props', JSON.stringify(expectedProps));
  });

  /**
   * Testa se a seção de boas-vindas é renderizada corretamente
   */
  it('renders welcome section correctly', () => {
    render(<Sidebar width={240} />);

    expect(screen.getByText(`Bem-vindo, ${mockUser.name}!`)).toBeInTheDocument();
    expect(screen.getByText(`Função: ${mockUser.role}`)).toBeInTheDocument();
  });

  /**
   * Testa se a seção de boas-vindas tem os estilos corretos
   */
  it('renders welcome section with correct styles', () => {
    render(<Sidebar width={240} />);

    const boxes = screen.getAllByTestId('box');
    const welcomeBox = boxes.find(box => {
      const sx = JSON.parse(box.getAttribute('data-sx') || '{}');
      return sx.bgcolor === 'background.paper';
    });

    expect(welcomeBox).toBeInTheDocument();
    const expectedSx = {
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
      p: 2,
    };
    expect(welcomeBox).toHaveAttribute('data-sx', JSON.stringify(expectedSx));
  });

  /**
   * Testa se o List tem os estilos corretos
   */
  it('renders List with correct styles', () => {
    render(<Sidebar width={240} />);

    const list = screen.getByTestId('list');
    const expectedSx = { px: 2, py: 1 };
    expect(list).toHaveAttribute('data-sx', JSON.stringify(expectedSx));
  });

  /**
   * Testa se os ListItem têm os estilos corretos
   */
  it('renders ListItem with correct styles', () => {
    render(<Sidebar width={240} />);

    const listItems = screen.getAllByTestId('list-item');
    listItems.forEach(item => {
      expect(item).toHaveAttribute('data-disable-padding', 'true');
      const expectedSx = { mb: 0.5 };
      expect(item).toHaveAttribute('data-sx', JSON.stringify(expectedSx));
    });
  });

  /**
   * Testa se funciona corretamente sem usuário
   */
  it('handles missing user gracefully', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      logout: jest.fn(),
      login: jest.fn(),
      isAuthenticated: false,
    });

    render(<Sidebar width={240} />);

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('list')).toBeInTheDocument();
  });

  /**
   * Testa se funciona com diferentes larguras
   */
  it('works with different widths', () => {
    const width = 300;
    render(<Sidebar width={width} />);

    const drawer = screen.getByTestId('sidebar');
    const expectedSx = {
      width,
      flexShrink: 0,
      '& .MuiDrawer-paper': {
        width,
        boxSizing: 'border-box',
        borderRight: '1px solid',
        borderColor: 'divider',
      },
    };
    expect(drawer).toHaveAttribute('data-sx', JSON.stringify(expectedSx));
  });

  /**
   * Testa se o dashboard não é destacado para subrotas
   */
  it('does not highlight dashboard for subroutes', () => {
    mockUsePathname.mockReturnValue('/users/123');
    render(<Sidebar width={240} />);

    const dashboardItem = screen.getByTestId('nav-painel');
    expect(dashboardItem).toHaveAttribute('data-selected', 'false');

    const usersItem = screen.getByTestId('nav-usuários');
    expect(usersItem).toHaveAttribute('data-selected', 'true');
  });
});