describe("Dashboard", () => {
  beforeEach(() => {
    // Fazer login antes de cada teste
    cy.login();
  });

  describe("Carregamento da Página", () => {
    it("deve carregar a página dashboard com sucesso", () => {
      cy.visit("/dashboard");

      // Verificar URL
      cy.url().should("include", "/dashboard");

      // Verificar título da página
      cy.get("h1").should("contain", "Dashboard");

      // Verificar que a página carregou completamente
      cy.get('[data-testid="dashboard-content"]').should("be.visible");
    });

    it("deve exibir loading state durante carregamento", () => {
      // Interceptar requisições para simular loading
      cy.intercept("GET", "**/api/dashboard**", { delay: 1000 }).as(
        "getDashboardData"
      );

      cy.visit("/dashboard");

      // Verificar loading state (se existir)
      cy.get('[data-testid="loading-spinner"]').should("be.visible");

      // Aguardar carregamento
      cy.wait("@getDashboardData");

      // Verificar que loading desapareceu
      cy.get('[data-testid="loading-spinner"]').should("not.exist");
    });
  });

  describe("Componentes do Dashboard", () => {
    beforeEach(() => {
      cy.visit("/dashboard");
    });

    it("deve exibir cards de estatísticas", () => {
      // Verificar se os cards de stats estão visíveis
      cy.get('[data-testid="stats-card"]').should("have.length.at.least", 1);

      // Verificar conteúdo dos cards
      cy.get('[data-testid="stats-card"]').each(($card) => {
        cy.wrap($card).should("be.visible");
        cy.wrap($card).find('[data-testid="stat-value"]').should("be.visible");
        cy.wrap($card).find('[data-testid="stat-label"]').should("be.visible");
      });
    });

    it("deve exibir gráfico de vendas", () => {
      // Verificar se o componente de gráfico está presente
      cy.get('[data-testid="sales-chart"]').should("be.visible");

      // Verificar título do gráfico
      cy.get('[data-testid="sales-chart"]').within(() => {
        cy.contains("Sales Overview").should("be.visible");
      });

      // Verificar se o gráfico renderizou (procurar por elementos SVG)
      cy.get('[data-testid="sales-chart"] svg').should("exist");
    });

    it("deve exibir atividades recentes", () => {
      // Verificar componente de atividades recentes
      cy.get('[data-testid="recent-activities"]').should("be.visible");

      // Verificar título
      cy.get('[data-testid="recent-activities"]').within(() => {
        cy.contains("Recent Activities").should("be.visible");
      });

      // Verificar lista de atividades
      cy.get('[data-testid="activity-item"]').should("have.length.at.least", 1);
    });

    it("deve exibir estatísticas rápidas", () => {
      // Verificar componente de quick stats
      cy.get('[data-testid="quick-stats"]').should("be.visible");

      // Verificar métricas
      cy.get('[data-testid="quick-stat-item"]').should(
        "have.length.at.least",
        1
      );

      cy.get('[data-testid="quick-stat-item"]').each(($item) => {
        cy.wrap($item).should("be.visible");
        cy.wrap($item)
          .find('[data-testid="metric-value"]')
          .should("be.visible");
        cy.wrap($item)
          .find('[data-testid="metric-label"]')
          .should("be.visible");
      });
    });
  });

  describe("Interações", () => {
    beforeEach(() => {
      cy.visit("/dashboard");
    });

    it("deve permitir alternar tema escuro", () => {
      // Procurar botão de tema
      cy.get('[data-testid="theme-toggle"]').then(($btn) => {
        if ($btn.length > 0) {
          // Verificar tema atual
          cy.get("html").then(($html) => {
            const currentTheme =
              $html.attr("class") || $html.attr("data-theme");

            // Clicar no botão de tema
            cy.get('[data-testid="theme-toggle"]').click();

            // Verificar mudança de tema
            cy.get("html").should("not.have.class", currentTheme);
          });
        }
      });
    });

    it("deve permitir navegação através dos cards", () => {
      // Verificar se cards são clicáveis
      cy.get('[data-testid="stats-card"]')
        .first()
        .then(($card) => {
          if ($card.find("a").length > 0 || $card.is("a")) {
            cy.wrap($card).click();
            // Verificar se houve navegação ou ação
            cy.url().should(
              "not.equal",
              Cypress.config().baseUrl + "/dashboard"
            );
          }
        });
    });

    it("deve permitir interação com gráfico", () => {
      // Verificar tooltips ou interações no gráfico
      cy.get('[data-testid="sales-chart"] svg').then(($svg) => {
        if ($svg.length > 0) {
          // Tentar hover em elementos do gráfico
          cy.wrap($svg).find("path, rect, circle").first().trigger("mouseover");

          // Verificar se tooltip aparece
          cy.get('[data-testid="chart-tooltip"]').should("be.visible");
        }
      });
    });

    it("deve permitir refresh de dados", () => {
      // Procurar botão de refresh
      cy.get('[data-testid="refresh-button"]').then(($btn) => {
        if ($btn.length > 0) {
          // Interceptar requisição de refresh
          cy.intercept("GET", "**/api/dashboard**").as("refreshData");

          cy.wrap($btn).click();

          // Verificar que dados foram recarregados
          cy.wait("@refreshData");
        }
      });
    });
  });

  describe("Navegação", () => {
    beforeEach(() => {
      cy.visit("/dashboard");
    });

    it("deve navegar para produtos", () => {
      // Procurar link para produtos
      cy.get('[data-testid="nav-products"]').click();
      cy.url().should("include", "/products");
    });

    it("deve navegar para usuários", () => {
      // Procurar link para usuários
      cy.get('[data-testid="nav-users"]').click();
      cy.url().should("include", "/users");
    });

    it("deve manter navegação ativa no dashboard", () => {
      // Verificar se item de navegação do dashboard está ativo
      cy.get('[data-testid="nav-dashboard"]').should("have.class", "active");
    });
  });

  describe("Responsividade", () => {
    it("deve funcionar em dispositivos móveis", () => {
      cy.viewport("iphone-6");
      cy.visit("/dashboard");

      // Verificar que componentes são visíveis em mobile
      cy.get('[data-testid="stats-card"]').should("be.visible");
      cy.get('[data-testid="sales-chart"]').should("be.visible");

      // Verificar layout responsivo
      cy.get('[data-testid="dashboard-grid"]').should(
        "have.css",
        "display",
        "grid"
      );
    });

    it("deve funcionar em tablets", () => {
      cy.viewport("ipad-2");
      cy.visit("/dashboard");

      // Verificar layout em tablet
      cy.get('[data-testid="stats-card"]').should("be.visible");
      cy.get('[data-testid="sales-chart"]').should("be.visible");
      cy.get('[data-testid="recent-activities"]').should("be.visible");
    });

    it("deve ajustar gráficos para telas menores", () => {
      cy.viewport("iphone-6");
      cy.visit("/dashboard");

      // Verificar se gráfico se ajusta ao tamanho da tela
      cy.get('[data-testid="sales-chart"] svg').should("be.visible");
      cy.get('[data-testid="sales-chart"] svg').should(($svg) => {
        const width = $svg.attr("width") || $svg.width();
        expect(parseInt(width.toString())).to.be.lessThan(400);
      });
    });
  });

  describe("Performance", () => {
    it("deve carregar dados em tempo hábil", () => {
      const startTime = Date.now();

      cy.visit("/dashboard");

      // Aguardar carregamento completo
      cy.get('[data-testid="dashboard-content"]').should("be.visible");

      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(5000); // Menos de 5 segundos
      });
    });

    it("deve otimizar renderização de gráficos", () => {
      cy.visit("/dashboard");

      // Verificar que gráficos renderizam sem travamentos
      cy.get('[data-testid="sales-chart"] svg').should("be.visible");

      // Verificar animações suaves (se existirem)
      cy.get('[data-testid="sales-chart"]').should("not.have.class", "loading");
    });
  });

  describe("Estados de Erro", () => {
    it("deve lidar com erro de carregamento de dados", () => {
      // Simular erro na API
      cy.intercept("GET", "**/api/dashboard**", { statusCode: 500 }).as(
        "getDashboardError"
      );

      cy.visit("/dashboard");

      cy.wait("@getDashboardError");

      // Verificar mensagem de erro
      cy.get('[data-testid="error-message"]').should("be.visible");
      cy.get('[data-testid="error-message"]').should(
        "contain",
        "Error loading dashboard data"
      );
    });

    it("deve permitir retry após erro", () => {
      // Simular erro seguido de sucesso
      cy.intercept("GET", "**/api/dashboard**", { statusCode: 500 }).as(
        "getDashboardError"
      );

      cy.visit("/dashboard");
      cy.wait("@getDashboardError");

      // Interceptar retry com sucesso
      cy.intercept("GET", "**/api/dashboard**", {
        fixture: "dashboard-data.json",
      }).as("getDashboardSuccess");

      // Clicar em retry
      cy.get('[data-testid="retry-button"]').click();

      cy.wait("@getDashboardSuccess");

      // Verificar que dados carregaram
      cy.get('[data-testid="dashboard-content"]').should("be.visible");
    });
  });

  describe("Acessibilidade", () => {
    beforeEach(() => {
      cy.visit("/dashboard");
    });

    it("deve ter estrutura semântica apropriada", () => {
      // Verificar headings hierárquicos
      cy.get("h1").should("exist");
      cy.get("h2, h3").should("exist");

      // Verificar landmarks
      cy.get("main").should("exist");
      cy.get("nav").should("exist");
    });

    it("deve permitir navegação por teclado", () => {
      // Verificar que elementos interativos são focáveis
      cy.get('[data-testid="theme-toggle"]').should("be.focusable");
      cy.get('[data-testid="nav-products"]').should("be.focusable");
      cy.get('[data-testid="nav-users"]').should("be.focusable");
    });

    it("deve ter contraste adequado", () => {
      // Verificar que texto tem contraste suficiente
      cy.get("h1")
        .should("have.css", "color")
        .and("not.equal", "rgba(0, 0, 0, 0)");
      cy.get('[data-testid="stats-card"]').should(
        "have.css",
        "background-color"
      );
    });
  });
});
