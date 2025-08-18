/**
 * Testes para o componente ProductsStats
 * Verifica a renderização das estatísticas de produtos
 */
import { render, screen } from '@testing-library/react';
import { ProductsStats } from '@/app/(dashboard)/products/components/ProductsStats';
import { ProductsStats as ProductsStatsType } from '@/app/(dashboard)/products/lib/products-data';

// Mock do StatsCard
jest.mock('@/components/ui/StatsCard', () => {
  return {
    StatsCard: ({ title, value, icon, color }: any) => (
      <div data-testid={`stats-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
        <div data-testid="stats-title">{title}</div>
        <div data-testid="stats-value">{value}</div>
        <div data-testid="stats-color">{color}</div>
        <div data-testid="stats-icon">{icon}</div>
      </div>
    ),
  };
});

// Mock dos ícones do Material UI
jest.mock('@mui/icons-material', () => ({
  Inventory: () => <svg data-testid="InventoryIcon"><path /></svg>,
  ShoppingCart: () => <svg data-testid="ShoppingCartIcon"><path /></svg>,
  Warning: () => <svg data-testid="WarningIcon"><path /></svg>,
  RemoveShoppingCart: () => <svg data-testid="RemoveShoppingCartIcon"><path /></svg>,
}));

// Mock dos componentes Material UI
jest.mock('@mui/material', () => ({
  Box: ({ children, sx }: any) => {
    // Converte sx do MUI para style CSS
    const style: any = {};
    if (sx?.mb) {
      style.marginBottom = `${sx.mb * 8}px`; // MUI usa 8px como base
    }
    return <div data-testid="box" style={style}>{children}</div>;
  },
  Grid: ({ children, size }: any) => (
    <div data-testid="grid" data-size={JSON.stringify(size)}>
      {children}
    </div>
  ),
}));

// Dados de teste
const mockStats: ProductsStatsType = {
  totalProducts: 150,
  activeProducts: 120,
  lowStockProducts: 25,
  outOfStockProducts: 5,
};

const emptyStats: ProductsStatsType = {
  totalProducts: 0,
  activeProducts: 0,
  lowStockProducts: 0,
  outOfStockProducts: 0,
};

const highVolumeStats: ProductsStatsType = {
  totalProducts: 9999,
  activeProducts: 8500,
  lowStockProducts: 1200,
  outOfStockProducts: 299,
};

describe('ProductsStats', () => {
  describe('Renderização básica', () => {
    it('deve renderizar todos os cards de estatísticas', () => {
      render(<ProductsStats stats={mockStats} />);

      expect(screen.getByTestId('stats-card-total-de-produtos')).toBeInTheDocument();
      expect(screen.getByTestId('stats-card-produtos-em-estoque')).toBeInTheDocument();
      expect(screen.getByTestId('stats-card-estoque-baixo')).toBeInTheDocument();
      expect(screen.getByTestId('stats-card-fora-de-estoque')).toBeInTheDocument();
    });

    it('deve renderizar o container principal com estilos corretos', () => {
      render(<ProductsStats stats={mockStats} />);
      
      const box = screen.getByTestId('box');
      expect(box).toBeInTheDocument();
      expect(box).toHaveStyle({ marginBottom: '32px' }); // mb: 4 = 32px
    });

    it('deve renderizar o grid container', () => {
      render(<ProductsStats stats={mockStats} />);
      
      const grids = screen.getAllByTestId('grid');
      expect(grids).toHaveLength(5); // 1 container + 4 items
    });
  });

  describe('Conteúdo dos cards', () => {
    it('deve exibir os títulos corretos', () => {
      render(<ProductsStats stats={mockStats} />);

      const titles = screen.getAllByTestId('stats-title');
      expect(titles[0]).toHaveTextContent('Total de Produtos');
      expect(titles[1]).toHaveTextContent('Produtos em Estoque');
      expect(titles[2]).toHaveTextContent('Estoque Baixo');
      expect(titles[3]).toHaveTextContent('Fora de Estoque');
    });

    it('deve exibir os valores corretos', () => {
      render(<ProductsStats stats={mockStats} />);

      const values = screen.getAllByTestId('stats-value');
      expect(values[0]).toHaveTextContent('150');
      expect(values[1]).toHaveTextContent('120');
      expect(values[2]).toHaveTextContent('25');
      expect(values[3]).toHaveTextContent('5');
    });

    it('deve exibir as cores corretas', () => {
      render(<ProductsStats stats={mockStats} />);

      const colors = screen.getAllByTestId('stats-color');
      expect(colors[0]).toHaveTextContent('primary');
      expect(colors[1]).toHaveTextContent('success');
      expect(colors[2]).toHaveTextContent('warning');
      expect(colors[3]).toHaveTextContent('error');
    });

    it('deve exibir os ícones corretos', () => {
      render(<ProductsStats stats={mockStats} />);

      expect(screen.getByTestId('InventoryIcon')).toBeInTheDocument();
    expect(screen.getByTestId('ShoppingCartIcon')).toBeInTheDocument();
    expect(screen.getByTestId('WarningIcon')).toBeInTheDocument();
    expect(screen.getByTestId('RemoveShoppingCartIcon')).toBeInTheDocument();
    });
  });

  describe('Diferentes cenários de dados', () => {
    it('deve funcionar com estatísticas zeradas', () => {
      render(<ProductsStats stats={emptyStats} />);

      const values = screen.getAllByTestId('stats-value');
      values.forEach(value => {
        expect(value).toHaveTextContent('0');
      });
    });

    it('deve funcionar com números altos', () => {
      render(<ProductsStats stats={highVolumeStats} />);

      const values = screen.getAllByTestId('stats-value');
      expect(values[0]).toHaveTextContent('9999');
      expect(values[1]).toHaveTextContent('8500');
      expect(values[2]).toHaveTextContent('1200');
      expect(values[3]).toHaveTextContent('299');
    });

    it('deve funcionar com números negativos (edge case)', () => {
      const negativeStats: ProductsStatsType = {
        totalProducts: -1,
        activeProducts: -5,
        lowStockProducts: -10,
        outOfStockProducts: -2,
      };

      render(<ProductsStats stats={negativeStats} />);

      const values = screen.getAllByTestId('stats-value');
      expect(values[0]).toHaveTextContent('-1');
      expect(values[1]).toHaveTextContent('-5');
      expect(values[2]).toHaveTextContent('-10');
      expect(values[3]).toHaveTextContent('-2');
    });
  });

  describe('Layout responsivo', () => {
    it('deve configurar o grid com tamanhos responsivos corretos', () => {
      render(<ProductsStats stats={mockStats} />);

      const gridItems = screen.getAllByTestId('grid').slice(1); // Remove o container
      
      gridItems.forEach(grid => {
        const sizeAttr = grid.getAttribute('data-size');
        const size = JSON.parse(sizeAttr || '{}');
        expect(size).toEqual({ xs: 12, sm: 6, md: 3 });
      });
    });
  });

  describe('Estrutura do componente', () => {
    it('deve ter a estrutura HTML correta', () => {
      const { container } = render(<ProductsStats stats={mockStats} />);
      
      // Verifica se há um Box container
      expect(screen.getByTestId('box')).toBeInTheDocument();
      
      // Verifica se há 5 grids (1 container + 4 items)
      expect(screen.getAllByTestId('grid')).toHaveLength(5);
      
      // Verifica se há 4 cards de estatísticas
      expect(screen.getAllByTestId(/^stats-card-/)).toHaveLength(4);
    });

    it('deve manter a ordem correta dos cards', () => {
      render(<ProductsStats stats={mockStats} />);

      const cards = screen.getAllByTestId(/^stats-card-/);
      expect(cards[0]).toHaveAttribute('data-testid', 'stats-card-total-de-produtos');
      expect(cards[1]).toHaveAttribute('data-testid', 'stats-card-produtos-em-estoque');
      expect(cards[2]).toHaveAttribute('data-testid', 'stats-card-estoque-baixo');
      expect(cards[3]).toHaveAttribute('data-testid', 'stats-card-fora-de-estoque');
    });
  });

  describe('Props e interface', () => {
    it('deve aceitar e usar corretamente as props de stats', () => {
      const customStats: ProductsStatsType = {
        totalProducts: 999,
        activeProducts: 888,
        lowStockProducts: 777,
        outOfStockProducts: 666,
      };

      render(<ProductsStats stats={customStats} />);

      const values = screen.getAllByTestId('stats-value');
      expect(values[0]).toHaveTextContent('999');
      expect(values[1]).toHaveTextContent('888');
      expect(values[2]).toHaveTextContent('777');
      expect(values[3]).toHaveTextContent('666');
    });
  });
});