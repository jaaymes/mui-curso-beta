/**
 * Testes para o componente ProductsTable
 * Verifica a renderização da tabela de produtos com paginação e ações
 */
import { ProductsTable } from "@/app/(dashboard)/products/components/ProductsTable";
import { DummyProduct } from "@/types";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock do ProductDetailDialog
jest.mock("@/components/ui/ProductDetailDialog", () => {
  return {
    ProductDetailDialog: ({ open, product, onClose }: any) =>
      open ? (
        <div data-testid="product-detail-dialog">
          <div data-testid="dialog-product-name">{product?.title}</div>
          <button data-testid="close-dialog" onClick={onClose}>
            Close
          </button>
        </div>
      ) : null,
  };
});

// Mock dos ícones do Material UI
jest.mock("@mui/icons-material", () => ({
  Visibility: () => (
    <svg data-testid="VisibilityIcon">
      <path />
    </svg>
  ),
}));

// Mock dos componentes Material UI
jest.mock("@mui/material", () => ({
  Box: ({ children, sx }: any) => (
    <div data-testid="box" style={sx}>
      {children}
    </div>
  ),
  Chip: ({ label, color, size, variant }: any) => (
    <span
      data-testid="chip"
      data-color={color}
      data-size={size}
      data-variant={variant}
    >
      {label}
    </span>
  ),
  IconButton: ({ children, onClick }: any) => (
    <button data-testid="icon-button" onClick={onClick}>
      {children}
    </button>
  ),
  Table: ({ children }: any) => <table data-testid="table">{children}</table>,
  TableBody: ({ children }: any) => (
    <tbody data-testid="table-body">{children}</tbody>
  ),
  TableCell: ({ children, align, colSpan, sx }: any) => (
    <td
      data-testid="table-cell"
      data-align={align}
      colSpan={colSpan}
      style={sx}
    >
      {children}
    </td>
  ),
  TableContainer: ({ children }: any) => (
    <div data-testid="table-container">{children}</div>
  ),
  TableHead: ({ children }: any) => (
    <thead data-testid="table-head">{children}</thead>
  ),
  TablePagination: ({
    count,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
  }: any) => (
    <div data-testid="table-pagination">
      <span data-testid="pagination-count">{count}</span>
      <span data-testid="pagination-page">{page}</span>
      <span data-testid="pagination-rows-per-page">{rowsPerPage}</span>
      <button
        data-testid="next-page"
        onClick={() => onPageChange({}, page + 1)}
      >
        Next
      </button>
      <button
        data-testid="prev-page"
        onClick={() => onPageChange({}, page - 1)}
      >
        Prev
      </button>
      <select
        data-testid="rows-per-page-select"
        onChange={(e) =>
          onRowsPerPageChange({ target: { value: e.target.value } })
        }
      >
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="25">25</option>
      </select>
    </div>
  ),
  TableRow: ({ children, hover }: any) => (
    <tr data-testid="table-row" data-hover={hover}>
      {children}
    </tr>
  ),
  Tooltip: ({ children, title }: any) => (
    <div data-testid="tooltip" title={title}>
      {children}
    </div>
  ),
  Typography: ({ children, variant, color, fontWeight }: any) => (
    <span
      data-testid="typography"
      data-variant={variant}
      data-color={color}
      data-font-weight={fontWeight}
    >
      {children}
    </span>
  ),
}));

// Dados de teste
const mockProducts: DummyProduct[] = [
  {
    id: 1,
    title: "iPhone 15",
    description: "Latest iPhone model",
    price: 999.99,
    discountPercentage: 5,
    rating: 4.8,
    stock: 50,
    brand: "Apple",
    category: "smartphones",
    thumbnail: "https://example.com/iphone.jpg",
    images: ["https://example.com/iphone1.jpg"],
    tags: ["phone", "apple"],
    sku: "IPH15-001",
    weight: 0.2,
    dimensions: { width: 7.1, height: 14.7, depth: 0.8 },
    warrantyInformation: "1 year warranty",
    shippingInformation: "Ships in 1-2 business days",
    availabilityStatus: "In Stock",
    reviews: [],
    returnPolicy: "30 days return policy",
    minimumOrderQuantity: 1,
    meta: {
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      barcode: "123456789",
      qrCode: "qr-code-url",
    },
  },
  {
    id: 2,
    title: "Samsung Galaxy S24",
    description: "Premium Android phone",
    price: 899.99,
    discountPercentage: 10,
    rating: 4.6,
    stock: 0,
    brand: "Samsung",
    category: "smartphones",
    thumbnail: "https://example.com/samsung.jpg",
    images: ["https://example.com/samsung1.jpg"],
    tags: ["phone", "samsung"],
    sku: "SGS24-001",
    weight: 0.2,
    dimensions: { width: 7.0, height: 14.6, depth: 0.8 },
    warrantyInformation: "1 year warranty",
    shippingInformation: "Ships in 1-2 business days",
    availabilityStatus: "Out of Stock",
    reviews: [],
    returnPolicy: "30 days return policy",
    minimumOrderQuantity: 1,
    meta: {
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      barcode: "123456790",
      qrCode: "qr-code-url",
    },
  },
  {
    id: 3,
    title: "MacBook Pro",
    description: "Professional laptop",
    price: 1999.99,
    discountPercentage: 0,
    rating: 4.9,
    stock: 5,
    brand: "Apple",
    category: "laptops",
    thumbnail: "https://example.com/macbook.jpg",
    images: ["https://example.com/macbook1.jpg"],
    tags: ["laptop", "apple"],
    sku: "MBP-001",
    weight: 1.4,
    dimensions: { width: 30.4, height: 21.2, depth: 1.6 },
    warrantyInformation: "1 year warranty",
    shippingInformation: "Ships in 1-2 business days",
    availabilityStatus: "Low Stock",
    reviews: [],
    returnPolicy: "30 days return policy",
    minimumOrderQuantity: 1,
    meta: {
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      barcode: "123456791",
      qrCode: "qr-code-url",
    },
  },
];

const manyProducts: DummyProduct[] = Array.from({ length: 25 }, (_, index) => ({
  id: index + 1,
  title: `Product ${index + 1}`,
  description: `Description for product ${index + 1}`,
  price: (index + 1) * 10,
  discountPercentage: 0,
  rating: 4.0,
  stock: index + 1,
  brand: "Test Brand",
  category: "test-category",
  thumbnail: `https://example.com/product${index + 1}.jpg`,
  images: [`https://example.com/product${index + 1}_1.jpg`],
  tags: ["test"],
  sku: `TEST-${String(index + 1).padStart(3, "0")}`,
  weight: 1.0,
  dimensions: { width: 10, height: 10, depth: 10 },
  warrantyInformation: "1 year warranty",
  shippingInformation: "Ships in 1-2 business days",
  availabilityStatus: "In Stock",
  reviews: [],
  returnPolicy: "30 days return policy",
  minimumOrderQuantity: 1,
  meta: {
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    barcode: `12345678${String(index + 1).padStart(2, "0")}`,
    qrCode: "qr-code-url",
  },
}));

describe("ProductsTable", () => {
  describe("Renderização básica", () => {
    it("deve renderizar a estrutura da tabela", () => {
      render(<ProductsTable products={mockProducts} />);

      expect(screen.getByTestId("table-container")).toBeInTheDocument();
      expect(screen.getByTestId("table")).toBeInTheDocument();
      expect(screen.getByTestId("table-head")).toBeInTheDocument();
      expect(screen.getByTestId("table-body")).toBeInTheDocument();
    });

    it("deve renderizar os cabeçalhos da tabela", () => {
      render(<ProductsTable products={mockProducts} />);

      const headers = screen.getAllByTestId("table-cell");
      expect(headers[0]).toHaveTextContent("Produto");
      expect(headers[1]).toHaveTextContent("Categoria");
      expect(headers[2]).toHaveTextContent("Preço");
      expect(headers[3]).toHaveTextContent("Estoque");
      expect(headers[4]).toHaveTextContent("Ações");
    });

    it("deve renderizar as linhas de produtos", () => {
      render(<ProductsTable products={mockProducts} />);

      expect(screen.getByText("iPhone 15")).toBeInTheDocument();
      expect(screen.getByText("Samsung Galaxy S24")).toBeInTheDocument();
      expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
    });
  });

  describe("Formatação de dados", () => {
    it("deve formatar preços corretamente", () => {
      render(<ProductsTable products={mockProducts} />);

      expect(screen.getByText("R$ 999,99")).toBeInTheDocument();
      expect(screen.getByText("R$ 899,99")).toBeInTheDocument();
      expect(screen.getByText("R$ 1.999,99")).toBeInTheDocument();
    });

    it("deve exibir categorias com primeira letra maiúscula", () => {
      render(<ProductsTable products={mockProducts} />);

      const chips = screen.getAllByTestId("chip");
      expect(
        chips.find((chip) => chip.textContent === "Smartphones")
      ).toBeInTheDocument();
      expect(
        chips.find((chip) => chip.textContent === "Laptops")
      ).toBeInTheDocument();
    });

    it("deve exibir status de estoque correto", () => {
      render(<ProductsTable products={mockProducts} />);

      expect(screen.getByText("Em Estoque")).toBeInTheDocument(); // iPhone (50)
      expect(screen.getByText("Fora de Estoque")).toBeInTheDocument(); // Samsung (0)
      expect(screen.getByText("Estoque Baixo")).toBeInTheDocument(); // MacBook (5)
    });

    it("deve aplicar cores corretas aos chips de estoque", () => {
      render(<ProductsTable products={mockProducts} />);

      const stockChips = screen
        .getAllByTestId("chip")
        .filter(
          (chip) =>
            chip.textContent?.includes("Estoque") ||
            chip.textContent?.includes("Fora")
        );

      // Verifica se há chips com cores diferentes
      const colors = stockChips.map((chip) => chip.getAttribute("data-color"));
      expect(colors).toContain("success"); // Em estoque
      expect(colors).toContain("error"); // Fora de estoque
      expect(colors).toContain("warning"); // Estoque baixo
    });
  });

  describe("Estados de loading e erro", () => {
    it("deve exibir estado de carregamento", () => {
      render(<ProductsTable products={[]} isLoading={true} />);

      // Verifica se há pelo menos um texto de carregamento
      expect(screen.getAllByText("Carregando produtos...")).toHaveLength(5);

      // Verifica se não há produtos sendo exibidos durante o carregamento
      expect(
        screen.queryByText("Nenhum produto encontrado")
      ).not.toBeInTheDocument();
    });

    it("deve exibir estado de erro", () => {
      render(<ProductsTable products={[]} error="Erro ao carregar dados" />);

      expect(screen.getByText("Erro ao carregar produtos")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Tente recarregar a página ou entre em contato com o suporte"
        )
      ).toBeInTheDocument();
    });

    it("deve exibir mensagem quando não há produtos", () => {
      render(<ProductsTable products={[]} />);

      expect(screen.getByText("Nenhum produto encontrado")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Tente ajustar os filtros de busca ou limpar os filtros"
        )
      ).toBeInTheDocument();
    });
  });

  describe("Paginação", () => {
    it("deve renderizar controles de paginação", () => {
      render(<ProductsTable products={manyProducts} />);

      expect(screen.getByTestId("table-pagination")).toBeInTheDocument();
      expect(screen.getByTestId("pagination-count")).toHaveTextContent("25");
      expect(screen.getByTestId("pagination-page")).toHaveTextContent("0");
      expect(screen.getByTestId("pagination-rows-per-page")).toHaveTextContent(
        "10"
      );
    });

    it("deve exibir apenas produtos da página atual", () => {
      render(<ProductsTable products={manyProducts} />);

      // Deve exibir apenas os primeiros 10 produtos (página 0, 10 por página)
      expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.getByText("Product 10")).toBeInTheDocument();
      expect(screen.queryByText("Product 11")).not.toBeInTheDocument();
    });

    it("deve navegar para próxima página", async () => {
      const user = userEvent.setup();
      render(<ProductsTable products={manyProducts} />);

      const nextButton = screen.getByTestId("next-page");
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId("pagination-page")).toHaveTextContent("1");
      });
    });

    it("deve alterar número de linhas por página", async () => {
      const user = userEvent.setup();
      render(<ProductsTable products={manyProducts} />);

      const select = screen.getByTestId("rows-per-page-select");
      await user.selectOptions(select, "25");

      await waitFor(() => {
        expect(
          screen.getByTestId("pagination-rows-per-page")
        ).toHaveTextContent("25");
      });
    });
  });

  describe("Ações da tabela", () => {
    it("deve renderizar botões de ação para cada produto", () => {
      render(<ProductsTable products={mockProducts} />);

      const actionButtons = screen.getAllByTestId("icon-button");
      expect(actionButtons).toHaveLength(3); // Um para cada produto

      // Verifica se os botões de ação contêm o ícone Visibility
      const visibilityIcons = screen.getAllByTestId("VisibilityIcon");
      expect(visibilityIcons).toHaveLength(mockProducts.length);
    });

    it("deve abrir diálogo de detalhes ao clicar no botão de visualizar", async () => {
      const user = userEvent.setup();
      render(<ProductsTable products={mockProducts} />);

      const firstActionButton = screen.getAllByTestId("icon-button")[0];
      await user.click(firstActionButton);

      await waitFor(() => {
        expect(screen.getByTestId("product-detail-dialog")).toBeInTheDocument();
        expect(screen.getByTestId("dialog-product-name")).toHaveTextContent(
          "iPhone 15"
        );
      });
    });

    it("deve fechar diálogo de detalhes", async () => {
      const user = userEvent.setup();
      render(<ProductsTable products={mockProducts} />);

      // Abrir diálogo
      const firstActionButton = screen.getAllByTestId("icon-button")[0];
      await user.click(firstActionButton);

      await waitFor(() => {
        expect(screen.getByTestId("product-detail-dialog")).toBeInTheDocument();
      });

      // Fechar diálogo
      const closeButton = screen.getByTestId("close-dialog");
      await user.click(closeButton);

      await waitFor(() => {
        expect(
          screen.queryByTestId("product-detail-dialog")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Funcionalidades auxiliares", () => {
    it("deve aplicar hover nas linhas da tabela", () => {
      render(<ProductsTable products={mockProducts} />);

      const dataRows = screen
        .getAllByTestId("table-row")
        .filter((row) => row.getAttribute("data-hover") === "true");
      expect(dataRows.length).toBeGreaterThan(0);
    });

    it("deve exibir IDs dos produtos", () => {
      render(<ProductsTable products={mockProducts} />);

      expect(screen.getByText("ID: 1")).toBeInTheDocument();
      expect(screen.getByText("ID: 2")).toBeInTheDocument();
      expect(screen.getByText("ID: 3")).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("deve funcionar com produto sem categoria", () => {
      const productWithoutCategory: DummyProduct = {
        ...mockProducts[0],
        category: "",
      };

      render(<ProductsTable products={[productWithoutCategory]} />);

      const categoryChip = screen
        .getAllByTestId("chip")
        .find((chip) => chip.getAttribute("data-color") === "primary");
      expect(categoryChip).toHaveTextContent("");
    });

    it("deve funcionar com preço zero", () => {
      const freeProduct: DummyProduct = {
        ...mockProducts[0],
        price: 0,
      };

      render(<ProductsTable products={[freeProduct]} />);

      expect(screen.getByText("R$ 0,00")).toBeInTheDocument();
    });

    it("deve funcionar with estoque negativo", () => {
      const negativeStockProduct: DummyProduct = {
        ...mockProducts[0],
        stock: -5,
      };

      render(<ProductsTable products={[negativeStockProduct]} />);

      // Estoque negativo é tratado como estoque baixo (stock <= 10)
      expect(screen.getByText("Estoque Baixo")).toBeInTheDocument();
    });
  });
});
