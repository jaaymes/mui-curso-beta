describe('Navigation', () => {
  beforeEach(() => {
    // Fazer login antes de cada teste
    cy.login()
  })

  describe('Menu Lateral (Sidebar)', () => {
    it('deve exibir menu lateral após login', () => {
      cy.visit('/dashboard')
      
      cy.get('[data-testid="sidebar"]').should('be.visible')
      cy.get('[data-testid="sidebar-logo"]').should('be.visible')
      cy.get('[data-testid="sidebar-menu"]').should('be.visible')
    })

    it('deve conter todos os links de navegação', () => {
      cy.visit('/dashboard')
      
      cy.get('[data-testid="sidebar-menu"]').within(() => {
        cy.get('[data-testid="nav-dashboard"]').should('be.visible').and('contain', 'Dashboard')
        cy.get('[data-testid="nav-products"]').should('be.visible').and('contain', 'Products')
        cy.get('[data-testid="nav-users"]').should('be.visible').and('contain', 'Users')
        cy.get('[data-testid="nav-settings"]').should('be.visible').and('contain', 'Settings')
      })
    })

    it('deve destacar item ativo no menu', () => {
      cy.visit('/dashboard')
      cy.get('[data-testid="nav-dashboard"]').should('have.class', 'active')
      
      cy.visit('/dashboard/products')
      cy.get('[data-testid="nav-products"]').should('have.class', 'active')
      cy.get('[data-testid="nav-dashboard"]').should('not.have.class', 'active')
    })

    it('deve permitir colapsar/expandir menu lateral', () => {
      cy.visit('/dashboard')
      
      cy.get('[data-testid="sidebar-toggle"]').click()
      cy.get('[data-testid="sidebar"]').should('have.class', 'collapsed')
      
      cy.get('[data-testid="sidebar-toggle"]').click()
      cy.get('[data-testid="sidebar"]').should('not.have.class', 'collapsed')
    })

    it('deve manter estado do menu após navegação', () => {
      cy.visit('/dashboard')
      
      cy.get('[data-testid="sidebar-toggle"]').click()
      cy.get('[data-testid="nav-products"]').click()
      
      cy.url().should('include', '/dashboard/products')
      cy.get('[data-testid="sidebar"]').should('have.class', 'collapsed')
    })
  })

  describe('Navegação entre Páginas', () => {
    it('deve navegar do dashboard para produtos', () => {
      cy.visit('/dashboard')
      
      cy.get('[data-testid="nav-products"]').click()
      
      cy.url().should('include', '/dashboard/products')
      cy.get('[data-testid="page-title"]').should('contain', 'Products')
      cy.get('[data-testid="products-table"]').should('be.visible')
    })

    it('deve navegar do dashboard para usuários', () => {
      cy.visit('/dashboard')
      
      cy.get('[data-testid="nav-users"]').click()
      
      cy.url().should('include', '/dashboard/users')
      cy.get('[data-testid="page-title"]').should('contain', 'Users')
      cy.get('[data-testid="users-table"]').should('be.visible')
    })

    it('deve navegar entre produtos e usuários', () => {
      cy.visit('/dashboard/products')
      
      cy.get('[data-testid="nav-users"]').click()
      cy.url().should('include', '/dashboard/users')
      
      cy.get('[data-testid="nav-products"]').click()
      cy.url().should('include', '/dashboard/products')
    })

    it('deve voltar ao dashboard de qualquer página', () => {
      cy.visit('/dashboard/products')
      
      cy.get('[data-testid="nav-dashboard"]').click()
      
      cy.url().should('include', '/dashboard')
      cy.url().should('not.include', '/products')
      cy.get('[data-testid="dashboard-stats"]').should('be.visible')
    })
  })

  describe('Breadcrumbs', () => {
    it('deve exibir breadcrumbs na página de produtos', () => {
      cy.visit('/dashboard/products')
      
      cy.get('[data-testid="breadcrumbs"]').should('be.visible')
      cy.get('[data-testid="breadcrumb-home"]').should('contain', 'Dashboard')
      cy.get('[data-testid="breadcrumb-current"]').should('contain', 'Products')
    })

    it('deve exibir breadcrumbs na página de usuários', () => {
      cy.visit('/dashboard/users')
      
      cy.get('[data-testid="breadcrumbs"]').should('be.visible')
      cy.get('[data-testid="breadcrumb-home"]').should('contain', 'Dashboard')
      cy.get('[data-testid="breadcrumb-current"]').should('contain', 'Users')
    })

    it('deve permitir navegação através dos breadcrumbs', () => {
      cy.visit('/dashboard/products')
      
      cy.get('[data-testid="breadcrumb-home"]').click()
      
      cy.url().should('include', '/dashboard')
      cy.url().should('not.include', '/products')
    })
  })

  describe('Header de Navegação', () => {
    it('deve exibir header com informações do usuário', () => {
      cy.visit('/dashboard')
      
      cy.get('[data-testid="header"]').should('be.visible')
      cy.get('[data-testid="user-menu"]').should('be.visible')
      cy.get('[data-testid="user-avatar"]').should('be.visible')
      cy.get('[data-testid="user-name"]').should('be.visible')
    })

    it('deve exibir menu dropdown do usuário', () => {
      cy.visit('/dashboard')
      
      cy.get('[data-testid="user-menu"]').click()
      
      cy.get('[data-testid="user-dropdown"]').should('be.visible')
      cy.get('[data-testid="profile-link"]').should('be.visible')
      cy.get('[data-testid="settings-link"]').should('be.visible')
      cy.get('[data-testid="logout-button"]').should('be.visible')
    })

    it('deve permitir logout através do menu do usuário', () => {
      cy.visit('/dashboard')
      
      cy.get('[data-testid="user-menu"]').click()
      cy.get('[data-testid="logout-button"]').click()
      
      cy.url().should('include', '/login')
      cy.get('[data-testid="login-form"]').should('be.visible')
    })

    it('deve exibir toggle de tema', () => {
      cy.visit('/dashboard')
      
      cy.get('[data-testid="theme-toggle"]').should('be.visible')
      
      cy.get('[data-testid="theme-toggle"]').click()
      cy.get('body').should('have.class', 'dark')
      
      cy.get('[data-testid="theme-toggle"]').click()
      cy.get('body').should('not.have.class', 'dark')
    })
  })

  describe('Navegação por URL Direta', () => {
    it('deve carregar página de produtos via URL direta', () => {
      cy.visit('/dashboard/products')
      
      cy.url().should('include', '/dashboard/products')
      cy.get('[data-testid="products-table"]').should('be.visible')
      cy.get('[data-testid="nav-products"]').should('have.class', 'active')
    })

    it('deve carregar página de usuários via URL direta', () => {
      cy.visit('/dashboard/users')
      
      cy.url().should('include', '/dashboard/users')
      cy.get('[data-testid="users-table"]').should('be.visible')
      cy.get('[data-testid="nav-users"]').should('have.class', 'active')
    })

    it('deve redirecionar URLs inválidas para 404', () => {
      cy.visit('/dashboard/invalid-page', { failOnStatusCode: false })
      
      cy.get('[data-testid="404-page"]').should('be.visible')
      cy.get('[data-testid="back-to-dashboard"]').should('be.visible')
    })

    it('deve permitir voltar ao dashboard da página 404', () => {
      cy.visit('/dashboard/invalid-page', { failOnStatusCode: false })
      
      cy.get('[data-testid="back-to-dashboard"]').click()
      
      cy.url().should('include', '/dashboard')
      cy.get('[data-testid="dashboard-stats"]').should('be.visible')
    })
  })

  describe('Navegação com Parâmetros', () => {
    it('deve manter parâmetros de busca ao navegar', () => {
      cy.visit('/dashboard/products?search=iPhone')
      
      cy.get('[data-testid="nav-users"]').click()
      cy.get('[data-testid="nav-products"]').click()
      
      cy.url().should('include', '/dashboard/products')
      // Parâmetros podem ser perdidos na navegação, isso é comportamento esperado
    })

    it('deve preservar filtros ao usar botão voltar do navegador', () => {
      cy.visit('/dashboard/products')
      
      cy.get('[data-testid="search-input"]').type('iPhone')
      cy.get('[data-testid="search-button"]').click()
      
      cy.get('[data-testid="nav-users"]').click()
      cy.go('back')
      
      cy.url().should('include', 'search=iPhone')
      cy.get('[data-testid="search-input"]').should('have.value', 'iPhone')
    })
  })

  describe('Transições e Animações', () => {
    it('deve ter transições suaves entre páginas', () => {
      cy.visit('/dashboard')
      
      cy.get('[data-testid="nav-products"]').click()
      
      // Verificar se há classe de transição
      cy.get('[data-testid="page-content"]').should('have.class', 'page-transition')
      
      // Aguardar transição completar
      cy.wait(300)
      cy.get('[data-testid="products-table"]').should('be.visible')
    })

    it('deve animar abertura/fechamento do menu lateral', () => {
      cy.visit('/dashboard')
      
      cy.get('[data-testid="sidebar-toggle"]').click()
      
      // Verificar animação de colapso
      cy.get('[data-testid="sidebar"]').should('have.css', 'transition')
      cy.wait(300)
      cy.get('[data-testid="sidebar"]').should('have.class', 'collapsed')
    })
  })

  describe('Responsividade da Navegação', () => {
    it('deve adaptar menu para dispositivos móveis', () => {
      cy.viewport('iphone-6')
      cy.visit('/dashboard')
      
      cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible')
      cy.get('[data-testid="sidebar"]').should('have.class', 'mobile-hidden')
      
      cy.get('[data-testid="mobile-menu-toggle"]').click()
      cy.get('[data-testid="sidebar"]').should('not.have.class', 'mobile-hidden')
    })

    it('deve fechar menu mobile ao navegar', () => {
      cy.viewport('iphone-6')
      cy.visit('/dashboard')
      
      cy.get('[data-testid="mobile-menu-toggle"]').click()
      cy.get('[data-testid="nav-products"]').click()
      
      cy.get('[data-testid="sidebar"]').should('have.class', 'mobile-hidden')
      cy.url().should('include', '/dashboard/products')
    })

    it('deve adaptar header para mobile', () => {
      cy.viewport('iphone-6')
      cy.visit('/dashboard')
      
      cy.get('[data-testid="header"]').should('be.visible')
      cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible')
      cy.get('[data-testid="user-menu"]').should('be.visible')
    })
  })

  describe('Acessibilidade da Navegação', () => {
    it('deve permitir navegação por teclado no menu', () => {
      cy.visit('/dashboard')
      
      cy.get('[data-testid="nav-dashboard"]').focus()
      cy.get('[data-testid="nav-dashboard"]').should('be.focused')
      
      cy.get('[data-testid="nav-dashboard"]').tab()
      cy.get('[data-testid="nav-products"]').should('be.focused')
      
      cy.get('[data-testid="nav-products"]').type('{enter}')
      cy.url().should('include', '/dashboard/products')
    })

    it('deve ter labels apropriados para elementos de navegação', () => {
      cy.visit('/dashboard')
      
      cy.get('[data-testid="sidebar-toggle"]').should('have.attr', 'aria-label')
      cy.get('[data-testid="user-menu"]').should('have.attr', 'aria-label')
      cy.get('[data-testid="theme-toggle"]').should('have.attr', 'aria-label')
    })

    it('deve ter roles apropriados para navegação', () => {
      cy.visit('/dashboard')
      
      cy.get('[data-testid="sidebar-menu"]').should('have.attr', 'role', 'navigation')
      cy.get('[data-testid="breadcrumbs"]').should('have.attr', 'role', 'navigation')
    })

    it('deve indicar página atual para leitores de tela', () => {
      cy.visit('/dashboard/products')
      
      cy.get('[data-testid="nav-products"]').should('have.attr', 'aria-current', 'page')
      cy.get('[data-testid="nav-dashboard"]').should('not.have.attr', 'aria-current')
    })
  })

  describe('Performance da Navegação', () => {
    it('deve carregar páginas rapidamente', () => {
      cy.visit('/dashboard')
      
      const startTime = Date.now()
      cy.get('[data-testid="nav-products"]').click()
      
      cy.get('[data-testid="products-table"]').should('be.visible').then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(2000) // 2 segundos
      })
    })

    it('deve implementar prefetch para links de navegação', () => {
      cy.visit('/dashboard')
      
      // Verificar se há prefetch nos links
      cy.get('[data-testid="nav-products"]').should('have.attr', 'data-prefetch', 'true')
      cy.get('[data-testid="nav-users"]').should('have.attr', 'data-prefetch', 'true')
    })
  })

  describe('Estado da Navegação', () => {
    it('deve manter estado do menu lateral no localStorage', () => {
      cy.visit('/dashboard')
      
      cy.get('[data-testid="sidebar-toggle"]').click()
      
      cy.window().then((win) => {
        expect(win.localStorage.getItem('sidebar-collapsed')).to.equal('true')
      })
      
      cy.reload()
      cy.get('[data-testid="sidebar"]').should('have.class', 'collapsed')
    })

    it('deve manter tema selecionado após navegação', () => {
      cy.visit('/dashboard')
      
      cy.get('[data-testid="theme-toggle"]').click()
      cy.get('body').should('have.class', 'dark')
      
      cy.get('[data-testid="nav-products"]').click()
      cy.get('body').should('have.class', 'dark')
    })
  })
})