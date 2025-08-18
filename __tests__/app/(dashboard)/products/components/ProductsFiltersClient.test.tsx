/**
 * Testes para o componente ProductsFiltersClient
 * Verifica filtros interativos com debounced search e navegação
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductsFiltersClient } from '@/app/(dashboard)/products/components/ProductsFiltersClient';
import { useRouter, useSearchParams } from 'next/navigation';

// Mock do Next.js navigation
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock dos ícones do Material UI
jest.mock('@mui/icons-material', () => ({
  Clear: () => <svg data-testid="ClearIcon"><path /></svg>,
  Search: () => <svg data-testid="SearchIcon"><path /></svg>,
}));

// Mock dos componentes Material UI
jest.mock('@mui/material', () => ({
  Box: ({ children, sx }: any) => <div data-testid="box" style={sx}>{children}</div>,
  Button: ({ children, onClick, startIcon, variant, color, size, disabled }: any) => (
    <button 
      data-testid="button" 
      onClick={onClick}
      data-variant={variant}
      data-color={color}
      data-size={size}
      disabled={disabled}
    >
      {startIcon}
      {children}
    </button>
  ),
  CircularProgress: ({ size }: any) => (
    <div data-testid="circular-progress" data-size={size}>Loading...</div>
  ),
  InputAdornment: ({ children, position }: any) => (
    <div data-testid="input-adornment" data-position={position}>{children}</div>
  ),
  MenuItem: ({ children, value }: any) => (
    <option data-testid="menu-item" value={value}>{children}</option>
  ),
  TextField: ({ placeholder, value, onChange, slotProps, sx, size, select, label, children }: any) => (
    <div data-testid="text-field" style={sx}>
      {select ? (
        <select 
          data-testid="select-field"
          value={value}
          onChange={onChange}
          aria-label={label}
        >
          {children}
        </select>
      ) : (
        <input
          data-testid="input-field"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          data-size={size}
        />
      )}
      {slotProps?.input?.startAdornment}
      {slotProps?.input?.endAdornment}
    </div>
  ),
}));

// Dados de teste
const mockCategories = ['smartphones', 'laptops', 'tablets', 'accessories'];

const defaultProps = {
  searchTerm: '',
  categoryFilter: '',
  categories: mockCategories,
};

const propsWithFilters = {
  searchTerm: 'iPhone',
  categoryFilter: 'smartphones',
  categories: mockCategories,
};

describe('ProductsFiltersClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Renderização básica', () => {
    it('deve renderizar todos os elementos do filtro', () => {
      render(<ProductsFiltersClient {...defaultProps} />);

      expect(screen.getByTestId('box')).toBeInTheDocument();
      expect(screen.getByTestId('input-field')).toBeInTheDocument();
      expect(screen.getByTestId('select-field')).toBeInTheDocument();
      expect(screen.getByTestId('SearchIcon')).toBeInTheDocument();
    });

    it('deve renderizar o campo de busca com placeholder correto', () => {
      render(<ProductsFiltersClient {...defaultProps} />);

      const searchInput = screen.getByTestId('input-field');
      expect(searchInput).toHaveAttribute('placeholder', 'Buscar produtos por nome, descrição ou marca...');
    });

    it('deve renderizar o select de categorias com todas as opções', () => {
      render(<ProductsFiltersClient {...defaultProps} />);

      const menuItems = screen.getAllByTestId('menu-item');
      expect(menuItems).toHaveLength(5); // "Todas as categorias" + 4 categorias
      
      expect(menuItems[0]).toHaveTextContent('Todas as categorias');
      expect(menuItems[1]).toHaveTextContent('Smartphones');
      expect(menuItems[2]).toHaveTextContent('Laptops');
      expect(menuItems[3]).toHaveTextContent('Tablets');
      expect(menuItems[4]).toHaveTextContent('Accessories');
    });
  });

  describe('Estados iniciais', () => {
    it('deve inicializar com valores das props', () => {
      render(<ProductsFiltersClient {...propsWithFilters} />);

      const searchInput = screen.getByTestId('input-field');
      const categorySelect = screen.getByTestId('select-field');

      expect(searchInput).toHaveValue('iPhone');
      expect(categorySelect).toHaveValue('smartphones');
    });

    it('deve exibir botão de limpar filtros quando há filtros ativos', () => {
      render(<ProductsFiltersClient {...propsWithFilters} />);

      expect(screen.getByTestId('button')).toBeInTheDocument();
      expect(screen.getByText('Limpar Filtros')).toBeInTheDocument();
      expect(screen.getByTestId('ClearIcon')).toBeInTheDocument();
    });

    it('não deve exibir botão de limpar filtros quando não há filtros ativos', () => {
      render(<ProductsFiltersClient {...defaultProps} />);

      expect(screen.queryByText('Limpar Filtros')).not.toBeInTheDocument();
    });
  });

  describe('Funcionalidade de busca', () => {
    it('deve atualizar o campo de busca ao digitar', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ProductsFiltersClient {...defaultProps} />);

      const searchInput = screen.getByTestId('input-field');
      await user.type(searchInput, 'MacBook');

      expect(searchInput).toHaveValue('MacBook');
    });

    it('deve exibir loading durante a busca', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ProductsFiltersClient {...defaultProps} />);

      const searchInput = screen.getByTestId('input-field');
      await user.type(searchInput, 'test');

      // Loading deve aparecer imediatamente
      expect(screen.getByTestId('circular-progress')).toBeInTheDocument();
    });

    it('deve fazer debounce da busca (500ms)', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ProductsFiltersClient {...defaultProps} />);

      const searchInput = screen.getByTestId('input-field');
      await user.type(searchInput, 'test');

      // Não deve chamar push imediatamente
      expect(mockPush).not.toHaveBeenCalled();

      // Avançar 500ms
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('?search=test');
      });
    });

    it('deve cancelar busca anterior se usuário continuar digitando', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ProductsFiltersClient {...defaultProps} />);

      const searchInput = screen.getByTestId('input-field');
      
      // Digitar "te"
      await user.type(searchInput, 'te');
      
      // Avançar 300ms (menos que 500ms)
      jest.advanceTimersByTime(300);
      
      // Continuar digitando
      await user.type(searchInput, 'st');
      
      // Avançar mais 500ms
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        // Deve ter chamado apenas uma vez com o texto completo
        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(mockPush).toHaveBeenCalledWith('?search=test');
      });
    });
  });

  describe('Funcionalidade de filtro por categoria', () => {
    it('deve atualizar o filtro de categoria', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ProductsFiltersClient {...defaultProps} />);

      const categorySelect = screen.getByTestId('select-field');
      await user.selectOptions(categorySelect, 'laptops');

      expect(categorySelect).toHaveValue('laptops');
    });

    it('deve navegar com filtro de categoria após debounce', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ProductsFiltersClient {...defaultProps} />);

      const categorySelect = screen.getByTestId('select-field');
      await user.selectOptions(categorySelect, 'laptops');

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('?category=laptops');
      });
    });

    it('deve combinar busca e categoria nos parâmetros da URL', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ProductsFiltersClient {...defaultProps} />);

      const searchInput = screen.getByTestId('input-field');
      const categorySelect = screen.getByTestId('select-field');

      await user.type(searchInput, 'MacBook');
      await user.selectOptions(categorySelect, 'laptops');

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('?search=MacBook&category=laptops');
      });
    });
  });

  describe('Funcionalidade de limpar filtros', () => {
    it('deve limpar todos os filtros ao clicar no botão', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ProductsFiltersClient {...propsWithFilters} />);

      const clearButton = screen.getByText('Limpar Filtros');
      await user.click(clearButton);

      const searchInput = screen.getByTestId('input-field');
      const categorySelect = screen.getByTestId('select-field');

      expect(searchInput).toHaveValue('');
      expect(categorySelect).toHaveValue('');
    });

    it('deve navegar para página limpa ao limpar filtros', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ProductsFiltersClient {...propsWithFilters} />);

      const clearButton = screen.getByText('Limpar Filtros');
      await user.click(clearButton);

      expect(mockPush).toHaveBeenCalledWith('/products');
    });

    it('deve desabilitar botão de limpar durante loading', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ProductsFiltersClient {...propsWithFilters} />);

      const searchInput = screen.getByTestId('input-field');
      await user.type(searchInput, 'x');

      const clearButton = screen.getByText('Limpar Filtros');
      expect(clearButton).toBeDisabled();
    });
  });

  describe('Gerenciamento de parâmetros da URL', () => {
    it('deve remover parâmetros vazios da URL', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ProductsFiltersClient searchTerm="test" categoryFilter="" categories={mockCategories} />);

      const searchInput = screen.getByTestId('input-field');
      await user.clear(searchInput);

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('?');
      });
    });

    it('deve resetar página ao alterar filtros', async () => {
      const mockSearchParamsWithPage = new URLSearchParams('page=2');
      (useSearchParams as jest.Mock).mockReturnValue(mockSearchParamsWithPage);
      
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ProductsFiltersClient {...defaultProps} />);

      const searchInput = screen.getByTestId('input-field');
      await user.type(searchInput, 'test');

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('?search=test');
      });
    });
  });

  describe('Estados de loading', () => {
    it('deve exibir loading apenas quando há mudanças', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ProductsFiltersClient {...defaultProps} />);

      // Inicialmente não deve ter loading
      expect(screen.queryByTestId('circular-progress')).not.toBeInTheDocument();

      const searchInput = screen.getByTestId('input-field');
      await user.type(searchInput, 'test');

      // Deve exibir loading após mudança
      expect(screen.getByTestId('circular-progress')).toBeInTheDocument();

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(screen.queryByTestId('circular-progress')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge cases', () => {
    it('deve funcionar com lista de categorias vazia', () => {
      render(<ProductsFiltersClient {...defaultProps} categories={[]} />);

      const menuItems = screen.getAllByTestId('menu-item');
      expect(menuItems).toHaveLength(1); // Apenas "Todas as categorias"
      expect(menuItems[0]).toHaveTextContent('Todas as categorias');
    });

    it('deve funcionar com busca apenas com espaços', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ProductsFiltersClient {...defaultProps} />);

      const searchInput = screen.getByTestId('input-field');
      await user.type(searchInput, '   ');

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        // Busca com apenas espaços deve ser removida da URL
        expect(mockPush).toHaveBeenCalledWith('?');
      });
    });

    it('deve capitalizar nomes de categorias corretamente', () => {
      const categoriesWithSpecialCases = ['smartphones', 'smart-watches', 'home-decoration'];
      render(<ProductsFiltersClient {...defaultProps} categories={categoriesWithSpecialCases} />);

      const menuItems = screen.getAllByTestId('menu-item');
      expect(menuItems[1]).toHaveTextContent('Smartphones');
      expect(menuItems[2]).toHaveTextContent('Smart-watches');
      expect(menuItems[3]).toHaveTextContent('Home-decoration');
    });
  });
});