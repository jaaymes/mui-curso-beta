import { render } from '@testing-library/react';
import RootLayout, { metadata } from '@/app/layout';

// Mock do CustomThemeProvider
jest.mock('@/contexts/ThemeContext', () => ({
  CustomThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

// Mock das fontes do Google
jest.mock('next/font/google', () => ({
  Geist: () => ({
    variable: '--font-geist-sans',
  }),
  Geist_Mono: () => ({
    variable: '--font-geist-mono',
  }),
}));

describe('RootLayout', () => {
  /**
   * Testa se o layout principal renderiza corretamente com os elementos básicos
   */
  it('renders correctly with basic structure', () => {
    const { getByTestId } = render(
      <RootLayout>
        <div data-testid="child-content">Test Content</div>
      </RootLayout>
    );

    // Verifica se o ThemeProvider está presente
    expect(getByTestId('theme-provider')).toBeInTheDocument();

    // Verifica se o conteúdo filho é renderizado
    expect(getByTestId('child-content')).toBeInTheDocument();
    expect(getByTestId('child-content')).toHaveTextContent('Test Content');
  });

  /**
   * Testa se o layout renderiza múltiplos filhos corretamente
   */
  it('renders multiple children correctly', () => {
    const { getByTestId } = render(
      <RootLayout>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </RootLayout>
    );

    expect(getByTestId('child-1')).toBeInTheDocument();
    expect(getByTestId('child-2')).toBeInTheDocument();
  });

  /**
   * Testa se o layout funciona sem filhos
   */
  it('renders without children', () => {
    const { getByTestId } = render(<RootLayout>{null}</RootLayout>);

    expect(getByTestId('theme-provider')).toBeInTheDocument();
  });

  /**
   * Testa os metadados exportados
   */
  it('exports correct metadata', () => {
    expect(metadata).toBeDefined();
    expect(metadata.title).toBe('Dashboard App - Modern Admin Panel');
    expect(metadata.description).toBe(
      'A comprehensive Next.js dashboard application with user and product management'
    );
  });
});