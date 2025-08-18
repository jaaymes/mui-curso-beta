describe("Autenticação", () => {
  beforeEach(() => {
    // Limpar cookies e localStorage antes de cada teste
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe("Login", () => {
    it('deve fazer login com credenciais válidas', () => {
      cy.visit('/login')
      
      cy.get('[data-testid="username-input"] input').clear().type('emilys')
      cy.get('[data-testid="password-input"] input').clear().type('emilyspass')
      cy.get('[data-testid="login-button"]').click()
      
      cy.url().should('include', '/dashboard', { timeout: 10000 })
      cy.contains('Dashboard').should('be.visible')
    })

    it('deve mostrar erro com credenciais inválidas', () => {
      cy.visit('/login')
      
      cy.get('[data-testid="username-input"] input').clear().type('invalid')
      cy.get('[data-testid="password-input"] input').clear().type('invalid')
      cy.get('[data-testid="login-button"]').click()
      
      cy.contains('Invalid credentials').should('be.visible')
      cy.url().should('include', '/login')
    })

    it('deve validar campos obrigatórios', () => {
      cy.visit('/login')
      
      cy.get('[data-testid="username-input"] input').clear()
      cy.get('[data-testid="password-input"] input').clear()
      cy.get('[data-testid="login-button"]').click()
      
      cy.contains('Nome de usuário é obrigatório').should('be.visible')
      cy.contains('Senha é obrigatória').should('be.visible')
    })

    it('deve mostrar/ocultar senha', () => {
      cy.visit('/login')
      
      cy.get('[data-testid="password-input"] input').type('password123')
      cy.get('[data-testid="password-visibility-toggle"]').click()
      cy.get('[data-testid="password-input"] input').should('have.attr', 'type', 'text')
      cy.get('[data-testid="password-visibility-toggle"]').click()
      cy.get('[data-testid="password-input"] input').should('have.attr', 'type', 'password')
    })

    it('deve exibir credenciais demo', () => {
      cy.visit('/login')
      
      cy.contains('Credenciais de Demonstração').should('be.visible')
      cy.contains('emilys / emilyspass').should('be.visible')
      cy.contains('michaelw / michaelwpass').should('be.visible')
      cy.contains('sophiab / sophiabpass').should('be.visible')
    })
  });

  describe("Logout", () => {
    beforeEach(() => {
      cy.login();
    });

    it("deve fazer logout com sucesso", () => {
      cy.visit("/dashboard");

      // Verificar que está logado
      cy.contains('Dashboard').should('be.visible');

      // Fazer logout via comando customizado
      cy.logout();

      // Verificar redirecionamento para login
      cy.url().should("include", "/login");
      cy.get('[data-testid="login-button"]').should("be.visible");
    });

    it("deve limpar dados de autenticação no logout", () => {
      cy.visit("/dashboard");

      // Fazer logout
      cy.logout();

      // Tentar acessar página protegida
      cy.visit("/dashboard");
      cy.url().should("include", "/login");
    });
  });

  describe("Proteção de Rotas", () => {
    it("deve redirecionar para login ao acessar rota protegida sem autenticação", () => {
      // Tentar acessar dashboard sem estar logado
      cy.visit("/dashboard");

      // Deve ser redirecionado para login
      cy.url().should("include", "/login");
    });

    it("deve redirecionar para login ao acessar produtos sem autenticação", () => {
      cy.visit("/products");
      cy.url().should("include", "/login");
    });

    it("deve redirecionar para login ao acessar usuários sem autenticação", () => {
      cy.visit("/users");
      cy.url().should("include", "/login");
    });

    it("deve permitir acesso a rotas protegidas quando autenticado", () => {
      cy.get('[data-testid="username-input"] input').type('emilys')
      cy.get('[data-testid="password-input"] input').type('emilyspass')
      cy.get('[data-testid="login-button"]').click()
      cy.url({ timeout: 10000 }).should('include', '/dashboard')
      
      cy.visit('/products')
      cy.url().should('include', '/products')
      
      cy.visit('/users')
      cy.url().should('include', '/users')
    });
  });

  describe("Persistência de Sessão", () => {
    it("deve manter sessão após recarregar página", () => {
      cy.get('[data-testid="username-input"] input').type('emilys')
      cy.get('[data-testid="password-input"] input').type('emilyspass')
      cy.get('[data-testid="login-button"]').click()
      cy.url({ timeout: 10000 }).should('include', '/dashboard')
      
      cy.reload()
      cy.url().should('include', '/dashboard')
    });

    it("deve redirecionar para dashboard se já estiver logado", () => {
      cy.get('[data-testid="username-input"] input').type('emilys')
      cy.get('[data-testid="password-input"] input').type('emilyspass')
      cy.get('[data-testid="login-button"]').click()
      cy.url({ timeout: 10000 }).should('include', '/dashboard')
      
      cy.visit('/login')
      cy.url().should('include', '/dashboard')
    });
  });

  describe("Responsividade", () => {
    it("deve funcionar em dispositivos móveis", () => {
      cy.viewport(375, 667); // iPhone SE
      cy.visit("/login");

      cy.get('[data-testid="username-input"]').should("be.visible");
      cy.get('[data-testid="password-input"]').should("be.visible");
      cy.get('[data-testid="login-button"]').should("be.visible");

      // Testar login em mobile
      cy.get('[data-testid="username-input"] input').clear().type("emilys");
      cy.get('[data-testid="password-input"] input').clear().type("emilyspass");
      cy.get('[data-testid="login-button"]').click();

      cy.url().should("include", "/dashboard");
    });

    it("deve funcionar em tablets", () => {
      cy.viewport(768, 1024); // iPad
      cy.visit("/login");

      cy.get('[data-testid="username-input"]').should("be.visible");
      cy.get('[data-testid="password-input"]').should("be.visible");
      cy.get('[data-testid="login-button"]').should("be.visible");
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter labels apropriados nos campos", () => {
      cy.visit("/login");

      cy.get('label').contains('Nome de usuário').should('be.visible');
      cy.get('label').contains('Senha').should('be.visible');
    });

    it("deve permitir navegação por teclado", () => {
      cy.visit("/login");

      // Navegar pelos campos usando Tab
      cy.get('[data-testid="username-input"] input').focus();
      cy.focused().should("have.attr", "name", "username");

      cy.focused().tab();
      cy.focused().should("have.attr", "name", "password");

      cy.focused().tab();
      cy.focused().should("have.attr", "type", "submit");
    });
  });
});
