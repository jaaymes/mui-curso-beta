import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardError } from '@/app/(dashboard)/dashboard/components/DashboardError';

describe('DashboardError', () => {
  it('should render dashboard title', () => {
    render(<DashboardError />);
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
  });

  it('should render default error message when no error prop provided', () => {
    render(<DashboardError />);
    expect(
      screen.getByText('Erro ao carregar dados do dashboard. Tente novamente mais tarde.')
    ).toBeInTheDocument();
  });

  it('should render custom error message when error prop provided', () => {
    const customError = 'Falha na conexão com o servidor';
    render(<DashboardError error={customError} />);
    expect(screen.getByText(customError)).toBeInTheDocument();
  });

  it('should render retry button when retry function provided', () => {
    const mockRetry = jest.fn();
    render(<DashboardError retry={mockRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should not render retry button when retry function not provided', () => {
    render(<DashboardError />);
    
    const retryButton = screen.queryByRole('button', { name: /tentar novamente/i });
    expect(retryButton).not.toBeInTheDocument();
  });

  it('should call retry function when retry button is clicked', () => {
    const mockRetry = jest.fn();
    render(<DashboardError retry={mockRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
    fireEvent.click(retryButton);
    
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('should render error alert with correct severity', () => {
    render(<DashboardError />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('MuiAlert-standardError');
  });

  it('should render refresh icon in retry button', () => {
    const mockRetry = jest.fn();
    render(<DashboardError retry={mockRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
    const refreshIcon = retryButton.querySelector('svg');
    expect(refreshIcon).toBeInTheDocument();
  });

  it('should handle both error and retry props together', () => {
    const customError = 'Erro específico do servidor';
    const mockRetry = jest.fn();
    
    render(<DashboardError error={customError} retry={mockRetry} />);
    
    expect(screen.getByText(customError)).toBeInTheDocument();
    
    const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('should handle empty error string', () => {
    render(<DashboardError error="" />);
    expect(
      screen.getByText('Erro ao carregar dados do dashboard. Tente novamente mais tarde.')
    ).toBeInTheDocument();
  });

  it('should maintain button styling and behavior', () => {
    const mockRetry = jest.fn();
    render(<DashboardError retry={mockRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
    
    // Test button properties
    expect(retryButton).toHaveAttribute('type', 'button');
    
    // Test multiple clicks
    fireEvent.click(retryButton);
    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalledTimes(2);
  });
});