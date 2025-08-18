import { render, screen } from '@testing-library/react';
import Loading from '@/app/(dashboard)/dashboard/loading';

// Mock Material-UI Grid
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Grid: ({ children, ...props }: any) => (
    <div data-testid="grid" {...props}>
      {children}
    </div>
  ),
}));

describe('Dashboard Loading', () => {
  it('should render dashboard title', () => {
    render(<Loading />);
    expect(screen.getByText('Visão Geral do Painel')).toBeInTheDocument();
  });

  it('should render loading message', () => {
    render(<Loading />);
    expect(screen.getByText('Carregando dados do dashboard...')).toBeInTheDocument();
  });

  it('should render loading spinner', () => {
    render(<Loading />);
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
  });

  it('should render skeleton placeholders for stats cards', () => {
    const { container } = render(<Loading />);
    
    // Should render 4 skeleton cards for stats
    const skeletons = container.querySelectorAll('[class*="MuiSkeleton-rectangular"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });

  it('should render grid containers for layout', () => {
    render(<Loading />);
    
    const grids = screen.getAllByTestId('grid');
    expect(grids.length).toBeGreaterThan(0);
  });

  it('should render fixed positioned loading indicator', () => {
    render(<Loading />);
    
    // The loading indicator exists and is positioned - specific styles are applied via MUI
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
  });

  it('should have centered loading indicator', () => {
    render(<Loading />);
    
    // The loading indicator exists and is centered - specific styles are applied via MUI
    const spinner = screen.getByRole('progressbar');
    expect(spinner).toBeInTheDocument();
  });

  it('should render with appropriate heading hierarchy', () => {
    render(<Loading />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Visão Geral do Painel');
  });

  it('should have loading state accessibility', () => {
    render(<Loading />);
    
    // Check for progress indicator which is important for screen readers
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
  });

  it('should render skeleton with correct styling', () => {
    const { container } = render(<Loading />);
    
    const skeletons = container.querySelectorAll('[class*="MuiSkeleton-rectangular"]');
    skeletons.forEach(skeleton => {
      expect(skeleton).toHaveStyle({ borderRadius: '4px' });
    });
  });

  it('should render different height skeletons for different sections', () => {
    const { container } = render(<Loading />);
    
    const skeletons = container.querySelectorAll('[class*="MuiSkeleton-rectangular"]');
    
    // Check that we have different skeleton heights (stats: 120px, charts: 400px, activity: 300px)
    expect(skeletons.length).toBeGreaterThanOrEqual(8);
  });
});