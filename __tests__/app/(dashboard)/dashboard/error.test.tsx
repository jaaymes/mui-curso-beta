import { render, screen } from '@testing-library/react';
import Error from '@/app/(dashboard)/dashboard/error';
import React from 'react';

// Don't mock React for better compatibility
// The useEffect should work naturally in the test environment

// Mock console.error to test logging (override global setup)
const mockConsoleError = jest.fn();

describe('Dashboard Error Page', () => {
  const mockError = {
    message: 'Test error message',
    name: 'Error',
    stack: 'Error: Test error message\n    at Object.<anonymous>'
  } as Error;
  const mockReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Override the global console.error mock for this test suite
    console.error = mockConsoleError;
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  it('should render DashboardError with formatted error message', () => {
    // Test that the mockError is correctly set up
    expect(mockError.message).toBe('Test error message');
    
    render(<Error error={mockError} reset={mockReset} />);
    
    expect(screen.getByText('Falha ao carregar o dashboard: Test error message')).toBeInTheDocument();
  });

  it('should pass reset function to DashboardError as retry prop', () => {
    render(<Error error={mockError} reset={mockReset} />);
    
    const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should log error to console on mount', async () => {
    const { container } = render(<Error error={mockError} reset={mockReset} />);
    
    // Wait a bit for useEffect to run
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockConsoleError).toHaveBeenCalledWith('Dashboard error:', mockError);
    expect(mockConsoleError).toHaveBeenCalledTimes(1);
  });

  it('should handle error with digest property', () => {
    const errorWithDigest = {
      message: 'Test error',
      name: 'Error',
      digest: 'abc123',
      stack: 'Error: Test error\n    at Object.<anonymous>'
    } as Error & { digest?: string };
    
    render(<Error error={errorWithDigest} reset={mockReset} />);
    
    expect(screen.getByText('Falha ao carregar o dashboard: Test error')).toBeInTheDocument();
    expect(mockConsoleError).toHaveBeenCalledWith('Dashboard error:', errorWithDigest);
  });

  it('should re-log error when error changes', () => {
    const { rerender } = render(<Error error={mockError} reset={mockReset} />);
    
    expect(mockConsoleError).toHaveBeenCalledTimes(1);
    
    const newError = {
      message: 'New error message',
      name: 'Error',
      stack: 'Error: New error message\n    at Object.<anonymous>'
    } as Error;
    
    rerender(<Error error={newError} reset={mockReset} />);
    
    expect(mockConsoleError).toHaveBeenCalledTimes(2);
    expect(mockConsoleError).toHaveBeenLastCalledWith('Dashboard error:', newError);
  });

  it('should not re-log same error instance', () => {
    const { rerender } = render(<Error error={mockError} reset={mockReset} />);
    
    expect(mockConsoleError).toHaveBeenCalledTimes(1);
    
    // Re-render with same error instance
    rerender(<Error error={mockError} reset={mockReset} />);
    
    // Should not call console.error again
    expect(mockConsoleError).toHaveBeenCalledTimes(1);
  });

  it('should handle errors with empty messages', () => {
    const emptyError = {
      message: '',
      name: 'Error',
      stack: 'Error: \n    at Object.<anonymous>'
    } as Error;
    
    render(<Error error={emptyError} reset={mockReset} />);
    
    expect(screen.getByText('Falha ao carregar o dashboard: Erro desconhecido')).toBeInTheDocument();
  });

  it('should render dashboard title from DashboardError component', () => {
    render(<Error error={mockError} reset={mockReset} />);
    
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
  });

  it('should render error alert from DashboardError component', () => {
    render(<Error error={mockError} reset={mockReset} />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });

  it('should handle errors with special characters in message', () => {
    const specialError = {
      message: 'Error with <tags> & "quotes" and symbols €$%',
      name: 'Error',
      stack: 'Error: Error with <tags> & "quotes" and symbols €$%\n    at Object.<anonymous>'
    } as Error;
    
    render(<Error error={specialError} reset={mockReset} />);
    
    expect(screen.getByText('Falha ao carregar o dashboard: Error with <tags> & "quotes" and symbols €$%')).toBeInTheDocument();
  });

  it('should maintain error boundary pattern behavior', () => {
    // This component should be used as an error boundary
    // It receives error and reset props which is the standard pattern
    render(<Error error={mockError} reset={mockReset} />);
    
    // Verify it renders without throwing
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
  });
});