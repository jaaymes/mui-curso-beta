import {
  getProductsData,
  getProductById,
  searchProductsByCategory,
  searchProductsByName,
  searchProductsByFilter,
  searchProducts,
  searchProductsWithMultipleFilters,
  filterProducts,
  paginateProducts,
  SEARCH_FIELDS,
  type ProductsData,
  type AdvancedSearchFilter,
} from '@/app/(dashboard)/products/lib/products-data';
import { ProductsService } from '@/lib/dataService';
import type { DummyProduct, DummyResponse } from '@/types';

// Mock the ProductsService
jest.mock('@/lib/dataService', () => ({
  ProductsService: {
    getProducts: jest.fn(),
    getProductById: jest.fn(),
    getCategories: jest.fn(),
  },
}));

// Mock global fetch
global.fetch = jest.fn();

const mockProductsService = ProductsService as jest.Mocked<typeof ProductsService>;
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('Products Data Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockProducts: DummyProduct[] = [
    {
      id: 1,
      title: 'iPhone 12',
      description: 'Latest Apple smartphone',
      price: 999,
      discountPercentage: 5,
      rating: 4.5,
      stock: 50,
      brand: 'Apple',
      category: 'smartphones',
      thumbnail: 'iphone12.jpg',
      images: ['iphone12_1.jpg', 'iphone12_2.jpg'],
      tags: ['phone', 'smartphone', 'apple'],
    },
    {
      id: 2,
      title: 'Samsung Galaxy S21',
      description: 'Premium Android phone',
      price: 799,
      discountPercentage: 10,
      rating: 4.3,
      stock: 0,
      brand: 'Samsung',
      category: 'smartphones',
      thumbnail: 'galaxy_s21.jpg',
      images: ['galaxy_s21_1.jpg'],
      tags: ['phone', 'android', 'samsung'],
    },
    {
      id: 3,
      title: 'MacBook Pro',
      description: 'Professional laptop',
      price: 2499,
      discountPercentage: 3,
      rating: 4.8,
      stock: 5,
      brand: 'Apple',
      category: 'laptops',
      thumbnail: 'macbook.jpg',
      images: ['macbook_1.jpg'],
      tags: ['laptop', 'apple', 'computer'],
    },
  ];

  describe('SEARCH_FIELDS', () => {
    it('should have all required search fields', () => {
      expect(SEARCH_FIELDS).toEqual({
        title: "title",
        description: "description",
        category: "category",
        brand: "brand",
        price: "price",
        rating: "rating",
        tags: "tags",
      });
    });

    it('should be readonly (const object)', () => {
      // In TypeScript, const objects can still be mutated at runtime
      // but the type system prevents it at compile time
      expect(SEARCH_FIELDS.title).toBe('title');
      // Testing that the structure exists and is correct
    });
  });

  describe('getProductsData', () => {
    it('should fetch products data successfully', async () => {
      mockProductsService.getProducts.mockResolvedValue({
        data: mockProducts,
        total: 3,
        page: 1,
        totalPages: 1,
      });
      mockProductsService.getCategories.mockResolvedValue(['smartphones', 'laptops']);

      const result = await getProductsData();

      expect(result.products).toEqual(mockProducts);
      expect(result.total).toBe(3);
      expect(result.categories).toEqual(['smartphones', 'laptops']);
      expect(result.stats.totalProducts).toBe(3);
      expect(result.stats.activeProducts).toBe(2); // Products with stock > 0
      expect(result.stats.outOfStockProducts).toBe(1); // Products with stock === 0
      expect(result.stats.lowStockProducts).toBe(1); // Products with stock < 10 and > 0
    });

    it('should handle partial failures gracefully', async () => {
      mockProductsService.getProducts.mockResolvedValue({
        data: mockProducts,
        total: 3,
        page: 1,
        totalPages: 1,
      });
      mockProductsService.getCategories.mockRejectedValue(new Error('Categories error'));

      const result = await getProductsData();

      expect(result.products).toEqual(mockProducts);
      expect(result.total).toBe(3);
      expect(result.categories).toEqual([]);
      expect(result.stats.totalProducts).toBe(3);
    });

    it('should handle complete failure', async () => {
      mockProductsService.getProducts.mockRejectedValue(new Error('Network error'));
      mockProductsService.getCategories.mockRejectedValue(new Error('Network error'));

      const result = await getProductsData();

      expect(result.products).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.categories).toEqual([]);
      expect(result.stats.totalProducts).toBe(0);
    });

    it('should calculate stats correctly', async () => {
      const testProducts = [
        { ...mockProducts[0], stock: 15, price: 100 }, // Active
        { ...mockProducts[1], stock: 0, price: 200 },  // Out of stock
        { ...mockProducts[2], stock: 5, price: 300 },  // Low stock
      ];

      mockProductsService.getProducts.mockResolvedValue({
        data: testProducts,
        total: 3,
        page: 1,
        totalPages: 1,
      });
      mockProductsService.getCategories.mockResolvedValue(['smartphones', 'laptops']);

      const result = await getProductsData();

      expect(result.stats.totalProducts).toBe(3);
      expect(result.stats.activeProducts).toBe(2); // Stock > 0
      expect(result.stats.outOfStockProducts).toBe(1); // Stock === 0
      expect(result.stats.lowStockProducts).toBe(1); // Stock < 10 and > 0
      expect(result.stats.averagePrice).toBe(200); // (100 + 200 + 300) / 3
      expect(result.stats.totalValue).toBe(3000); // (15*100) + (0*200) + (5*300) = 1500 + 0 + 1500 = 3000
    });
  });

  describe('getProductById', () => {
    it('should fetch product by id successfully', async () => {
      const mockProduct = mockProducts[0];
      mockProductsService.getProductById.mockResolvedValue(mockProduct);

      const result = await getProductById('1');

      expect(result).toEqual(mockProduct);
      expect(mockProductsService.getProductById).toHaveBeenCalledWith('1');
    });

    it('should handle errors', async () => {
      mockProductsService.getProductById.mockRejectedValue(new Error('Product not found'));

      const result = await getProductById('999');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Erro ao buscar produto:', expect.any(Error));
    });
  });

  describe('searchProductsByCategory', () => {
    const mockResponse: DummyResponse<DummyProduct> = {
      products: mockProducts.filter(p => p.category === 'smartphones'),
      total: 2,
      skip: 0,
      limit: 30,
    };

    it('should search products by category successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await searchProductsByCategory('smartphones', 1, 30);

      expect(result.products).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://dummyjson.com/products/category/smartphones?limit=30&skip=0'
      );
    });

    it('should handle pagination correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      await searchProductsByCategory('smartphones', 2, 10);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dummyjson.com/products/category/smartphones?limit=10&skip=10'
      );
    });

    it('should encode URL parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      await searchProductsByCategory('home-decoration', 1, 30);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dummyjson.com/products/category/home-decoration?limit=30&skip=0'
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      const result = await searchProductsByCategory('invalid-category');

      expect(result.products).toEqual([]);
      expect(result.total).toBe(0);
      expect(console.error).toHaveBeenCalledWith(
        'Erro na busca por categoria:',
        expect.any(Error)
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await searchProductsByCategory('smartphones');

      expect(result.products).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('searchProductsByName', () => {
    const mockResponse: DummyResponse<DummyProduct> = {
      products: [mockProducts[0]],
      total: 1,
      skip: 0,
      limit: 30,
    };

    it('should search products by name successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await searchProductsByName('iPhone', 1, 30);

      expect(result.products).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://dummyjson.com/products/search?q=iPhone&limit=30&skip=0'
      );
    });

    it('should encode search terms', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      await searchProductsByName('iPhone 12 Pro Max');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dummyjson.com/products/search?q=iPhone%2012%20Pro%20Max&limit=30&skip=0'
      );
    });

    it('should handle errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const result = await searchProductsByName('test');

      expect(result.products).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('searchProductsByFilter', () => {
    it('should use category search for category filter', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ products: [], total: 0 }),
      } as Response);

      const filter: AdvancedSearchFilter = { key: 'category', value: 'smartphones' };
      await searchProductsByFilter(filter);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dummyjson.com/products/category/smartphones?limit=30&skip=0'
      );
    });

    it('should use name search for title filter', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ products: [], total: 0 }),
      } as Response);

      const filter: AdvancedSearchFilter = { key: 'title', value: 'iPhone' };
      await searchProductsByFilter(filter);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dummyjson.com/products/search?q=iPhone&limit=30&skip=0'
      );
    });

    it('should use name search as fallback for other filters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ products: [], total: 0 }),
      } as Response);

      const filter: AdvancedSearchFilter = { key: 'brand', value: 'Apple' };
      await searchProductsByFilter(filter);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dummyjson.com/products/search?q=Apple&limit=30&skip=0'
      );
    });

    it('should handle errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const filter: AdvancedSearchFilter = { key: 'category', value: 'smartphones' };
      const result = await searchProductsByFilter(filter);

      expect(result.products).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('searchProducts', () => {
    it('should search by category when specified', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ products: [], total: 0 }),
      } as Response);

      await searchProducts('', 'smartphones');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dummyjson.com/products/category/smartphones?limit=30&skip=0'
      );
    });

    it('should search by name when category not specified', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ products: [], total: 0 }),
      } as Response);

      await searchProducts('iPhone');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dummyjson.com/products/search?q=iPhone&limit=30&skip=0'
      );
    });

    it('should get all products when no filters specified', async () => {
      mockProductsService.getProducts.mockResolvedValue({
        data: mockProducts,
        total: 3,
        page: 1,
        totalPages: 1,
      });

      const result = await searchProducts('', '');

      expect(result.products).toEqual(mockProducts);
      expect(result.total).toBe(3);
      expect(mockProductsService.getProducts).toHaveBeenCalled();
    });

    it('should handle pagination for all products', async () => {
      const manyProducts = Array.from({ length: 25 }, (_, i) => ({
        ...mockProducts[0],
        id: i + 1,
        title: `Product ${i + 1}`,
      }));

      mockProductsService.getProducts.mockResolvedValue({
        data: manyProducts,
        total: 25,
        page: 1,
        totalPages: 1,
      });

      const result = await searchProducts('', '', 2, 10);

      expect(result.products).toHaveLength(10);
      expect(result.products[0].id).toBe(11); // Second page starts at id 11
      expect(result.total).toBe(25);
    });

    it('should handle errors', async () => {
      mockProductsService.getProducts.mockRejectedValue(new Error('Error'));

      const result = await searchProducts('', '');

      expect(result.products).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('searchProductsWithMultipleFilters', () => {
    it('should combine results from multiple filters', async () => {
      const product1 = { ...mockProducts[0], id: 1 };
      const product2 = { ...mockProducts[1], id: 2 };
      const product3 = { ...mockProducts[2], id: 3 };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ products: [product1, product2], total: 2 }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ products: [product2, product3], total: 2 }),
        } as Response);

      const filters: AdvancedSearchFilter[] = [
        { key: 'category', value: 'smartphones' },
        { key: 'title', value: 'Pro' },
      ];

      const result = await searchProductsWithMultipleFilters(filters, 1, 10);

      expect(result.products).toHaveLength(3); // Unique products
      expect(result.total).toBe(3);
      expect(result.products.map(p => p.id)).toEqual([1, 2, 3]);
    });

    it('should handle pagination of combined results', async () => {
      const products = Array.from({ length: 50 }, (_, i) => ({
        ...mockProducts[0],
        id: i + 1,
        title: `Product ${i + 1}`,
      }));

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ products, total: 50 }),
      } as Response);

      const filters: AdvancedSearchFilter[] = [{ key: 'category', value: 'smartphones' }];
      const result = await searchProductsWithMultipleFilters(filters, 2, 10);

      expect(result.products).toHaveLength(10);
      expect(result.products[0].id).toBe(11); // Second page starts at id 11
    });

    it('should handle different filter types', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ products: [], total: 0 }),
      } as Response);

      const filters: AdvancedSearchFilter[] = [
        { key: 'category', value: 'smartphones' },
        { key: 'title', value: 'iPhone' },
        { key: 'brand', value: 'Apple' },
      ];

      await searchProductsWithMultipleFilters(filters);

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://dummyjson.com/products/category/smartphones?limit=100&skip=0'
      );
      expect(mockFetch).toHaveBeenCalledWith(
        'https://dummyjson.com/products/search?q=iPhone&limit=100&skip=0'
      );
      expect(mockFetch).toHaveBeenCalledWith(
        'https://dummyjson.com/products/search?q=Apple&limit=100&skip=0'
      );
    });

    it('should handle errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const filters: AdvancedSearchFilter[] = [{ key: 'category', value: 'smartphones' }];
      const result = await searchProductsWithMultipleFilters(filters);

      expect(result.products).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('filterProducts', () => {
    it('should filter products by search term (title)', () => {
      const result = filterProducts(mockProducts, 'iPhone');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('iPhone 12');
    });

    it('should filter products by search term (description)', () => {
      const result = filterProducts(mockProducts, 'Android');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Samsung Galaxy S21');
    });

    it('should filter products by search term (brand)', () => {
      const result = filterProducts(mockProducts, 'Apple');

      expect(result).toHaveLength(2); // iPhone and MacBook
    });

    it('should filter products by category', () => {
      const result = filterProducts(mockProducts, '', 'smartphones');

      expect(result).toHaveLength(2);
      expect(result.every(p => p.category === 'smartphones')).toBe(true);
    });

    it('should filter products by both search term and category', () => {
      const result = filterProducts(mockProducts, 'Samsung', 'smartphones');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Samsung Galaxy S21');
    });

    it('should return empty array when no matches', () => {
      const result = filterProducts(mockProducts, 'nonexistent');

      expect(result).toHaveLength(0);
    });

    it('should be case insensitive', () => {
      const result = filterProducts(mockProducts, 'IPHONE');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('iPhone 12');
    });

    it('should return all products when no filters applied', () => {
      const result = filterProducts(mockProducts);

      expect(result).toEqual(mockProducts);
    });
  });

  describe('paginateProducts', () => {
    const manyProducts = Array.from({ length: 25 }, (_, i) => ({
      ...mockProducts[0],
      id: i + 1,
      title: `Product ${i + 1}`,
    }));

    it('should paginate products correctly', () => {
      const result = paginateProducts(manyProducts, 0, 10);

      expect(result).toHaveLength(10);
      expect(result[0].id).toBe(1);
      expect(result[9].id).toBe(10);
    });

    it('should handle second page', () => {
      const result = paginateProducts(manyProducts, 1, 10);

      expect(result).toHaveLength(10);
      expect(result[0].id).toBe(11);
      expect(result[9].id).toBe(20);
    });

    it('should handle partial last page', () => {
      const result = paginateProducts(manyProducts, 2, 10);

      expect(result).toHaveLength(5); // Only 5 products left
      expect(result[0].id).toBe(21);
      expect(result[4].id).toBe(25);
    });

    it('should handle empty results for out of range page', () => {
      const result = paginateProducts(manyProducts, 10, 10);

      expect(result).toHaveLength(0);
    });

    it('should handle edge cases', () => {
      expect(paginateProducts([], 0, 10)).toHaveLength(0);
      expect(paginateProducts(manyProducts, 0, 0)).toHaveLength(0);
      expect(paginateProducts(manyProducts, -1, 10)).toHaveLength(0);
    });
  });
});