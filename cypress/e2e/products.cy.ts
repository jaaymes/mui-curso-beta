describe("Products Page", () => {
  beforeEach(() => {
    // Fazer login antes de cada teste
    cy.login();
    cy.visit("/dashboard/products");
  });

  describe("Carregamento da Página", () => {
    it("deve carregar a página de produtos com sucesso", () => {
      cy.url().should("include", "/dashboard/products");
      cy.get('[data-testid="page-title"]').should("contain", "Products");
      cy.get('[data-testid="products-stats"]').should("be.visible");
      cy.get('[data-testid="products-filters"]').should("be.visible");
      cy.get('[data-testid="products-table"]').should("be.visible");
    });

    it("deve exibir loading state durante carregamento", () => {
      cy.intercept("GET", "**/products**", { delay: 1000 }).as("getProducts");
      cy.visit("/dashboard/products");
      cy.get('[data-testid="loading-skeleton"]').should("be.visible");
      cy.wait("@getProducts");
      cy.get('[data-testid="loading-skeleton"]').should("not.exist");
    });
  });

  describe("Estatísticas de Produtos", () => {
    it("deve exibir cards de estatísticas", () => {
      cy.get('[data-testid="products-stats"]').within(() => {
        cy.get('[data-testid="stat-card"]').should("have.length.at.least", 3);
        cy.get('[data-testid="stat-card"]')
          .first()
          .should("contain.text", "Total Products");
        cy.get('[data-testid="stat-value"]').should("be.visible");
        cy.get('[data-testid="stat-change"]').should("be.visible");
      });
    });

    it("deve exibir valores numéricos nas estatísticas", () => {
      cy.get('[data-testid="stat-value"]').each(($el) => {
        cy.wrap($el).should("not.be.empty");
        cy.wrap($el).invoke("text").should("match", /\d+/);
      });
    });
  });

  describe("Filtros de Produtos", () => {
    it("deve permitir busca por nome do produto", () => {
      const searchTerm = "iPhone";

      cy.get('[data-testid="search-input"]').type(searchTerm);
      cy.get('[data-testid="search-button"]').click();

      cy.url().should("include", `search=${searchTerm}`);
      cy.get('[data-testid="product-row"]').each(($row) => {
        cy.wrap($row).should("contain.text", searchTerm);
      });
    });

    it("deve permitir filtro por categoria", () => {
      cy.get('[data-testid="category-select"]').click();
      cy.get('[data-testid="category-option"]').first().click();

      cy.url().should("include", "category=");
      cy.get('[data-testid="product-row"]').should("have.length.at.least", 1);
    });

    it('deve limpar filtros ao clicar em "Clear Filters"', () => {
      // Aplicar filtros
      cy.get('[data-testid="search-input"]').type("test");
      cy.get('[data-testid="category-select"]').click();
      cy.get('[data-testid="category-option"]').first().click();

      // Limpar filtros
      cy.get('[data-testid="clear-filters"]').click();

      cy.get('[data-testid="search-input"]').should("have.value", "");
      cy.url().should("not.include", "search=");
      cy.url().should("not.include", "category=");
    });

    it("deve manter filtros na URL ao recarregar página", () => {
      const searchTerm = "laptop";

      cy.get('[data-testid="search-input"]').type(searchTerm);
      cy.get('[data-testid="search-button"]').click();

      cy.reload();

      cy.get('[data-testid="search-input"]').should("have.value", searchTerm);
      cy.url().should("include", `search=${searchTerm}`);
    });
  });

  describe("Tabela de Produtos", () => {
    it("deve exibir colunas da tabela corretamente", () => {
      cy.get('[data-testid="products-table"]').within(() => {
        cy.get("thead th").should("contain", "Name");
        cy.get("thead th").should("contain", "Category");
        cy.get("thead th").should("contain", "Price");
        cy.get("thead th").should("contain", "Stock");
        cy.get("thead th").should("contain", "Actions");
      });
    });

    it("deve exibir dados dos produtos", () => {
      cy.get('[data-testid="product-row"]').should("have.length.at.least", 1);

      cy.get('[data-testid="product-row"]')
        .first()
        .within(() => {
          cy.get('[data-testid="product-name"]').should("not.be.empty");
          cy.get('[data-testid="product-category"]').should("not.be.empty");
          cy.get('[data-testid="product-price"]').should("not.be.empty");
          cy.get('[data-testid="product-stock"]').should("not.be.empty");
          cy.get('[data-testid="product-actions"]').should("be.visible");
        });
    });

    it("deve permitir ordenação por colunas", () => {
      cy.get('[data-testid="sort-name"]').click();
      cy.url().should("include", "sortBy=name");

      cy.get('[data-testid="sort-price"]').click();
      cy.url().should("include", "sortBy=price");
    });

    it("deve exibir ações para cada produto", () => {
      cy.get('[data-testid="product-row"]')
        .first()
        .within(() => {
          cy.get('[data-testid="view-product"]').should("be.visible");
          cy.get('[data-testid="edit-product"]').should("be.visible");
          cy.get('[data-testid="delete-product"]').should("be.visible");
        });
    });
  });

  describe("Paginação", () => {
    it("deve exibir controles de paginação", () => {
      cy.get('[data-testid="pagination"]').should("be.visible");
      cy.get('[data-testid="page-info"]').should("be.visible");
      cy.get('[data-testid="items-per-page"]').should("be.visible");
    });

    it("deve navegar entre páginas", () => {
      cy.get('[data-testid="next-page"]').click();
      cy.url().should("include", "page=2");

      cy.get('[data-testid="prev-page"]').click();
      cy.url().should("include", "page=1");
    });

    it("deve alterar número de itens por página", () => {
      cy.get('[data-testid="items-per-page"]').select("20");
      cy.url().should("include", "limit=20");

      cy.get('[data-testid="product-row"]').should("have.length.at.most", 20);
    });
  });

  describe("Estados de Erro", () => {
    it("deve exibir mensagem quando não há produtos", () => {
      cy.intercept("GET", "**/products**", {
        body: { products: [], total: 0 },
      }).as("getEmptyProducts");
      cy.visit("/dashboard/products");
      cy.wait("@getEmptyProducts");

      cy.get('[data-testid="empty-state"]').should("be.visible");
      cy.get('[data-testid="empty-state"]').should(
        "contain",
        "No products found"
      );
    });

    it("deve exibir erro quando falha ao carregar produtos", () => {
      cy.intercept("GET", "**/products**", { statusCode: 500 }).as(
        "getProductsError"
      );
      cy.visit("/dashboard/products");
      cy.wait("@getProductsError");

      cy.get('[data-testid="error-state"]').should("be.visible");
      cy.get('[data-testid="retry-button"]').should("be.visible");
    });

    it("deve permitir retry após erro", () => {
      cy.intercept("GET", "**/products**", { statusCode: 500 }).as(
        "getProductsError"
      );
      cy.visit("/dashboard/products");
      cy.wait("@getProductsError");

      cy.intercept("GET", "**/products**", { fixture: "products.json" }).as(
        "getProductsSuccess"
      );
      cy.get('[data-testid="retry-button"]').click();
      cy.wait("@getProductsSuccess");

      cy.get('[data-testid="products-table"]').should("be.visible");
    });
  });

  describe("Responsividade", () => {
    it("deve ser responsivo em dispositivos móveis", () => {
      cy.viewport("iphone-6");

      cy.get('[data-testid="products-stats"]').should("be.visible");
      cy.get('[data-testid="mobile-filters"]').should("be.visible");
      cy.get('[data-testid="products-table"]').should("be.visible");

      // Verificar se tabela é scrollável horizontalmente
      cy.get('[data-testid="table-container"]').should(
        "have.css",
        "overflow-x",
        "auto"
      );
    });

    it("deve adaptar filtros para mobile", () => {
      cy.viewport("iphone-6");

      cy.get('[data-testid="mobile-filter-toggle"]').click();
      cy.get('[data-testid="mobile-filters-drawer"]').should("be.visible");

      cy.get('[data-testid="search-input"]').should("be.visible");
      cy.get('[data-testid="category-select"]').should("be.visible");
    });
  });

  describe("Performance", () => {
    it("deve carregar página em tempo razoável", () => {
      const startTime = Date.now();

      cy.visit("/dashboard/products").then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000); // 3 segundos
      });
    });

    it("deve implementar lazy loading para imagens", () => {
      cy.get('[data-testid="product-image"]').should(
        "have.attr",
        "loading",
        "lazy"
      );
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter labels apropriados nos campos de filtro", () => {
      cy.get('[data-testid="search-input"]').should("have.attr", "aria-label");
      cy.get('[data-testid="category-select"]').should(
        "have.attr",
        "aria-label"
      );
    });

    it("deve permitir navegação por teclado", () => {
      cy.get('[data-testid="search-input"]').focus();
      cy.get('[data-testid="search-input"]').should("be.focused");

      cy.get('[data-testid="search-input"]').tab();
      cy.get('[data-testid="category-select"]').should("be.focused");
    });

    it("deve ter contraste adequado nos elementos", () => {
      cy.get('[data-testid="products-table"]').should("be.visible");
      // Verificar se elementos têm contraste adequado (pode ser implementado com plugin de acessibilidade)
    });
  });

  describe("Integração com API", () => {
    it("deve fazer chamadas corretas para API", () => {
      cy.intercept("GET", "**/products**").as("getProducts");
      cy.visit("/dashboard/products");

      cy.wait("@getProducts").then((interception) => {
        expect(interception.request.url).to.include("/products");
        expect(interception.response.statusCode).to.equal(200);
      });
    });

    it("deve incluir parâmetros de filtro na requisição", () => {
      cy.intercept("GET", "**/products**").as("getFilteredProducts");

      cy.get('[data-testid="search-input"]').type("iPhone");
      cy.get('[data-testid="search-button"]').click();

      cy.wait("@getFilteredProducts").then((interception) => {
        expect(interception.request.url).to.include("search=iPhone");
      });
    });
  });
});
