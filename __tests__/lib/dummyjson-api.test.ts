import {
  ApiError,
  AuthService,
  DummyCartsService,
  DummyProductsService,
  DummyUsersService,
  TokenManager,
} from "@/lib/dummyjson-api";
import { DummyUser, DummyProduct } from "@/types";


// Use the localStorage mock from jest.setup.js
const mockLocalStorage = window.localStorage as jest.Mocked<Storage>;

// Mock fetch
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

const mockUser: DummyUser = {
  id: 1,
  firstName: "João",
  lastName: "Silva",
  maidenName: "",
  email: "joao@example.com",
  username: "joaosilva",
  password: "",
  image: "https://example.com/avatar.jpg",
  phone: "11999999999",
  age: 30,
  gender: "male",
  birthDate: "1993-01-01",
  address: {
    address: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
    stateCode: "SP",
    postalCode: "01234-567",
    coordinates: { lat: -23.5505, lng: -46.6333 },
    country: "Brasil",
  },
  company: {
    department: "TI",
    name: "Tech Corp",
    title: "Desenvolvedor",
    address: {
      address: "Av. Paulista, 1000",
      city: "São Paulo",
      state: "SP",
      stateCode: "SP",
      postalCode: "01310-100",
      coordinates: { lat: -23.5618, lng: -46.6565 },
      country: "Brasil",
    },
  },
  bank: {
    cardExpire: "12/25",
    cardNumber: "1234567890123456",
    cardType: "Visa",
    currency: "BRL",
    iban: "BR1234567890123456789012345",
  },
  macAddress: "00:11:22:33:44:55",
  university: "USP",
  ip: "192.168.1.1",
  userAgent: "Mozilla/5.0",
  crypto: {
    coin: "Bitcoin",
    wallet: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    network: "Bitcoin",
  },
  role: "admin",
  ein: "12-3456789",
  ssn: "123-45-6789",
  bloodGroup: "O+",
  height: 175,
  weight: 70,
  eyeColor: "Brown",
  hair: {
    color: "Black",
    type: "Straight",
  },
};

const mockProduct = {
  id: 1,
  title: "iPhone 9",
  description: "An apple mobile which is nothing like apple",
  price: 549,
  discountPercentage: 12.96,
  rating: 4.69,
  stock: 94,
  brand: "Apple",
  category: "smartphones",
  thumbnail: "https://example.com/thumbnail.jpg",
  images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
};

describe("dummyjson-api", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockLocalStorage.clear.mockClear();
    mockFetch.mockClear();
  });

  describe("TokenManager", () => {
    /**
     * Testa se define e obtém token
     */
    it("sets and gets token", () => {
      const token = "test-token";
      
      // Mock the getItem to return the token after setting
      mockLocalStorage.getItem.mockReturnValue(token);
      
      TokenManager.setToken(token);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "dummyjson-token",
        token
      );

      expect(TokenManager.getToken()).toBe(token);
    });

    /**
     * Testa se define e obtém refresh token
     */
    it("sets and gets refresh token", () => {
      const refreshToken = "test-refresh-token";
      
      // Mock the getItem to return the refresh token after setting
      mockLocalStorage.getItem.mockReturnValue(refreshToken);
      
      TokenManager.setRefreshToken(refreshToken);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "dummyjson-refresh-token",
        refreshToken
      );

      expect(TokenManager.getRefreshToken()).toBe(refreshToken);
    });

    /**
     * Testa se define e obtém dados do usuário
     */
    it("sets and gets user data", () => {
      // Mock the getItem to return the user data after setting
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockUser));
      
      TokenManager.setUser(mockUser);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "dummyjson-user",
        JSON.stringify(mockUser)
      );

      expect(TokenManager.getUser()).toEqual(mockUser);
    });

    /**
     * Testa se limpa todos os dados
     */
    it("clears all data", () => {
      TokenManager.clearAll();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "dummyjson-token"
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "dummyjson-refresh-token"
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "dummyjson-user"
      );
    });

    /**
     * Testa se trata JSON inválido
     */
    it("handles invalid JSON", () => {
      mockLocalStorage.getItem.mockReturnValue("invalid-json");
      expect(() => TokenManager.getUser()).toThrow();
    });
  });

  describe("ApiError", () => {
    /**
     * Testa se cria erro com mensagem
     */
    it("creates error with message", () => {
      const error = new ApiError("Test error");
      expect(error.message).toBe("Test error");
      expect(error.name).toBe("ApiError");
      expect(error.status).toBeUndefined();
    });

    /**
     * Testa se cria erro com status
     */
    it("creates error with status", () => {
      const error = new ApiError("Test error", 404);
      expect(error.message).toBe("Test error");
      expect(error.status).toBe(404);
    });
  });

  // ApiClient is not exported from the module, so we'll test it indirectly through the services


  describe("AuthService", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      mockFetch.mockClear();
    });

    /**
     * Testa se faz login com sucesso
     */
    it("logs in successfully", async () => {
      const loginData = {
        username: "joaosilva",
        password: "123456",
      };

      const loginResponse = {
        id: 1,
        username: "joaosilva",
        email: "joao@example.com",
        firstName: "João",
        lastName: "Silva",
        gender: "male",
        image: "https://example.com/avatar.jpg",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => loginResponse,
      } as Response);

      const result = await AuthService.login(loginData);

      expect(result).toEqual(loginResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://dummyjson.com/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        }
      );
    });

    /**
     * Testa se obtém usuário atual
     */
    it("gets current user", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockUser,
      } as Response);

      const result = await AuthService.getCurrentUser();

      expect(result).toEqual(mockUser);
      expect(mockFetch).toHaveBeenCalledWith("https://dummyjson.com/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    });

    /**
     * Testa se atualiza token
     */
    it("refreshes token", async () => {
      const refreshData = {
        refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        expiresInMins: 30,
      };

      const refreshResponse = {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => refreshResponse,
      } as Response);

      const result = await AuthService.refreshToken(refreshData);

      expect(result).toEqual(refreshResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://dummyjson.com/auth/refresh",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(refreshData),
        }
      );
    });

    /**
     * Testa se faz logout
     */
    it("logs out", () => {
      AuthService.logout();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "dummyjson-token"
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "dummyjson-refresh-token"
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "dummyjson-user"
      );
    });

    /**
     * Testa se verifica autenticação
     */
    it("checks authentication", () => {
      mockLocalStorage.getItem.mockReturnValueOnce("some-token");
      expect(AuthService.isAuthenticated()).toBe(true);

      mockLocalStorage.getItem.mockReturnValueOnce(null);
      expect(AuthService.isAuthenticated()).toBe(false);
    });

    /**
     * Testa se obtém usuário armazenado
     */
    it("gets stored user", () => {
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockUser));
      const result = AuthService.getStoredUser();
      expect(result).toEqual(mockUser);
    });

    /**
     * Testa se trata erro de login inválido
     */
    it("handles login error", async () => {
      const loginData = {
        username: "invalid",
        password: "invalid",
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ message: "Invalid credentials" }),
      } as Response);

      await expect(AuthService.login(loginData)).rejects.toThrow(ApiError);
    });

    /**
     * Testa se trata erro de refresh token ausente
     */
    it("handles missing refresh token error", async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ message: "Refresh token required" }),
      } as Response);

      await expect(AuthService.refreshToken()).rejects.toThrow(ApiError);
    });
  });

  describe("DummyUsersService", () => {
    let usersService: DummyUsersService;

    beforeEach(() => {
      usersService = new DummyUsersService();
    });

    /**
     * Testa se obtém usuários com paginação
     */
    it("gets users with pagination", async () => {
      const responseData = {
        users: [mockUser],
        total: 100,
        skip: 0,
        limit: 10,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => responseData,
      } as Response);

      const result = await usersService.getUsers({ page: 1, pageSize: 10 });

      expect(result).toEqual({
        data: responseData.users,
        total: responseData.total,
        page: 1,
        pageSize: 10,
        totalPages: 10,
      });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://dummyjson.com/users?limit=10&skip=0",
        expect.any(Object)
      );
    });

    /**
     * Testa se obtém usuários com filtros
     */
    it("gets users with filters", async () => {
      const responseData = {
        users: [mockUser],
        total: 1,
        skip: 0,
        limit: 10,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => responseData,
      } as Response);

      const result = await usersService.getUsers({
        page: 1,
        pageSize: 10,
        search: "João",
        sortBy: "firstName",
        sortOrder: "asc",
      });

      expect(result).toEqual({
        data: responseData.users,
        total: responseData.total,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://dummyjson.com/users/search?q=Jo%C3%A3o&limit=10&skip=0",
        expect.any(Object)
      );
    });

    /**
     * Testa se obtém usuário por ID
     */
    it("gets user by ID", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockUser,
      } as Response);

      const result = await usersService.getUserById("1");

      expect(result).toEqual(mockUser);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://dummyjson.com/users/1",
        expect.any(Object)
      );
    });

    /**
     * Testa se retorna null para usuário não encontrado
     */
    it("returns null for user not found", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => "Not found",
      } as Response);

      const result = await usersService.getUserById("999");

      expect(result).toBeNull();
    });

    /**
     * Testa se cria usuário
     */
    it("creates user", async () => {
      const newUserData = {
        firstName: "Maria",
        lastName: "Santos",
        email: "maria@example.com",
        username: "mariasantos",
        maidenName: "",
        password: "123456",
        image: "",
        phone: "",
        age: 25,
        gender: "female" as const,
        birthDate: "1998-01-01",
        address: {
          address: "",
          city: "",
          state: "",
          stateCode: "",
          postalCode: "",
          coordinates: { lat: 0, lng: 0 },
          country: "",
        },
        company: {
          department: "",
          name: "",
          title: "",
          address: {
            address: "",
            city: "",
            state: "",
            stateCode: "",
            postalCode: "",
            coordinates: { lat: 0, lng: 0 },
            country: "",
          },
        },
        bank: {
          cardExpire: "",
          cardNumber: "",
          cardType: "",
          currency: "",
          iban: "",
        },
        macAddress: "",
        university: "",
        ip: "",
        userAgent: "",
        crypto: {
          coin: "",
          wallet: "",
          network: "",
        },
        role: "user" as const,
        ein: "",
        ssn: "",
        bloodGroup: "",
        height: 0,
        weight: 0,
        eyeColor: "",
        hair: {
          color: "",
          type: "",
        },
      };

      const createdUser = { id: 2, ...newUserData };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => createdUser,
      } as Response);

      const result = await usersService.createUser(newUserData);

      expect(result).toEqual(createdUser);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://dummyjson.com/users/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newUserData),
        }
      );
    });

    /**
     * Testa se atualiza usuário
     */
    it("updates user", async () => {
      const updateData = { firstName: "João Updated" };
      const updatedUser = { ...mockUser, ...updateData };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => updatedUser,
      } as Response);

      const result = await usersService.updateUser("1", updateData);

      expect(result).toEqual(updatedUser);
      expect(mockFetch).toHaveBeenCalledWith("https://dummyjson.com/users/1", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });
    });

    /**
     * Testa se deleta usuário
     */
    it("deletes user", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      } as Response);

      await usersService.deleteUser("1");

      expect(mockFetch).toHaveBeenCalledWith("https://dummyjson.com/users/1", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
    });

    /**
     * Testa se trata erro de criação de usuário
     */
    it("handles user creation error", async () => {
      const newUserData = {
        firstName: "Test",
        lastName: "User",
        email: "invalid-email",
        username: "",
      } as any;

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ message: "Invalid user data" }),
      } as Response);

      await expect(usersService.createUser(newUserData)).rejects.toThrow(
        ApiError
      );
    });
  });

  describe("DummyProductsService", () => {
    let productsService: DummyProductsService;

    beforeEach(() => {
      productsService = new DummyProductsService();
    });

    /**
     * Testa se obtém produtos com paginação
     */
    it("gets products with pagination", async () => {
      const responseData = {
        products: [mockProduct],
        total: 100,
        skip: 0,
        limit: 10,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => responseData,
      } as Response);

      const result = await productsService.getProducts({
        page: 1,
        pageSize: 10,
      });

      expect(result).toEqual({
        data: responseData.products,
        total: responseData.total,
        page: 1,
        pageSize: 10,
        totalPages: 10,
      });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://dummyjson.com/products?limit=10&skip=0",
        expect.any(Object)
      );
    });

    /**
     * Testa se obtém produtos com filtros
     */
    it("gets products with filters", async () => {
      const responseData = {
        products: [mockProduct],
        total: 1,
        skip: 0,
        limit: 10,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => responseData,
      } as Response);

      const result = await productsService.getProducts({
        page: 1,
        pageSize: 10,
        search: "iPhone",
        category: "smartphones",
        sortBy: "price",
        sortOrder: "desc",
      });

      expect(result).toEqual({
        data: responseData.products,
        total: responseData.total,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://dummyjson.com/products/search?q=iPhone&limit=10&skip=0&sortBy=price&order=desc",
        expect.any(Object)
      );
    });

    /**
     * Testa se obtém produtos por categoria
     */
    it("gets products by category", async () => {
      const responseData = {
        products: [mockProduct],
        total: 5,
        skip: 0,
        limit: 10,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => responseData,
      } as Response);

      const result = await productsService.getProducts({
        page: 1,
        pageSize: 10,
        category: "smartphones",
      });

      expect(result).toEqual({
        data: responseData.products,
        total: responseData.total,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://dummyjson.com/products/category/smartphones?limit=10&skip=0",
        expect.any(Object)
      );
    });

    /**
     * Testa se obtém produto por ID
     */
    it("gets product by ID", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockProduct,
      } as Response);

      const result = await productsService.getProductById("1");

      expect(result).toEqual(mockProduct);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://dummyjson.com/products/1",
        expect.any(Object)
      );
    });

    /**
     * Testa se retorna null para produto não encontrado
     */
    it("returns null for product not found", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => "Not found",
      } as Response);

      const result = await productsService.getProductById("999");

      expect(result).toBeNull();
    });

    /**
     * Testa se obtém categorias
     */
    it("gets categories", async () => {
      const categories = [
        { name: "smartphones" },
        { name: "laptops" },
        { name: "fragrances" },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => categories,
      } as Response);

      const result = await productsService.getCategories();

      expect(result).toEqual(["smartphones", "laptops", "fragrances"]);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://dummyjson.com/products/categories",
        expect.any(Object)
      );
    });

    /**
     * Testa se cria produto
     */
    it("creates product", async () => {
      const newProductData = {
        title: "New Product",
        description: "A new product",
        price: 299,
        category: "electronics",
        discountPercentage: 0,
        rating: 0,
        stock: 0,
        brand: "",
        thumbnail: "",
        images: [],
        weight: 0,
        dimensions: { width: 0, height: 0, depth: 0 },
        warrantyInformation: "",
        shippingInformation: "",
        availabilityStatus: "",
        reviews: [],
        returnPolicy: "",
        minimumOrderQuantity: 1,
        meta: {
          createdAt: "",
          updatedAt: "",
          barcode: "",
          qrCode: "",
        },
        tags: [],
        sku: "",
      };

      const createdProduct = { id: 101, ...newProductData };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => createdProduct,
      } as Response);

      const result = await productsService.createProduct(newProductData);

      expect(result).toEqual(createdProduct);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://dummyjson.com/products/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newProductData),
        }
      );
    });

    /**
     * Testa se atualiza produto
     */
    it("updates product", async () => {
      const updateData = { price: 599 };
      const updatedProduct = { ...mockProduct, ...updateData };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => updatedProduct,
      } as Response);

      const result = await productsService.updateProduct("1", updateData);

      expect(result).toEqual(updatedProduct);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://dummyjson.com/products/1",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );
    });

    /**
     * Testa se deleta produto
     */
    it("deletes product", async () => {
      const deletedProduct = {
        ...mockProduct,
        isDeleted: true,
        deletedOn: new Date().toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => deletedProduct,
      } as Response);

      const result = await productsService.deleteProduct("1");

      expect(result).toEqual(deletedProduct);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://dummyjson.com/products/1",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    /**
     * Testa se trata erro de produto inválido
     */
    it("handles invalid product error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ message: "Invalid product data" }),
      } as Response);

      await expect(productsService.createProduct({} as any)).rejects.toThrow(
        ApiError
      );
    });
  });

  describe("DummyCartsService", () => {
    let cartsService: DummyCartsService;

    beforeEach(() => {
      jest.resetAllMocks();
      mockFetch.mockClear();
      cartsService = new DummyCartsService();
    });

    /**
     * Testa se obtém todos os carrinhos
     */
    it("gets all carts", async () => {
      const responseData = {
        carts: [
          {
            id: 1,
            products: [],
            total: 0,
            discountedTotal: 0,
            userId: 1,
            totalProducts: 0,
            totalQuantity: 0,
          },
        ],
        total: 1,
        skip: 0,
        limit: 30,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => responseData,
      } as Response);

      const result = await cartsService.getCarts();

      expect(result).toEqual({
        data: responseData.carts,
        total: responseData.total,
        page: 1,
        pageSize: 30,
        totalPages: 1,
      });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://dummyjson.com/carts?limit=30&skip=0",
        expect.any(Object)
      );
    });

    /**
     * Testa se obtém carrinho por ID
     */
    it("gets cart by ID", async () => {
      const cart = {
        id: 1,
        products: [
          {
            id: 1,
            title: "iPhone",
            price: 549,
            quantity: 1,
            total: 549,
            discountPercentage: 0,
            discountedPrice: 549,
          },
        ],
        total: 549,
        discountedTotal: 549,
        userId: 1,
        totalProducts: 1,
        totalQuantity: 1,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => cart,
      } as Response);

      const result = await cartsService.getCartById("1");

      expect(result).toEqual(cart);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://dummyjson.com/carts/1",
        expect.any(Object)
      );
    });

    /**
     * Testa se retorna null para carrinho não encontrado
     */
    it("returns null for cart not found", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => "Not found",
      } as Response);

      const result = await cartsService.getCartById("999");

      expect(result).toBeNull();
    });

    /**
     * Testa se obtém carrinhos por usuário
     */
    it("gets carts by user", async () => {
      const responseData = {
        carts: [
          {
            id: 1,
            products: [],
            total: 0,
            discountedTotal: 0,
            userId: 1,
            totalProducts: 0,
            totalQuantity: 0,
          },
        ],
        total: 1,
        skip: 0,
        limit: 10,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => responseData,
      } as Response);

      const result = await cartsService.getCartsByUser("1");

      expect(result).toEqual(responseData);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://dummyjson.com/carts/user/1",
        expect.any(Object)
      );
    });

    /**
     * Testa se retorna dados vazios para usuário sem carrinhos
     */
    it("returns empty data for user with no carts", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => "Not found",
      } as Response);

      const result = await cartsService.getCartsByUser("999");

      expect(result).toEqual({ carts: [], total: 0, skip: 0, limit: 10 });
    });

    /**
     * Testa se calcula estatísticas de vendas
     */
    it("calculates sales stats", async () => {
      const cartsData = {
        carts: [
          { id: 1, discountedTotal: 100, totalProducts: 2, totalQuantity: 3 },
          { id: 2, discountedTotal: 200, totalProducts: 1, totalQuantity: 2 },
        ],
        total: 2,
        skip: 0,
        limit: 100,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => cartsData,
      } as Response);

      const result = await cartsService.getSalesStats();

      expect(result).toEqual({
        totalSales: 300,
        totalOrders: 2,
        totalProducts: 3,
        totalQuantity: 5,
        averageOrderValue: 150,
      });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://dummyjson.com/carts?limit=100",
        expect.any(Object)
      );
    });

    /**
     * Testa se calcula estatísticas com dados vazios
     */
    it("calculates stats with empty data", async () => {
      const cartsData = {
        carts: [],
        total: 0,
        skip: 0,
        limit: 100,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => cartsData,
      } as Response);

      const result = await cartsService.getSalesStats();

      expect(result).toEqual({
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalQuantity: 0,
        averageOrderValue: 0,
      });
    });
  });


  describe("Error Handling", () => {
    let usersService: DummyUsersService;
    let productsService: DummyProductsService;
    let cartsService: DummyCartsService;

    beforeEach(() => {
      usersService = new DummyUsersService();
      productsService = new DummyProductsService();
      cartsService = new DummyCartsService();
    });

    /**
     * Testa se trata erro de rede
     */
    it("handles network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(usersService.getUsers()).rejects.toThrow(ApiError);
      await expect(productsService.getProducts()).rejects.toThrow(ApiError);
      await expect(cartsService.getCarts()).rejects.toThrow(ApiError);
    });

    /**
     * Testa se trata erro de servidor
     */
    it("handles server errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      } as Response);

      await expect(usersService.getUsers()).rejects.toThrow(ApiError);
    });

    /**
     * Testa se trata resposta JSON inválida
     */
    it("handles invalid JSON response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      } as Response);

      await expect(usersService.getUsers()).rejects.toThrow();
    });

    /**
     * Testa se trata timeout
     */
    it("handles timeout", async () => {
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 100)
          )
      );

      await expect(usersService.getUsers()).rejects.toThrow(ApiError);
    });
  });

  describe("Edge Cases", () => {
    let usersService: DummyUsersService;
    let productsService: DummyProductsService;
    let cartsService: DummyCartsService;

    beforeEach(() => {
      usersService = new DummyUsersService();
      productsService = new DummyProductsService();
      cartsService = new DummyCartsService();
    });

    /**
     * Testa se trata resposta vazia
     */
    it("handles empty response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ users: [], total: 0, skip: 0, limit: 30 }),
      } as Response);

      const result = await usersService.getUsers();

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    /**
     * Testa se trata parâmetros inválidos
     */
    it("handles invalid parameters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ users: [], total: 0, skip: 0, limit: 30 }),
      } as Response);

      const result = await usersService.getUsers({
        page: -1,
        pageSize: 0,
        search: "",
      });

      expect(result).toBeDefined();
    });

    /**
     * Testa se trata dados malformados
     */
    it("handles malformed data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ malformed: "data" }),
      } as Response);

      const result = await usersService.getUsers();

      expect(result.data).toEqual([]);
    });
  });
});
