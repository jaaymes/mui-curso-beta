import { screen } from '@testing-library/react'
import { renderWithMui } from '../../utils/mui-test-utils'
import { RevenueChart } from '@/components/charts/RevenueChart'

// Mock Recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ data, label, children }: { data: any[]; label: any; children: React.ReactNode }) => (
    <div data-testid="pie">
      {data.map((item, index) => (
        <div key={index} data-testid={`pie-segment-${index}`}>
          {typeof label === 'function' 
            ? label({ name: item.name, percent: 0.25 })
            : item.name
          }
        </div>
      ))}
      {children}
    </div>
  ),
  Cell: ({ fill }: { fill: string }) => (
    <div data-testid="pie-cell" style={{ backgroundColor: fill }} />
  ),
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}))

describe('RevenueChart', () => {
  const mockData = [
    { name: 'Electronics', value: 25000 },
    { name: 'Clothing', value: 18000 },
    { name: 'Books', value: 12000 },
    { name: 'Sports', value: 8000 }
  ]

  it('renders with default title', () => {
    renderWithMui(<RevenueChart data={mockData} />)
    
    expect(screen.getByText('Receita por Categoria')).toBeInTheDocument()
  })

  it('renders with custom title', () => {
    const customTitle = 'Custom Revenue Title'
    renderWithMui(<RevenueChart data={mockData} title={customTitle} />)
    
    expect(screen.getByText(customTitle)).toBeInTheDocument()
  })

  it('renders chart components', () => {
    renderWithMui(<RevenueChart data={mockData} />)
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    expect(screen.getByTestId('pie')).toBeInTheDocument()
    expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    expect(screen.getByTestId('legend')).toBeInTheDocument()
  })

  it('renders pie segments with labels', () => {
    renderWithMui(<RevenueChart data={mockData} />)
    
    expect(screen.getByText('Electronics 25%')).toBeInTheDocument()
    expect(screen.getByText('Clothing 25%')).toBeInTheDocument()
    expect(screen.getByText('Books 25%')).toBeInTheDocument()
    expect(screen.getByText('Sports 25%')).toBeInTheDocument()
  })

  it('renders cells with colors', () => {
    renderWithMui(<RevenueChart data={mockData} />)
    
    const cells = screen.getAllByTestId('pie-cell')
    expect(cells).toHaveLength(mockData.length)
  })

  it('handles empty data gracefully', () => {
    renderWithMui(<RevenueChart data={[]} />)
    
    expect(screen.getByText('Receita por Categoria')).toBeInTheDocument()
    expect(screen.getByTestId('pie')).toBeInTheDocument()
  })

  it('renders in a card container', () => {
    const { container } = renderWithMui(<RevenueChart data={mockData} />)
    
    const card = container.querySelector('.MuiCard-root')
    expect(card).toBeInTheDocument()
  })

  it('has correct chart dimensions', () => {
    renderWithMui(<RevenueChart data={mockData} />)
    
    // Verifica se o ResponsiveContainer está presente (que controla as dimensões)
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('displays data with correct structure', () => {
    renderWithMui(<RevenueChart data={mockData} />)
    
    // Verify all data items are represented
    mockData.forEach((item, index) => {
      expect(screen.getByTestId(`pie-segment-${index}`)).toBeInTheDocument()
    })
  })
})