import { render, screen } from '@testing-library/react';
import { UsersStats } from '@/app/(dashboard)/users/components/UsersStats';
import type { UsersStats as UsersStatsType } from '@/app/(dashboard)/users/lib/users-data';

// Mock Material-UI Grid
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Grid: ({ children, ...props }: any) => (
    <div data-testid="grid" {...props}>
      {children}
    </div>
  ),
}));

const mockStats: UsersStatsType = {
  totalUsers: 1250,
  activeUsers: 980,
  admins: 15,
  newRegistrations: 45,
};

describe('UsersStats', () => {
  it('should render all stats cards', () => {
    render(<UsersStats stats={mockStats} />);
    
    expect(screen.getByText('Total de Usuários')).toBeInTheDocument();
    expect(screen.getByText('Usuários Ativos')).toBeInTheDocument();
    expect(screen.getByText('Administradores')).toBeInTheDocument();
    expect(screen.getByText('Novos Registros')).toBeInTheDocument();
  });

  it('should display correct stat values', () => {
    render(<UsersStats stats={mockStats} />);
    
    // Values are formatted by StatsCard: 1250 becomes "1.3K", etc.
    expect(screen.getByText('1.3K')).toBeInTheDocument(); // 1250 formatted
    expect(screen.getByText('980')).toBeInTheDocument();   // Under 1000, no formatting  
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('should render grid containers for layout', () => {
    render(<UsersStats stats={mockStats} />);
    
    const grids = screen.getAllByTestId('grid');
    expect(grids.length).toBeGreaterThan(0);
  });

  it('should handle zero values', () => {
    const zeroStats: UsersStatsType = {
      totalUsers: 0,
      activeUsers: 0,
      admins: 0,
      newRegistrations: 0,
    };

    render(<UsersStats stats={zeroStats} />);
    
    expect(screen.getAllByText('0')).toHaveLength(4);
  });

  it('should handle large numbers', () => {
    const largeStats: UsersStatsType = {
      totalUsers: 999999,
      activeUsers: 850000,
      admins: 500,
      newRegistrations: 1200,
    };

    render(<UsersStats stats={largeStats} />);
    
    // Numbers are formatted by StatsCard
    expect(screen.getByText('1000.0K')).toBeInTheDocument(); // 999999 / 1000 = 999.999, toFixed(1) = 1000.0K
    expect(screen.getByText('850.0K')).toBeInTheDocument();  // 850000 / 1000 = 850.0K
    expect(screen.getByText('500')).toBeInTheDocument();     // Under 1000, no formatting
    expect(screen.getByText('1.2K')).toBeInTheDocument();    // 1200 / 1000 = 1.2K
  });

  it('should render all stat cards with icons', () => {
    render(<UsersStats stats={mockStats} />);
    
    // All stats cards should be rendered
    const totalUsersCard = screen.getByText('Total de Usuários');
    const activeUsersCard = screen.getByText('Usuários Ativos');
    const adminsCard = screen.getByText('Administradores');
    const newRegistrationsCard = screen.getByText('Novos Registros');
    
    expect(totalUsersCard).toBeInTheDocument();
    expect(activeUsersCard).toBeInTheDocument();
    expect(adminsCard).toBeInTheDocument();
    expect(newRegistrationsCard).toBeInTheDocument();
  });

  it('should apply correct grid sizing', () => {
    render(<UsersStats stats={mockStats} />);
    
    const grids = screen.getAllByTestId('grid');
    // Should have at least 5 grids (1 container + 4 stat cards)
    expect(grids.length).toBeGreaterThanOrEqual(5);
  });

  it('should render within a Box container with margin', () => {
    const { container } = render(<UsersStats stats={mockStats} />);
    
    const boxElement = container.firstChild;
    expect(boxElement).toBeInTheDocument();
  });

  it('should handle different number formats consistently', () => {
    const mixedStats: UsersStatsType = {
      totalUsers: 1,
      activeUsers: 10,
      admins: 100,
      newRegistrations: 1000,
    };

    render(<UsersStats stats={mixedStats} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('1.0K')).toBeInTheDocument(); // 1000 gets formatted to 1.0K
  });

  it('should maintain proper component structure', () => {
    render(<UsersStats stats={mockStats} />);
    
    // Verify all essential elements are present
    expect(screen.getByText('Total de Usuários')).toBeInTheDocument();
    expect(screen.getByText('Usuários Ativos')).toBeInTheDocument();
    expect(screen.getByText('Administradores')).toBeInTheDocument();
    expect(screen.getByText('Novos Registros')).toBeInTheDocument();
    
    // Verify all values are displayed (formatted by StatsCard)
    expect(screen.getByText('1.3K')).toBeInTheDocument();  // 1250 formatted
    expect(screen.getByText('980')).toBeInTheDocument();   // Under 1000, no formatting
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });
});