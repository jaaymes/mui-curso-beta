/**
 * Testes para o AuthProvider
 * Verifica o funcionamento do contexto de autenticação SSR
 */
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuthSSR } from '@/components/providers/AuthProvider';
import { User } from '@/types';

// Mock do usuário para testes
const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  gender: 'male',
  image: 'https://example.com/avatar.jpg',
  token: 'mock-token',
  refreshToken: 'mock-refresh-token'
};

// Componente de teste que usa o hook useAuthSSR
function TestComponent() {
  const { user, isAuthenticated } = useAuthSSR();
  
  return (
    <div>
      <div data-testid="user-name">{user.firstName} {user.lastName}</div>
      <div data-testid="user-email">{user.email}</div>
      <div data-testid="is-authenticated">{isAuthenticated.toString()}</div>
    </div>
  );
}

// Componente que tenta usar o hook fora do provider
function ComponentWithoutProvider() {
  const { user } = useAuthSSR();
  return <div>{user.firstName}</div>;
}

describe('AuthProvider', () => {
  describe('Provider functionality', () => {
    it('deve fornecer dados do usuário para componentes filhos', () => {
      render(
        <AuthProvider user={mockUser}>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    });

    it('deve renderizar componentes filhos corretamente', () => {
      render(
        <AuthProvider user={mockUser}>
          <div data-testid="child-component">Child Content</div>
        </AuthProvider>
      );

      expect(screen.getByTestId('child-component')).toBeInTheDocument();
      expect(screen.getByTestId('child-component')).toHaveTextContent('Child Content');
    });

    it('deve sempre definir isAuthenticated como true', () => {
      render(
        <AuthProvider user={mockUser}>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    });

    it('deve funcionar com diferentes dados de usuário', () => {
      const differentUser: User = {
        id: 2,
        username: 'anotheruser',
        email: 'another@example.com',
        firstName: 'Another',
        lastName: 'Person',
        gender: 'female',
        image: 'https://example.com/another-avatar.jpg',
        token: 'another-token',
        refreshToken: 'another-refresh-token'
      };

      render(
        <AuthProvider user={differentUser}>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user-name')).toHaveTextContent('Another Person');
      expect(screen.getByTestId('user-email')).toHaveTextContent('another@example.com');
    });
  });

  describe('useAuthSSR hook', () => {
    it('deve retornar dados do contexto quando usado dentro do provider', () => {
      render(
        <AuthProvider user={mockUser}>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    });

    it('deve lançar erro quando usado fora do provider', () => {
      // Suprimir console.error para este teste
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<ComponentWithoutProvider />);
      }).toThrow('useAuthSSR deve ser usado dentro de um AuthProvider');
      
      consoleSpy.mockRestore();
    });

    it('deve retornar o mesmo objeto de contexto para múltiplos componentes', () => {
      function FirstComponent() {
        const { user } = useAuthSSR();
        return <div data-testid="first-component">{user.id}</div>;
      }

      function SecondComponent() {
        const { user } = useAuthSSR();
        return <div data-testid="second-component">{user.id}</div>;
      }

      render(
        <AuthProvider user={mockUser}>
          <FirstComponent />
          <SecondComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('first-component')).toHaveTextContent('1');
      expect(screen.getByTestId('second-component')).toHaveTextContent('1');
    });
  });

  describe('Context value structure', () => {
    it('deve ter a estrutura correta do contexto', () => {
      function ContextStructureTest() {
        const context = useAuthSSR();
        
        return (
          <div>
            <div data-testid="has-user">{typeof context.user}</div>
            <div data-testid="has-is-authenticated">{typeof context.isAuthenticated}</div>
            <div data-testid="user-properties">
              {Object.keys(context.user).join(',')}
            </div>
          </div>
        );
      }

      render(
        <AuthProvider user={mockUser}>
          <ContextStructureTest />
        </AuthProvider>
      );

      expect(screen.getByTestId('has-user')).toHaveTextContent('object');
      expect(screen.getByTestId('has-is-authenticated')).toHaveTextContent('boolean');
      expect(screen.getByTestId('user-properties')).toHaveTextContent(
        'id,username,email,firstName,lastName,gender,image,token,refreshToken'
      );
    });
  });

  describe('Edge cases', () => {
    it('deve funcionar com usuário com propriedades mínimas', () => {
      const minimalUser: User = {
        id: 999,
        username: 'minimal',
        email: 'minimal@test.com',
        firstName: 'Min',
        lastName: 'User',
        gender: 'male',
        image: '',
        token: 'token',
        refreshToken: 'refresh'
      };

      render(
        <AuthProvider user={minimalUser}>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user-name')).toHaveTextContent('Min User');
      expect(screen.getByTestId('user-email')).toHaveTextContent('minimal@test.com');
    });

    it('deve funcionar com múltiplos níveis de componentes aninhados', () => {
      function DeepNestedComponent() {
        const { user } = useAuthSSR();
        return <div data-testid="deep-nested">{user.username}</div>;
      }

      function MiddleComponent() {
        return (
          <div>
            <DeepNestedComponent />
          </div>
        );
      }

      render(
        <AuthProvider user={mockUser}>
          <MiddleComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('deep-nested')).toHaveTextContent('testuser');
    });
  });
});