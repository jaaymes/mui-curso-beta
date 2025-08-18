import { screen } from '@testing-library/react'
import { renderWithMui } from '../../utils/mui-test-utils'
import { SalesChart } from '@/components/charts/SalesChart'

// Mock Recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ data, children }: { data: any[]; children: React.ReactNode }) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Line: ({ dataKey, stroke }: { dataKey: string; stroke: string }) => (
    <div data-testid="line" data-key={dataKey} data-stroke={stroke} />
  ),
  XAxis: ({ dataKey }: { dataKey: string }) => (
    <div data-testid="x-axis" data-key={dataKey} />
  ),
  YAxis: ({ tickFormatter }: { tickFormatter: (value: number) => string }) => (
    <div data-testid="y-axis" data-tick={tickFormatter ? tickFormatter(1000) : ''} />
  ),
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}))

describe('SalesChart', () => {
  const mockData = [
    { name: 'Jan', value: 15000 },
    { name: 'Feb', value: 18000 },
    { name: 'Mar', value: 22000 },
    { name: 'Apr', value: 25000 },
    { name: 'May', value: 20000 },
    { name: 'Jun', value: 28000 }
  ]

  it('renders with default title', () => {
    renderWithMui(<SalesChart data={mockData} />)
    
    expect(screen.getByText('Visão Geral de Vendas')).toBeInTheDocument()
  })

  it('renders with custom title', () => {
    const customTitle = 'Monthly Sales Report'
    renderWithMui(<SalesChart data={mockData} title={customTitle} />)
    
    expect(screen.getByText(customTitle)).toBeInTheDocument()
  })

  it('renders chart components', () => {
    renderWithMui(<SalesChart data={mockData} />)
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    expect(screen.getByTestId('line')).toBeInTheDocument()
    expect(screen.getByTestId('x-axis')).toBeInTheDocument()
    expect(screen.getByTestId('y-axis')).toBeInTheDocument()
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
  })

  it('passes data to LineChart', () => {
    renderWithMui(<SalesChart data={mockData} />)
    
    const lineChart = screen.getByTestId('line-chart')
    expect(lineChart).toHaveAttribute('data-chart-data', JSON.stringify(mockData))
  })

  it('configures axes correctly', () => {
    renderWithMui(<SalesChart data={mockData} />)
    
    const xAxis = screen.getByTestId('x-axis')
    expect(xAxis).toHaveAttribute('data-key', 'name')
    
    const yAxis = screen.getByTestId('y-axis')
    expect(yAxis).toHaveAttribute('data-tick', '$1,000')
  })

  it('configures line with correct properties', () => {
    renderWithMui(<SalesChart data={mockData} />)
    
    const line = screen.getByTestId('line')
    expect(line).toHaveAttribute('data-key', 'value')
    expect(line).toHaveAttribute('data-stroke', '#d32f2f')
  })

  it('handles empty data gracefully', () => {
    renderWithMui(<SalesChart data={[]} />)
    
    expect(screen.getByText('Visão Geral de Vendas')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('renders in a card container', () => {
    const { container } = renderWithMui(<SalesChart data={mockData} />)
    
    const card = container.querySelector('.MuiCard-root')
    expect(card).toBeInTheDocument()
  })

  it('has correct chart dimensions', () => {
    renderWithMui(<SalesChart data={mockData} />)
    
    const chartContainer = screen.getByTestId('chart-container')
    expect(chartContainer).toBeInTheDocument()
  })

  it('formats Y-axis values as currency', () => {
    renderWithMui(<SalesChart data={mockData} />)
    
    const yAxis = screen.getByTestId('y-axis')
    expect(yAxis).toHaveAttribute('data-tick', '$1,000')
  })

  it('uses proper styling', () => {
    const { container } = renderWithMui(<SalesChart data={mockData} />)
    
    const typography = container.querySelector('.MuiTypography-h6')
    expect(typography).toBeInTheDocument()
    
    const cardContent = container.querySelector('.MuiCardContent-root')
    expect(cardContent).toBeInTheDocument()
  })
})