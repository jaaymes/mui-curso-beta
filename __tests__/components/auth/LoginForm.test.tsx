import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/auth/LoginForm'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { useAuth } from '@/store/use-auth'
import { useRouter } from 'next/navigation'

// Mock the dependencies
jest.mock('@/store/use-auth')
jest.mock('next/navigation')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

const theme = createTheme()

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  )
}

describe('LoginForm', () => {
  const mockSetUser = jest.fn()
  const mockSetLoading = jest.fn()
  const mockPush = jest.fn()
  const mockLoginAction = jest.fn()

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      setUser: mockSetUser,
      setLoading: mockSetLoading,
      login: jest.fn(),
      logout: jest.fn()
    })

    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn()
    })

    jest.clearAllMocks()
  })

  const defaultProps = {
    loginAction: mockLoginAction
  }

  it('renders login form with default values', () => {
    renderWithTheme(<LoginForm {...defaultProps} />)
    
    expect(screen.getByLabelText('Nome de usuário')).toHaveValue('emilys')
    expect(screen.getByLabelText('Senha')).toHaveValue('emilyspass')
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('toggles password visibility when visibility icon is clicked', async () => {
    const user = userEvent.setup()
    renderWithTheme(<LoginForm {...defaultProps} />)
    
    const passwordField = screen.getByLabelText('Senha')
    const visibilityButton = screen.getByTestId('password-visibility-toggle')
    
    expect(passwordField).toHaveAttribute('type', 'password')
    
    await user.click(visibilityButton)
    expect(passwordField).toHaveAttribute('type', 'text')
    
    await user.click(visibilityButton)
    expect(passwordField).toHaveAttribute('type', 'password')
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    renderWithTheme(<LoginForm {...defaultProps} />)
    
    // Clear the default values
    const usernameField = screen.getByLabelText('Nome de usuário')
    const passwordField = screen.getByLabelText('Senha')
    
    await user.clear(usernameField)
    await user.clear(passwordField)
    
    const submitButton = screen.getByRole('button', { name: 'Entrar' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Nome de usuário é obrigatório')).toBeInTheDocument()
      expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument()
    })
  })

  it('validates minimum password length', async () => {
    const user = userEvent.setup()
    renderWithTheme(<LoginForm {...defaultProps} />)
    
    const passwordField = screen.getByLabelText('Senha')
    await user.clear(passwordField)
    await user.type(passwordField, '123')
    
    const submitButton = screen.getByRole('button', { name: 'Entrar' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Senha deve ter pelo menos 6 caracteres')).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const mockUser = { id: 1, username: 'emilys', email: 'emily@example.com' }
    mockLoginAction.mockResolvedValue({ user: mockUser })
    
    renderWithTheme(<LoginForm {...defaultProps} />)
    
    const submitButton = screen.getByRole('button', { name: 'Entrar' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockLoginAction).toHaveBeenCalledWith(expect.any(FormData))
      expect(mockSetUser).toHaveBeenCalledWith(mockUser)
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('displays error message on login failure', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Invalid credentials'
    mockLoginAction.mockResolvedValue({ error: errorMessage })
    
    renderWithTheme(<LoginForm {...defaultProps} />)
    
    const submitButton = screen.getByRole('button', { name: 'Entrar' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(mockSetLoading).toHaveBeenCalledWith(false)
    })
  })

  it('handles server error gracefully', async () => {
    const user = userEvent.setup()
    mockLoginAction.mockRejectedValue(new Error('Server error'))
    
    renderWithTheme(<LoginForm {...defaultProps} />)
    
    const submitButton = screen.getByRole('button', { name: 'Entrar' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Erro interno do servidor')).toBeInTheDocument()
      expect(mockSetLoading).toHaveBeenCalledWith(false)
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    // Make the login action hang to test loading state
    let resolveLogin: (value: any) => void
    const loginPromise = new Promise(resolve => {
      resolveLogin = resolve
    })
    mockLoginAction.mockReturnValue(loginPromise)
    
    renderWithTheme(<LoginForm {...defaultProps} />)
    
    const submitButton = screen.getByRole('button', { name: 'Entrar' })
    await user.click(submitButton)
    
    // Check if loading state is shown
    expect(screen.getByText('Entrando...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
    
    // Resolve the promise to clean up
    resolveLogin!({ user: { id: 1 } })
    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalled()
    })
  })

  it('clears error when form is resubmitted', async () => {
    const user = userEvent.setup()
    mockLoginAction
      .mockResolvedValueOnce({ error: 'Invalid credentials' })
      .mockResolvedValueOnce({ user: { id: 1 } })
    
    renderWithTheme(<LoginForm {...defaultProps} />)
    
    const submitButton = screen.getByRole('button', { name: 'Entrar' })
    
    // First submission with error
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
    
    // Second submission should clear error
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument()
    })
  })

  it('passes correct FormData to loginAction', async () => {
    const user = userEvent.setup()
    renderWithTheme(<LoginForm {...defaultProps} />)
    
    const usernameField = screen.getByLabelText('Nome de usuário')
    const passwordField = screen.getByLabelText('Senha')
    
    await user.clear(usernameField)
    await user.clear(passwordField)
    await user.type(usernameField, 'testuser')
    await user.type(passwordField, 'testpass')
    
    const submitButton = screen.getByRole('button', { name: 'Entrar' })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockLoginAction).toHaveBeenCalled()
      const formData = mockLoginAction.mock.calls[0][0] as FormData
      expect(formData.get('username')).toBe('testuser')
      expect(formData.get('password')).toBe('testpass')
    })
  })

  it('sets loading state when submission starts', async () => {
    const user = userEvent.setup()
    renderWithTheme(<LoginForm {...defaultProps} />)
    
    const submitButton = screen.getByRole('button', { name: 'Entrar' })
    await user.click(submitButton)
    
    expect(mockSetLoading).toHaveBeenCalledWith(true)
  })

  it('has proper form attributes', () => {
    const { container } = renderWithTheme(<LoginForm {...defaultProps} />)
    
    const form = container.querySelector('form')
    expect(form).toHaveAttribute('noValidate')
    
    const usernameField = screen.getByLabelText('Nome de usuário')
    expect(usernameField).toHaveAttribute('autoComplete', 'username')
    expect(usernameField).toHaveFocus()
    
    const passwordField = screen.getByLabelText('Senha')
    expect(passwordField).toHaveAttribute('autoComplete', 'current-password')
  })
})