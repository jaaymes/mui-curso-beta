import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterBar } from '@/components/ui/FilterBar'
import { ThemeProvider, createTheme } from '@mui/material/styles'

const theme = createTheme()

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  )
}

describe('FilterBar', () => {
  const mockOnFiltersChange = jest.fn()
  const defaultProps = {
    onFiltersChange: mockOnFiltersChange,
  }

  beforeEach(() => {
    mockOnFiltersChange.mockClear()
  })

  it('renders with basic props', () => {
    renderWithTheme(<FilterBar {...defaultProps} />)
    
    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument()
    expect(screen.getByText('Ordenar Por')).toBeInTheDocument()
    expect(screen.getByText('Ordem')).toBeInTheDocument()
  })

  it('renders categories dropdown when categories provided', () => {
    const categories = ['Electronics', 'Clothing', 'Books']
    renderWithTheme(
      <FilterBar {...defaultProps} categories={categories} />
    )
    
    expect(screen.getByText('Categoria')).toBeInTheDocument()
  })

  it('renders roles dropdown when roles provided', () => {
    const roles = ['admin', 'user', 'moderator']
    renderWithTheme(
      <FilterBar {...defaultProps} roles={roles} />
    )
    
    expect(screen.getByText('Função')).toBeInTheDocument()
  })

  it('calls onFiltersChange when search input changes', async () => {
    const user = userEvent.setup()
    renderWithTheme(<FilterBar {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('Buscar...')
    await user.type(searchInput, 'test')
    
    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        search: 'test',
        category: '',
        role: '',
        sortBy: 'name',
        sortOrder: 'asc'
      })
    })
  })

  it('calls onFiltersChange when category changes', async () => {
    const user = userEvent.setup()
    const categories = ['Electronics', 'Clothing']
    renderWithTheme(
      <FilterBar {...defaultProps} categories={categories} />
    )
    
    // Get all comboboxes and select the first one (category)
    const comboboxes = screen.getAllByRole('combobox')
    const categorySelect = comboboxes[0]
    await user.click(categorySelect)
    
    const electronicsOption = await screen.findByText('Electronics')
    await user.click(electronicsOption)
    
    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        search: '',
        category: 'Electronics',
        role: '',
        sortBy: 'name',
        sortOrder: 'asc'
      })
    })
  })



  it('calls onFiltersChange when sort by changes', async () => {
    const user = userEvent.setup()
    renderWithTheme(<FilterBar {...defaultProps} />)
    
    // Get all comboboxes and select the first one (sortBy - no categories/roles)
    const comboboxes = screen.getAllByRole('combobox')
    const sortBySelect = comboboxes[0]
    await user.click(sortBySelect)
    
    const emailOption = await screen.findByText('Email')
    await user.click(emailOption)
    
    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        search: '',
        category: '',
        role: '',
        sortBy: 'email',
        sortOrder: 'asc'
      })
    })
  })

  it('calls onFiltersChange when sort order changes', async () => {
    const user = userEvent.setup()
    renderWithTheme(<FilterBar {...defaultProps} />)
    
    // Get all comboboxes and select the second one (sortOrder - no categories/roles)
    const comboboxes = screen.getAllByRole('combobox')
    const sortOrderSelect = comboboxes[1]
    await user.click(sortOrderSelect)
    
    const descOption = await screen.findByText('Decrescente')
    await user.click(descOption)
    
    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        search: '',
        category: '',
        role: '',
        sortBy: 'name',
        sortOrder: 'desc'
      })
    })
  })

  it('shows clear filters button when filters are active', async () => {
    const user = userEvent.setup()
    renderWithTheme(<FilterBar {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('Buscar...')
    await user.type(searchInput, 'test')
    
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  it('clears all filters when clear button is clicked', async () => {
    const user = userEvent.setup()
    renderWithTheme(<FilterBar {...defaultProps} />)
    
    // Add a filter
    const searchInput = screen.getByPlaceholderText('Buscar...')
    await user.type(searchInput, 'test')
    
    await waitFor(() => {
      const clearButton = screen.getByRole('button')
      expect(clearButton).toBeInTheDocument()
    })
    
    const clearButton = screen.getByRole('button')
    await user.click(clearButton)
    
    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
        search: '',
        category: '',
        role: '',
        sortBy: 'name',
        sortOrder: 'asc'
      })
    })
    
    expect(screen.getByDisplayValue('')).toBeInTheDocument()
  })

  it('does not show clear button when no filters are active', () => {
    renderWithTheme(<FilterBar {...defaultProps} />)
    
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })




})