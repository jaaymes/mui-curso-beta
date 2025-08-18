describe('Users Page', () => {
  beforeEach(() => {
    // Fazer login antes de cada teste
    cy.login()
    cy.visit('/dashboard/users')
  })

  describe('Carregamento da Página', () => {
    it('deve carregar a página de usuários com sucesso', () => {
      cy.url().should('include', '/dashboard/users')
      cy.get('[data-testid="page-title"]').should('contain', 'Users')
      cy.get('[data-testid="users-stats"]').should('be.visible')
      cy.get('[data-testid="users-filters"]').should('be.visible')
      cy.get('[data-testid="users-table"]').should('be.visible')
    })

    it('deve exibir loading state durante carregamento', () => {
      cy.intercept('GET', '**/users**', { delay: 1000 }).as('getUsers')
      cy.visit('/dashboard/users')
      cy.get('[data-testid="loading-skeleton"]').should('be.visible')
      cy.wait('@getUsers')
      cy.get('[data-testid="loading-skeleton"]').should('not.exist')
    })
  })

  describe('Estatísticas de Usuários', () => {
    it('deve exibir cards de estatísticas', () => {
      cy.get('[data-testid="users-stats"]').within(() => {
        cy.get('[data-testid="stat-card"]').should('have.length.at.least', 3)
        cy.get('[data-testid="stat-card"]').first().should('contain.text', 'Total Users')
        cy.get('[data-testid="stat-value"]').should('be.visible')
        cy.get('[data-testid="stat-change"]').should('be.visible')
      })
    })

    it('deve exibir valores numéricos nas estatísticas', () => {
      cy.get('[data-testid="stat-value"]').each(($el) => {
        cy.wrap($el).should('not.be.empty')
        cy.wrap($el).invoke('text').should('match', /\d+/)
      })
    })

    it('deve exibir diferentes tipos de estatísticas', () => {
      cy.get('[data-testid="users-stats"]').within(() => {
        cy.get('[data-testid="stat-card"]').should('contain.text', 'Active Users')
        cy.get('[data-testid="stat-card"]').should('contain.text', 'New Users')
        cy.get('[data-testid="stat-card"]').should('contain.text', 'Total Users')
      })
    })
  })

  describe('Filtros de Usuários', () => {
    it('deve permitir busca por nome do usuário', () => {
      const searchTerm = 'John'
      
      cy.get('[data-testid="search-input"]').type(searchTerm)
      cy.get('[data-testid="search-button"]').click()
      
      cy.url().should('include', `search=${searchTerm}`)
      cy.get('[data-testid="user-row"]').each(($row) => {
        cy.wrap($row).should('contain.text', searchTerm)
      })
    })

    it('deve permitir filtro por gênero', () => {
      cy.get('[data-testid="gender-select"]').click()
      cy.get('[data-testid="gender-option"]').first().click()
      
      cy.url().should('include', 'gender=')
      cy.get('[data-testid="user-row"]').should('have.length.at.least', 1)
    })

    it('deve permitir filtro por idade', () => {
      cy.get('[data-testid="age-filter"]').within(() => {
        cy.get('[data-testid="min-age"]').type('25')
        cy.get('[data-testid="max-age"]').type('35')
        cy.get('[data-testid="apply-age-filter"]').click()
      })
      
      cy.url().should('include', 'minAge=25')
      cy.url().should('include', 'maxAge=35')
    })

    it('deve limpar filtros ao clicar em "Clear Filters"', () => {
      // Aplicar filtros
      cy.get('[data-testid="search-input"]').type('test')
      cy.get('[data-testid="gender-select"]').click()
      cy.get('[data-testid="gender-option"]').first().click()
      
      // Limpar filtros
      cy.get('[data-testid="clear-filters"]').click()
      
      cy.get('[data-testid="search-input"]').should('have.value', '')
      cy.url().should('not.include', 'search=')
      cy.url().should('not.include', 'gender=')
    })

    it('deve manter filtros na URL ao recarregar página', () => {
      const searchTerm = 'Emily'
      
      cy.get('[data-testid="search-input"]').type(searchTerm)
      cy.get('[data-testid="search-button"]').click()
      
      cy.reload()
      
      cy.get('[data-testid="search-input"]').should('have.value', searchTerm)
      cy.url().should('include', `search=${searchTerm}`)
    })
  })

  describe('Tabela de Usuários', () => {
    it('deve exibir colunas da tabela corretamente', () => {
      cy.get('[data-testid="users-table"]').within(() => {
        cy.get('thead th').should('contain', 'Name')
        cy.get('thead th').should('contain', 'Email')
        cy.get('thead th').should('contain', 'Age')
        cy.get('thead th').should('contain', 'Gender')
        cy.get('thead th').should('contain', 'Phone')
        cy.get('thead th').should('contain', 'Actions')
      })
    })

    it('deve exibir dados dos usuários', () => {
      cy.get('[data-testid="user-row"]').should('have.length.at.least', 1)
      
      cy.get('[data-testid="user-row"]').first().within(() => {
        cy.get('[data-testid="user-name"]').should('not.be.empty')
        cy.get('[data-testid="user-email"]').should('not.be.empty')
        cy.get('[data-testid="user-age"]').should('not.be.empty')
        cy.get('[data-testid="user-gender"]').should('not.be.empty')
        cy.get('[data-testid="user-phone"]').should('not.be.empty')
        cy.get('[data-testid="user-actions"]').should('be.visible')
      })
    })

    it('deve exibir avatar dos usuários', () => {
      cy.get('[data-testid="user-row"]').first().within(() => {
        cy.get('[data-testid="user-avatar"]').should('be.visible')
        cy.get('[data-testid="user-avatar"]').should('have.attr', 'src')
      })
    })

    it('deve permitir ordenação por colunas', () => {
      cy.get('[data-testid="sort-name"]').click()
      cy.url().should('include', 'sortBy=firstName')
      
      cy.get('[data-testid="sort-age"]').click()
      cy.url().should('include', 'sortBy=age')
      
      cy.get('[data-testid="sort-email"]').click()
      cy.url().should('include', 'sortBy=email')
    })

    it('deve exibir ações para cada usuário', () => {
      cy.get('[data-testid="user-row"]').first().within(() => {
        cy.get('[data-testid="view-user"]').should('be.visible')
        cy.get('[data-testid="edit-user"]').should('be.visible')
        cy.get('[data-testid="delete-user"]').should('be.visible')
      })
    })

    it('deve exibir status do usuário (ativo/inativo)', () => {
      cy.get('[data-testid="user-row"]').first().within(() => {
        cy.get('[data-testid="user-status"]').should('be.visible')
        cy.get('[data-testid="user-status"]').should('contain.text', /Active|Inactive/)
      })
    })
  })

  describe('Paginação', () => {
    it('deve exibir controles de paginação', () => {
      cy.get('[data-testid="pagination"]').should('be.visible')
      cy.get('[data-testid="page-info"]').should('be.visible')
      cy.get('[data-testid="items-per-page"]').should('be.visible')
    })

    it('deve navegar entre páginas', () => {
      cy.get('[data-testid="next-page"]').click()
      cy.url().should('include', 'page=2')
      
      cy.get('[data-testid="prev-page"]').click()
      cy.url().should('include', 'page=1')
    })

    it('deve alterar número de itens por página', () => {
      cy.get('[data-testid="items-per-page"]').select('20')
      cy.url().should('include', 'limit=20')
      
      cy.get('[data-testid="user-row"]').should('have.length.at.most', 20)
    })

    it('deve exibir informações de paginação corretas', () => {
      cy.get('[data-testid="page-info"]').should('contain', 'Showing')
      cy.get('[data-testid="page-info"]').should('contain', 'of')
      cy.get('[data-testid="page-info"]').should('contain', 'users')
    })
  })

  describe('Detalhes do Usuário', () => {
    it('deve abrir modal de detalhes ao clicar em "View"', () => {
      cy.get('[data-testid="view-user"]').first().click()
      
      cy.get('[data-testid="user-details-modal"]').should('be.visible')
      cy.get('[data-testid="user-details-name"]').should('not.be.empty')
      cy.get('[data-testid="user-details-email"]').should('not.be.empty')
      cy.get('[data-testid="user-details-phone"]').should('not.be.empty')
    })

    it('deve fechar modal ao clicar no botão fechar', () => {
      cy.get('[data-testid="view-user"]').first().click()
      cy.get('[data-testid="user-details-modal"]').should('be.visible')
      
      cy.get('[data-testid="close-modal"]').click()
      cy.get('[data-testid="user-details-modal"]').should('not.exist')
    })

    it('deve fechar modal ao clicar fora dele', () => {
      cy.get('[data-testid="view-user"]').first().click()
      cy.get('[data-testid="user-details-modal"]').should('be.visible')
      
      cy.get('[data-testid="modal-backdrop"]').click({ force: true })
      cy.get('[data-testid="user-details-modal"]').should('not.exist')
    })
  })

  describe('Estados de Erro', () => {
    it('deve exibir mensagem quando não há usuários', () => {
      cy.intercept('GET', '**/users**', { body: { users: [], total: 0 } }).as('getEmptyUsers')
      cy.visit('/dashboard/users')
      cy.wait('@getEmptyUsers')
      
      cy.get('[data-testid="empty-state"]').should('be.visible')
      cy.get('[data-testid="empty-state"]').should('contain', 'No users found')
    })

    it('deve exibir erro quando falha ao carregar usuários', () => {
      cy.intercept('GET', '**/users**', { statusCode: 500 }).as('getUsersError')
      cy.visit('/dashboard/users')
      cy.wait('@getUsersError')
      
      cy.get('[data-testid="error-state"]').should('be.visible')
      cy.get('[data-testid="retry-button"]').should('be.visible')
    })

    it('deve permitir retry após erro', () => {
      cy.intercept('GET', '**/users**', { statusCode: 500 }).as('getUsersError')
      cy.visit('/dashboard/users')
      cy.wait('@getUsersError')
      
      cy.intercept('GET', '**/users**', { fixture: 'users.json' }).as('getUsersSuccess')
      cy.get('[data-testid="retry-button"]').click()
      cy.wait('@getUsersSuccess')
      
      cy.get('[data-testid="users-table"]').should('be.visible')
    })

    it('deve exibir fallback para avatares quebrados', () => {
      cy.get('[data-testid="user-avatar"]').first().then(($img) => {
        // Simular erro de carregamento da imagem
        $img[0].onerror()
        cy.wrap($img).should('have.attr', 'src').and('include', 'fallback')
      })
    })
  })

  describe('Responsividade', () => {
    it('deve ser responsivo em dispositivos móveis', () => {
      cy.viewport('iphone-6')
      
      cy.get('[data-testid="users-stats"]').should('be.visible')
      cy.get('[data-testid="mobile-filters"]').should('be.visible')
      cy.get('[data-testid="users-table"]').should('be.visible')
      
      // Verificar se tabela é scrollável horizontalmente
      cy.get('[data-testid="table-container"]').should('have.css', 'overflow-x', 'auto')
    })

    it('deve adaptar filtros para mobile', () => {
      cy.viewport('iphone-6')
      
      cy.get('[data-testid="mobile-filter-toggle"]').click()
      cy.get('[data-testid="mobile-filters-drawer"]').should('be.visible')
      
      cy.get('[data-testid="search-input"]').should('be.visible')
      cy.get('[data-testid="gender-select"]').should('be.visible')
    })

    it('deve adaptar cards de estatísticas para mobile', () => {
      cy.viewport('iphone-6')
      
      cy.get('[data-testid="users-stats"]').within(() => {
        cy.get('[data-testid="stat-card"]').should('be.visible')
        // Cards devem empilhar verticalmente em mobile
        cy.get('[data-testid="stat-card"]').should('have.css', 'width').and('match', /100%|auto/)
      })
    })
  })

  describe('Performance', () => {
    it('deve carregar página em tempo razoável', () => {
      const startTime = Date.now()
      
      cy.visit('/dashboard/users').then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(3000) // 3 segundos
      })
    })

    it('deve implementar lazy loading para avatares', () => {
      cy.get('[data-testid="user-avatar"]').should('have.attr', 'loading', 'lazy')
    })

    it('deve implementar virtualização para listas grandes', () => {
      // Verificar se apenas itens visíveis estão renderizados
      cy.get('[data-testid="user-row"]').should('have.length.at.most', 50)
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter labels apropriados nos campos de filtro', () => {
      cy.get('[data-testid="search-input"]').should('have.attr', 'aria-label')
      cy.get('[data-testid="gender-select"]').should('have.attr', 'aria-label')
    })

    it('deve permitir navegação por teclado', () => {
      cy.get('[data-testid="search-input"]').focus()
      cy.get('[data-testid="search-input"]').should('be.focused')
      
      cy.get('[data-testid="search-input"]').tab()
      cy.get('[data-testid="gender-select"]').should('be.focused')
    })

    it('deve ter alt text apropriado para avatares', () => {
      cy.get('[data-testid="user-avatar"]').should('have.attr', 'alt')
      cy.get('[data-testid="user-avatar"]').first().should('have.attr', 'alt').and('not.be.empty')
    })

    it('deve ter roles apropriados para elementos interativos', () => {
      cy.get('[data-testid="view-user"]').should('have.attr', 'role', 'button')
      cy.get('[data-testid="edit-user"]').should('have.attr', 'role', 'button')
      cy.get('[data-testid="delete-user"]').should('have.attr', 'role', 'button')
    })
  })

  describe('Integração com API', () => {
    it('deve fazer chamadas corretas para API', () => {
      cy.intercept('GET', '**/users**').as('getUsers')
      cy.visit('/dashboard/users')
      
      cy.wait('@getUsers').then((interception) => {
        expect(interception.request.url).to.include('/users')
        expect(interception.response.statusCode).to.equal(200)
      })
    })

    it('deve incluir parâmetros de filtro na requisição', () => {
      cy.intercept('GET', '**/users**').as('getFilteredUsers')
      
      cy.get('[data-testid="search-input"]').type('Emily')
      cy.get('[data-testid="search-button"]').click()
      
      cy.wait('@getFilteredUsers').then((interception) => {
        expect(interception.request.url).to.include('search=Emily')
      })
    })

    it('deve incluir parâmetros de paginação na requisição', () => {
      cy.intercept('GET', '**/users**').as('getPaginatedUsers')
      
      cy.get('[data-testid="next-page"]').click()
      
      cy.wait('@getPaginatedUsers').then((interception) => {
        expect(interception.request.url).to.include('skip=')
        expect(interception.request.url).to.include('limit=')
      })
    })
  })
})