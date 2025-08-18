jest.mock("@/lib/dummyjson-api", () => {
  const originalModule = jest.requireActual("@/lib/dummyjson-api");
  
  // Create mock instances inside the factory function
  const mockUsersServiceInstance = {
    getUsers: jest.fn(),
    getUserById: jest.fn(),
  };

  const mockProductsServiceInstance = {
    getProducts: jest.fn(),
    getProductById: jest.fn(),
    getCategories: jest.fn(),
  };

  const mockCartsServiceInstance = {
    getCarts: jest.fn(),
    getCartById: jest.fn(),
    getCartsByUser: jest.fn(),
    getSalesStats: jest.fn(),
  };
  
  return {
    ...originalModule,
    DummyUsersService: jest.fn().mockImplementation(() => mockUsersServiceInstance),
    DummyProductsService: jest.fn().mockImplementation(() => mockProductsServiceInstance),
    DummyCartsService: jest.fn().mockImplementation(() => mockCartsServiceInstance),
    ApiError: class MockApiError extends Error {
      status?: number;
      constructor(message: string, status?: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
      }
    },
    // Export mock instances for test access
    __mockInstances: {
      users: mockUsersServiceInstance,
      products: mockProductsServiceInstance,
      carts: mockCartsServiceInstance,
    },
  };
});

import { ProductsService, UsersService, CartsService } from "@/lib/dataService";
import { ApiError } from "@/lib/dummyjson-api";
import { PaginatedResponse } from "@/types";
import type { DummyUser, DummyProduct } from "@/types";
import type {
  DummyCart,
  DummyCartsResponse,
} from "@/types/dummyjson";
import { mockProducts, mockUsers } from "../utils/mock-data";

// Get mock instances from the mocked module
const { __mockInstances } = jest.requireMock("@/lib/dummyjson-api");
const mockUsersServiceInstance = __mockInstances.users;
const mockProductsServiceInstance = __mockInstances.products;
const mockCartsServiceInstance = __mockInstances.carts;

// Spy on console.error to test error logging
const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

describe("UsersService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe("getUsers", () => {
    it("validates limit parameter", async () => {
      await expect(UsersService.getUsers({ limit: 0 })).rejects.toThrow(
        "Limite deve estar entre 1 e 100"
      );
      
      await expect(UsersService.getUsers({ limit: 101 })).rejects.toThrow(
        "Limite deve estar entre 1 e 100"
      );
    });

    it("validates skip parameter", async () => {
      await expect(UsersService.getUsers({ skip: -1 })).rejects.toThrow(
        "Skip deve ser maior ou igual a 0"
      );
    });
    it("returns users from DummyUsersService", async () => {
      const mockResponse = {
        data: mockUsers,
        total: mockUsers.length,
        page: 1,
        pageSize: 30,
        totalPages: 1,
      } as PaginatedResponse<DummyUser>;

      mockUsersServiceInstance.getUsers.mockResolvedValue(mockResponse);

      const result = await UsersService.getUsers();

      expect(result).toEqual(mockResponse);
      expect(mockUsersServiceInstance.getUsers).toHaveBeenCalledWith(undefined);
    });

    it("passes filters to DummyUsersService", async () => {
      const filters = {
        search: "john",
        category: "",
        role: "admin",
        sortBy: "name",
        sortOrder: "asc" as const,
      };
      const mockResponse = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 30,
        totalPages: 0,
      };

      mockUsersServiceInstance.getUsers.mockResolvedValue(mockResponse);

      await UsersService.getUsers(filters);

      expect(mockUsersServiceInstance.getUsers).toHaveBeenCalledWith(filters);
    });

    it("handles and re-throws errors", async () => {
      const error = new Error("API Error");
      mockUsersServiceInstance.getUsers.mockRejectedValue(error);

      await expect(UsersService.getUsers()).rejects.toThrow("API Error");
    });
  });

  describe("getUserById", () => {
    it("validates ID parameter", async () => {
      await expect(UsersService.getUserById("")).rejects.toThrow(
        "ID do usuário é obrigatório e deve ser uma string válida"
      );
      
      await expect(UsersService.getUserById("   ")).rejects.toThrow(
        "ID do usuário é obrigatório e deve ser uma string válida"
      );
    });

    it("trims ID parameter", async () => {
      const mockUser = mockUsers[0];
      mockUsersServiceInstance.getUserById.mockResolvedValue(mockUser);

      await UsersService.getUserById("  1  ");

      expect(mockUsersServiceInstance.getUserById).toHaveBeenCalledWith("1");
    });
    it("returns user from DummyUsersService", async () => {
      const mockUser = mockUsers[0];
      mockUsersServiceInstance.getUserById.mockResolvedValue(mockUser);

      const result = await UsersService.getUserById("1");

      expect(result).toEqual(mockUser);
      expect(mockUsersServiceInstance.getUserById).toHaveBeenCalledWith("1");
    });

    it("returns null for 404 errors", async () => {
      const apiError = new ApiError("User not found", 404);
      mockUsersServiceInstance.getUserById.mockRejectedValue(apiError);

      const result = await UsersService.getUserById("999");

      expect(result).toBe(null);
    });

    it("re-throws non-404 errors", async () => {
      const apiError = new ApiError("Server Error", 500);
      mockUsersServiceInstance.getUserById.mockRejectedValue(apiError);

      await expect(UsersService.getUserById("1")).rejects.toThrow(
        "Server Error"
      );
    });

    it("re-throws non-ApiError errors", async () => {
      const error = new Error("Network Error");
      mockUsersServiceInstance.getUserById.mockRejectedValue(error);

      await expect(UsersService.getUserById("1")).rejects.toThrow(
        "Network Error"
      );
    });
  });
});

describe("ProductsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockClear();
    // Limpa o cache para garantir que os mocks funcionem
    ProductsService.clearCategoriesCache();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe("getProducts", () => {
    it("validates limit parameter", async () => {
      await expect(ProductsService.getProducts({ limit: 0 })).rejects.toThrow(
        "Limite deve estar entre 1 e 100"
      );
      
      await expect(ProductsService.getProducts({ limit: 101 })).rejects.toThrow(
        "Limite deve estar entre 1 e 100"
      );
    });

    it("validates skip parameter", async () => {
      await expect(ProductsService.getProducts({ skip: -1 })).rejects.toThrow(
        "Skip deve ser maior ou igual a 0"
      );
    });
    it("returns products from DummyProductsService", async () => {
      const mockResponse = {
        data: mockProducts,
        total: mockProducts.length,
        page: 1,
        pageSize: 30,
        totalPages: 1,
      };

      mockProductsServiceInstance.getProducts.mockResolvedValue(mockResponse);

      const result = await ProductsService.getProducts();

      expect(result).toEqual(mockResponse);
      expect(mockProductsServiceInstance.getProducts).toHaveBeenCalledWith(
        undefined
      );
    });

    it("passes filters to DummyProductsService", async () => {
      const filters = {
        search: "iphone",
        category: "smartphones",
        role: "",
        sortBy: "price",
        sortOrder: "desc" as const,
      };
      const mockResponse = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 30,
        totalPages: 0,
      };

      mockProductsServiceInstance.getProducts.mockResolvedValue(mockResponse);

      await ProductsService.getProducts(filters);

      expect(mockProductsServiceInstance.getProducts).toHaveBeenCalledWith(
        filters
      );
    });

    it("handles and re-throws errors", async () => {
      const error = new Error("API Error");
      mockProductsServiceInstance.getProducts.mockRejectedValue(error);

      await expect(ProductsService.getProducts()).rejects.toThrow("API Error");
    });
  });

  describe("getProductById", () => {
    it("validates ID parameter", async () => {
      await expect(ProductsService.getProductById("")).rejects.toThrow(
        "ID do produto é obrigatório e deve ser uma string válida"
      );
      
      await expect(ProductsService.getProductById("   ")).rejects.toThrow(
        "ID do produto é obrigatório e deve ser uma string válida"
      );
    });

    it("trims ID parameter", async () => {
      const mockProduct = mockProducts[0];
      mockProductsServiceInstance.getProductById.mockResolvedValue(mockProduct);

      await ProductsService.getProductById("  1  ");

      expect(mockProductsServiceInstance.getProductById).toHaveBeenCalledWith("1");
    });
    it("returns product from DummyProductsService", async () => {
      const mockProduct = mockProducts[0];
      mockProductsServiceInstance.getProductById.mockResolvedValue(mockProduct);

      const result = await ProductsService.getProductById("1");

      expect(result).toEqual(mockProduct);
      expect(mockProductsServiceInstance.getProductById).toHaveBeenCalledWith("1");
    });

    it("returns null for 404 errors", async () => {
      const apiError = new ApiError("Product not found", 404);
      mockProductsServiceInstance.getProductById.mockRejectedValue(apiError);

      const result = await ProductsService.getProductById("1");
      expect(result).toBeNull();
    });

    it("re-throws non-404 errors", async () => {
      const apiError = new ApiError("Server Error", 500);
      mockProductsServiceInstance.getProductById.mockRejectedValue(apiError);

      await expect(ProductsService.getProductById("1")).rejects.toThrow(
        "Server Error"
      );
    });
  });

  describe("getCategories", () => {
    it("returns categories from DummyProductsService", async () => {
      const categories = ["electronics", "clothing", "books"];
      mockProductsServiceInstance.getCategories.mockResolvedValue(categories);

      const result = await ProductsService.getCategories();

      expect(result).toEqual(categories);
      expect(mockProductsServiceInstance.getCategories).toHaveBeenCalled();
    });

    it("uses cache for subsequent calls", async () => {
      const categories = ["electronics", "clothing", "books"];
      mockProductsServiceInstance.getCategories.mockResolvedValue(categories);

      // First call
      await ProductsService.getCategories();
      // Second call should use cache
      await ProductsService.getCategories();

      // Should only call the service once
      expect(mockProductsServiceInstance.getCategories).toHaveBeenCalledTimes(1);
    });

    it("handles and re-throws errors", async () => {
      const error = new Error("Categories fetch failed");
      mockProductsServiceInstance.getCategories.mockRejectedValue(error);

      await expect(ProductsService.getCategories()).rejects.toThrow(
        "Categories fetch failed"
      );
    });
  });

  describe("clearCategoriesCache", () => {
    it("clears the cache", async () => {
      const categories = ["electronics", "clothing", "books"];
      mockProductsServiceInstance.getCategories.mockResolvedValue(categories);

      // First call
      await ProductsService.getCategories();
      
      // Clear cache
      ProductsService.clearCategoriesCache();
      
      // Second call should hit the service again
      await ProductsService.getCategories();

      expect(mockProductsServiceInstance.getCategories).toHaveBeenCalledTimes(2);
    });
  });
});

describe("CartsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe("getCarts", () => {
    it("returns carts from DummyCartsService", async () => {
      const mockCarts: DummyCart[] = [
        {
          id: 1,
          products: [
            {
              id: 1,
              title: "iPhone 9",
              price: 549,
              quantity: 4,
              total: 2196,
              discountPercentage: 12.96,
              discountedTotal: 1909.04,
              thumbnail: "https://cdn.dummyjson.com/product-images/1/thumbnail.jpg"
            }
          ],
          total: 2328,
          discountedTotal: 2009.04,
          userId: 97,
          totalProducts: 5,
          totalQuantity: 10
        }
      ];
      
      const mockResponse = {
        data: mockCarts,
        total: mockCarts.length,
        page: 1,
        pageSize: 30,
        totalPages: 1,
      } as PaginatedResponse<DummyCart>;

      mockCartsServiceInstance.getCarts.mockResolvedValue(mockResponse);

      const result = await CartsService.getCarts();

      expect(result).toEqual(mockResponse);
      expect(mockCartsServiceInstance.getCarts).toHaveBeenCalledWith(undefined);
    });

    it("validates limit parameter", async () => {
      await expect(CartsService.getCarts({ limit: 0 })).rejects.toThrow(
        "Limite deve estar entre 1 e 100"
      );
      
      await expect(CartsService.getCarts({ limit: 101 })).rejects.toThrow(
        "Limite deve estar entre 1 e 100"
      );
    });

    it("validates skip parameter", async () => {
      await expect(CartsService.getCarts({ skip: -1 })).rejects.toThrow(
        "Skip deve ser maior ou igual a 0"
      );
    });

    it("handles and re-throws errors", async () => {
      const error = new Error("API Error");
      mockCartsServiceInstance.getCarts.mockRejectedValue(error);

      await expect(CartsService.getCarts()).rejects.toThrow("API Error");
    });
  });

  describe("getCartById", () => {
    it("returns cart from DummyCartsService", async () => {
      const mockCart: DummyCart = {
        id: 1,
        products: [],
        total: 2328,
        discountedTotal: 2009.04,
        userId: 97,
        totalProducts: 5,
        totalQuantity: 10
      };
      
      mockCartsServiceInstance.getCartById.mockResolvedValue(mockCart);

      const result = await CartsService.getCartById("1");

      expect(result).toEqual(mockCart);
      expect(mockCartsServiceInstance.getCartById).toHaveBeenCalledWith("1");
    });

    it("validates ID parameter", async () => {
      await expect(CartsService.getCartById("")).rejects.toThrow(
        "ID do carrinho é obrigatório e deve ser uma string válida"
      );
      
      await expect(CartsService.getCartById("   ")).rejects.toThrow(
        "ID do carrinho é obrigatório e deve ser uma string válida"
      );
    });

    it("trims ID parameter", async () => {
      const mockCart: DummyCart = {
        id: 1,
        products: [],
        total: 2328,
        discountedTotal: 2009.04,
        userId: 97,
        totalProducts: 5,
        totalQuantity: 10
      };
      
      mockCartsServiceInstance.getCartById.mockResolvedValue(mockCart);

      await CartsService.getCartById("  1  ");

      expect(mockCartsServiceInstance.getCartById).toHaveBeenCalledWith("1");
    });

    it("returns null for 404 errors", async () => {
      const apiError = new ApiError("Cart not found", 404);
      mockCartsServiceInstance.getCartById.mockRejectedValue(apiError);

      const result = await CartsService.getCartById("999");

      expect(result).toBe(null);
    });

    it("re-throws non-404 errors", async () => {
      const apiError = new ApiError("Server Error", 500);
      mockCartsServiceInstance.getCartById.mockRejectedValue(apiError);

      await expect(CartsService.getCartById("1")).rejects.toThrow(
        "Server Error"
      );
    });
  });

  describe("getCartsByUser", () => {
    it("returns carts for user from DummyCartsService", async () => {
      const mockResponse: DummyCartsResponse = {
        carts: [],
        total: 0,
        skip: 0,
        limit: 0
      };
      
      mockCartsServiceInstance.getCartsByUser.mockResolvedValue(mockResponse);

      const result = await CartsService.getCartsByUser("1");

      expect(result).toEqual(mockResponse);
      expect(mockCartsServiceInstance.getCartsByUser).toHaveBeenCalledWith("1");
    });

    it("validates userId parameter", async () => {
      await expect(CartsService.getCartsByUser("")).rejects.toThrow(
        "ID do usuário é obrigatório e deve ser uma string válida"
      );
      
      await expect(CartsService.getCartsByUser("   ")).rejects.toThrow(
        "ID do usuário é obrigatório e deve ser uma string válida"
      );
    });

    it("trims userId parameter", async () => {
      const mockResponse: DummyCartsResponse = {
        carts: [],
        total: 0,
        skip: 0,
        limit: 0
      };
      
      mockCartsServiceInstance.getCartsByUser.mockResolvedValue(mockResponse);

      await CartsService.getCartsByUser("  1  ");

      expect(mockCartsServiceInstance.getCartsByUser).toHaveBeenCalledWith("1");
    });

    it("handles and re-throws errors", async () => {
      const error = new Error("API Error");
      mockCartsServiceInstance.getCartsByUser.mockRejectedValue(error);

      await expect(CartsService.getCartsByUser("1")).rejects.toThrow("API Error");
    });
  });

  describe("getSalesStats", () => {
    it("returns sales stats from DummyCartsService", async () => {
      const mockStats = {
        totalSales: 10000,
        totalOrders: 50,
        totalProducts: 200,
        totalQuantity: 500,
        averageOrderValue: 200
      };
      
      mockCartsServiceInstance.getSalesStats.mockResolvedValue(mockStats);

      const result = await CartsService.getSalesStats();

      expect(result).toEqual(mockStats);
      expect(mockCartsServiceInstance.getSalesStats).toHaveBeenCalled();
    });

    it("handles and re-throws errors", async () => {
      const error = new Error("Stats calculation failed");
      mockCartsServiceInstance.getSalesStats.mockRejectedValue(error);

      await expect(CartsService.getSalesStats()).rejects.toThrow(
        "Stats calculation failed"
      );
    });
  });


});

// Test SimpleCache class (internal)
describe("SimpleCache", () => {
  // Import SimpleCache for testing - we need to access it through the module
  let SimpleCache: any;
  
  beforeAll(() => {
    // Access SimpleCache through ProductsService to test it
    // Since it's not exported, we'll test it indirectly through ProductsService
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockClear();
    ProductsService.clearCategoriesCache();
  });

  it("caches data with TTL", async () => {
    const categories = ["electronics", "clothing"];
    mockProductsServiceInstance.getCategories.mockResolvedValue(categories);

    // First call - should hit the service
    const result1 = await ProductsService.getCategories();
    expect(result1).toEqual(categories);
    expect(mockProductsServiceInstance.getCategories).toHaveBeenCalledTimes(1);

    // Second call - should use cache
    const result2 = await ProductsService.getCategories();
    expect(result2).toEqual(categories);
    expect(mockProductsServiceInstance.getCategories).toHaveBeenCalledTimes(1); // Still 1, not called again
  });

  it("expires cache after TTL", async () => {
    const categories = ["electronics", "clothing"];
    mockProductsServiceInstance.getCategories.mockResolvedValue(categories);

    // Mock Date.now to control time
    const originalDateNow = Date.now;
    let currentTime = 1000000;
    const dateSpy = jest.spyOn(Date, "now").mockImplementation(() => currentTime);

    try {
      // First call
      await ProductsService.getCategories();
      expect(mockProductsServiceInstance.getCategories).toHaveBeenCalledTimes(1);

      // Advance time beyond TTL (60 minutes = 3600000ms)
      currentTime += 3600001;

      // Second call should hit service again due to expired cache
      await ProductsService.getCategories();
      expect(mockProductsServiceInstance.getCategories).toHaveBeenCalledTimes(2);
    } finally {
      dateSpy.mockRestore();
      Date.now = originalDateNow;
    }
  });
});
