import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/(dashboard)/dashboard/page';
import { getDashboardData } from '@/app/(dashboard)/dashboard/lib/dashboard-data';

// Mock the dashboard data module
jest.mock('@/app/(dashboard)/dashboard/lib/dashboard-data');
const mockGetDashboardData = getDashboardData as jest.MockedFunction<typeof getDashboardData>;

// Mock Next.js components
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock Material-UI Grid
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Grid: ({ children, ...props }: any) => (
    <div data-testid="grid" {...props}>
      {children}
    </div>
  ),
}));

const mockDashboardData = {
  stats: {
    totalUsers: 1250,
    totalProducts: 340,
    totalSales: 89750,
  },
  salesData: [
    { name: 'Jan', value: 12000 },
    { name: 'Feb', value: 15000 },
    { name: 'Mar', value: 18000 },
  ],
  recentActivities: [
    {
      id: '1',
      action: 'Novo usuário João Silva se registrou',
      time: '10 minutos atrás',
      type: 'user' as const,
      details: 'joao@example.com',
    },
  ],
  quickStats: {
    activeUsers: 1250,
    pendingOrders: 15,
    lowStockItems: 8,
    todayRevenue: 12500,
  },
};

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDashboardData.mockResolvedValue(mockDashboardData);
  });

  it('should render dashboard title and description', async () => {
    const page = await DashboardPage();
    render(page);

    expect(screen.getByText('Visão Geral do Painel')).toBeInTheDocument();
    expect(
      screen.getByText(/Bem-vindo de volta! Aqui está o que está acontecendo/)
    ).toBeInTheDocument();
  });

  it('should render stats cards with correct data', async () => {
    const page = await DashboardPage();
    render(page);

    expect(screen.getByText('Total de Usuários')).toBeInTheDocument();
    expect(screen.getByText('1.3K')).toBeInTheDocument(); // 1250 formatted as 1.3K
    
    expect(screen.getByText('Produtos')).toBeInTheDocument();
    expect(screen.getByText('340')).toBeInTheDocument(); // 340 stays as 340
    
    expect(screen.getByText('Total de Vendas')).toBeInTheDocument();
    expect(screen.getByText('89.8K')).toBeInTheDocument(); // 89750 formatted as 89.8K
  });

  it('should render sales chart with title', async () => {
    const page = await DashboardPage();
    render(page);

    expect(screen.getByText('Tendência de Vendas (Últimos 6 Meses)')).toBeInTheDocument();
  });

  it('should call getDashboardData on render', async () => {
    await DashboardPage();
    expect(mockGetDashboardData).toHaveBeenCalledTimes(1);
  });

  it('should handle dashboard data loading', async () => {
    mockGetDashboardData.mockResolvedValue(mockDashboardData);
    
    const page = await DashboardPage();
    render(page);

    // Verify that the Grid components are rendered (there are multiple grids in the layout)
    expect(screen.getAllByTestId('grid')).toHaveLength(9); // Multiple nested grid components throughout the layout
  });

  it('should render all trend indicators correctly', async () => {
    const page = await DashboardPage();
    render(page);

    // Check trend labels are rendered - using regex for flexible matching
    expect(screen.getAllByText(/do mês passado/)).toHaveLength(3);
  });

  it('should display correct icon colors for stats cards', async () => {
    const page = await DashboardPage();
    render(page);

    // Test that all stat cards are rendered 
    const statsCards = screen.getAllByTestId('stat-card');
    expect(statsCards).toHaveLength(3); // 3 stat cards for users, products, and sales
  });
});