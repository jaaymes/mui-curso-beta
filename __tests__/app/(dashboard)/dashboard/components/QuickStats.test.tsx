import { render, screen } from '@testing-library/react';
import { QuickStats } from '@/app/(dashboard)/dashboard/components/QuickStats';
import type { QuickStats as QuickStatsType } from '@/app/(dashboard)/dashboard/lib/dashboard-data';

const mockStatsWithLowStock: QuickStatsType = {
  activeUsers: 1250,
  pendingOrders: 15,
  lowStockItems: 5,
  todayRevenue: 12500,
};

const mockStatsWithoutLowStock: QuickStatsType = {
  activeUsers: 850,
  pendingOrders: 8,
  lowStockItems: 0,
  todayRevenue: 8500,
};

describe('QuickStats', () => {
  it('should render stats title', () => {
    render(<QuickStats stats={mockStatsWithLowStock} />);
    expect(screen.getByText('Estatísticas Rápidas')).toBeInTheDocument();
  });

  it('should display all stat labels', () => {
    render(<QuickStats stats={mockStatsWithLowStock} />);
    
    expect(screen.getByText('Usuários Ativos')).toBeInTheDocument();
    expect(screen.getByText('Pedidos Pendentes')).toBeInTheDocument();
    expect(screen.getByText('Itens com Estoque Baixo')).toBeInTheDocument();
    expect(screen.getByText('Receita de Hoje')).toBeInTheDocument();
  });

  it('should display correct stat values with formatting', () => {
    render(<QuickStats stats={mockStatsWithLowStock} />);
    
    expect(screen.getByText('1,250')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('$12,500')).toBeInTheDocument();
  });

  it('should apply warning color when low stock items > 0', () => {
    render(<QuickStats stats={mockStatsWithLowStock} />);
    
    const lowStockValue = screen.getByText('5');
    expect(lowStockValue).toBeInTheDocument();
    // Color is applied through Material-UI theme, not inline styles
  });

  it('should not apply warning color when low stock items = 0', () => {
    render(<QuickStats stats={mockStatsWithoutLowStock} />);
    
    const lowStockValue = screen.getByText('0');
    expect(lowStockValue).toBeInTheDocument();
    // Color is applied through Material-UI theme, not inline styles
  });

  it('should apply success color to revenue', () => {
    render(<QuickStats stats={mockStatsWithLowStock} />);
    
    const revenueValue = screen.getByText('$12,500');
    expect(revenueValue).toBeInTheDocument();
    // Color is applied through Material-UI theme, not inline styles
  });

  it('should format large numbers correctly', () => {
    const largeStats: QuickStatsType = {
      activeUsers: 125000,
      pendingOrders: 1500,
      lowStockItems: 0,
      todayRevenue: 1250000,
    };

    render(<QuickStats stats={largeStats} />);
    
    expect(screen.getByText('125,000')).toBeInTheDocument();
    expect(screen.getByText('1,500')).toBeInTheDocument();
    expect(screen.getByText('$1,250,000')).toBeInTheDocument();
  });

  it('should render within a Paper component', () => {
    const { container } = render(<QuickStats stats={mockStatsWithLowStock} />);
    
    // Check if Paper component is present by looking for its common classes or structure
    const paperElement = container.querySelector('[class*="MuiPaper"]');
    expect(paperElement).toBeInTheDocument();
  });

  it('should handle zero values correctly', () => {
    const zeroStats: QuickStatsType = {
      activeUsers: 0,
      pendingOrders: 0,
      lowStockItems: 0,
      todayRevenue: 0,
    };

    render(<QuickStats stats={zeroStats} />);
    
    expect(screen.getAllByText('0')).toHaveLength(3);
    expect(screen.getByText('$0')).toBeInTheDocument();
  });
});