import { render, screen } from '@testing-library/react'
import { StatsCard } from '@/components/ui/StatsCard'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { TrendingUp } from '@mui/icons-material'

const theme = createTheme()

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  )
}

describe('StatsCard', () => {
  const defaultProps = {
    title: 'Total Users',
    value: 1250,
    icon: <TrendingUp />,
    color: 'primary' as const,
  }

  it('renders with basic props', () => {
    renderWithTheme(<StatsCard {...defaultProps} />)
    
    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('1.3K')).toBeInTheDocument()
  })

  it('formats large numbers correctly', () => {
    renderWithTheme(
      <StatsCard {...defaultProps} value={1500000} />
    )
    
    expect(screen.getByText('1.5M')).toBeInTheDocument()
  })

  it('formats thousands correctly', () => {
    renderWithTheme(
      <StatsCard {...defaultProps} value={15000} />
    )
    
    expect(screen.getByText('15.0K')).toBeInTheDocument()
  })

  it('displays trend information when provided', () => {
    const trend = { value: 12.5, label: 'from last month' }
    renderWithTheme(
      <StatsCard {...defaultProps} trend={trend} />
    )
    
    expect(screen.getByText('+12.5% from last month')).toBeInTheDocument()
  })

  it('displays negative trend correctly', () => {
    const trend = { value: -5.2, label: 'from last month' }
    renderWithTheme(
      <StatsCard {...defaultProps} trend={trend} />
    )
    
    expect(screen.getByText('-5.2% from last month')).toBeInTheDocument()
  })

  it('handles string values', () => {
    renderWithTheme(
      <StatsCard {...defaultProps} value="$45,678" />
    )
    
    expect(screen.getByText('$45,678')).toBeInTheDocument()
  })
})