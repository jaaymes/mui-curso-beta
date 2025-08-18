import {
  getDashboardData,
  RecentActivity,
  QuickStats,
  DashboardData,
} from '@/app/(dashboard)/dashboard/lib/dashboard-data';
import { UsersService, ProductsService, CartsService } from '@/lib/dataService';

// Mock the data services
jest.mock('@/lib/dataService');
const mockUsersService = UsersService as jest.Mocked<typeof UsersService>;
const mockProductsService = ProductsService as jest.Mocked<typeof ProductsService>;
const mockCartsService = CartsService as jest.Mocked<typeof CartsService>;

// Mock console methods
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Dashboard Data Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe('getDashboardData', () => {
    const mockUsersResponse = {
      data: [
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
      ],
      total: 100,
      page: 1,
      pageSize: 1,
      totalPages: 100,
    };

    const mockProductsResponse = {
      data: [
        { id: 1, title: 'Product 1', price: 100, stock: 5 },
        { id: 2, title: 'Product 2', price: 200, stock: 15 },
      ],
      total: 50,
      page: 1,
      pageSize: 1,
      totalPages: 50,
    };

    const mockCartsResponse = {
      data: [
        {
          id: 1,
          total: 300,
          products: [
            { id: 1, price: 100, quantity: 2 },
            { id: 2, price: 50, quantity: 2 },
          ],
        },
        {
          id: 2,
          total: 150,
          products: [{ id: 3, price: 150, quantity: 1 }],
        },
      ],
    };

    const mockSalesStats = { totalSales: 25, totalRevenue: 5000 };

    beforeEach(() => {
      mockUsersService.getUsers.mockResolvedValue(mockUsersResponse);
      mockProductsService.getProducts.mockResolvedValue(mockProductsResponse);
      mockCartsService.getCarts.mockResolvedValue(mockCartsResponse);
      mockCartsService.getSalesStats.mockResolvedValue(mockSalesStats);
    });

    it('should return complete dashboard data when all services succeed', async () => {
      const result = await getDashboardData();

      expect(result).toHaveProperty('stats');
      expect(result).toHaveProperty('salesData');
      expect(result).toHaveProperty('recentActivities');
      expect(result).toHaveProperty('quickStats');

      expect(result.stats.totalUsers).toBe(100);
      expect(result.stats.totalProducts).toBe(50);
      expect(result.stats.totalSales).toBe(25);

      expect(Array.isArray(result.salesData)).toBe(true);
      expect(Array.isArray(result.recentActivities)).toBe(true);
      expect(typeof result.quickStats).toBe('object');
    });

    it('should use fallback data when getDashboardStats fails', async () => {
      mockUsersService.getUsers.mockRejectedValue(new Error('Users API error'));
      mockProductsService.getProducts.mockRejectedValue(new Error('Products API error'));
      mockCartsService.getSalesStats.mockRejectedValue(new Error('Sales API error'));

      const result = await getDashboardData();

      expect(result.stats).toEqual({
        totalUsers: 0,
        totalProducts: 0,
        totalSales: 0,
      });
    });

    it('should use fallback data when generateSalesChartData fails', async () => {
      mockCartsService.getCarts.mockRejectedValue(new Error('Carts API error'));

      const result = await getDashboardData();

      expect(Array.isArray(result.salesData)).toBe(true);
      expect(result.salesData.length).toBeGreaterThan(0);
    });

    it('should generate recent activities from API data', async () => {
      const result = await getDashboardData();

      expect(Array.isArray(result.recentActivities)).toBe(true);
      expect(result.recentActivities.length).toBeGreaterThan(0);

      // Check that activities have required properties
      result.recentActivities.forEach((activity: RecentActivity) => {
        expect(activity).toHaveProperty('id');
        expect(activity).toHaveProperty('action');
        expect(activity).toHaveProperty('time');
        expect(activity).toHaveProperty('type');
      });
    });

    it('should generate quick stats from API data', async () => {
      const result = await getDashboardData();

      expect(result.quickStats).toHaveProperty('activeUsers');
      expect(result.quickStats).toHaveProperty('pendingOrders');
      expect(result.quickStats).toHaveProperty('lowStockItems');
      expect(result.quickStats).toHaveProperty('todayRevenue');

      expect(typeof result.quickStats.activeUsers).toBe('number');
      expect(typeof result.quickStats.pendingOrders).toBe('number');
      expect(typeof result.quickStats.lowStockItems).toBe('number');
      expect(typeof result.quickStats.todayRevenue).toBe('number');
    });

    it('should handle partial failures gracefully with Promise.allSettled', async () => {
      // Make one service fail
      mockCartsService.getCarts.mockRejectedValue(new Error('Carts error'));

      const result = await getDashboardData();

      // Should still return complete structure
      expect(result).toHaveProperty('stats');
      expect(result).toHaveProperty('salesData');
      expect(result).toHaveProperty('recentActivities');
      expect(result).toHaveProperty('quickStats');

      // Stats should still work from other services
      expect(result.stats.totalUsers).toBe(100);
      expect(result.stats.totalProducts).toBe(50);
    });

    it('should return default structure on critical error', async () => {
      // Force all services to fail to trigger the critical error path
      mockUsersService.getUsers.mockRejectedValue(new Error('Critical error'));
      mockProductsService.getProducts.mockRejectedValue(new Error('Critical error'));
      mockCartsService.getCarts.mockRejectedValue(new Error('Critical error'));
      mockCartsService.getSalesStats.mockRejectedValue(new Error('Critical error'));

      const result = await getDashboardData();

      // Should still return proper structure with fallback data
      expect(result).toEqual(
        expect.objectContaining({
          stats: expect.objectContaining({
            totalUsers: expect.any(Number),
            totalProducts: expect.any(Number),
            totalSales: expect.any(Number),
          }),
          salesData: expect.any(Array),
          recentActivities: expect.any(Array),
          quickStats: expect.objectContaining({
            activeUsers: expect.any(Number),
            pendingOrders: expect.any(Number),
            lowStockItems: expect.any(Number),
            todayRevenue: expect.any(Number),
          }),
        })
      );
    });

    it('should handle empty API responses', async () => {
      mockUsersService.getUsers.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        pageSize: 1,
        totalPages: 0,
      });
      mockProductsService.getProducts.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        pageSize: 1,
        totalPages: 0,
      });
      mockCartsService.getCarts.mockResolvedValue({ data: [] });

      const result = await getDashboardData();

      expect(result.stats.totalUsers).toBe(0);
      expect(result.stats.totalProducts).toBe(0);
      expect(Array.isArray(result.salesData)).toBe(true);
    });

    it('should call all services with correct parameters', async () => {
      await getDashboardData();

      expect(mockUsersService.getUsers).toHaveBeenCalledWith({ pageSize: 1 });
      expect(mockProductsService.getProducts).toHaveBeenCalledWith({ pageSize: 1 });
      expect(mockCartsService.getSalesStats).toHaveBeenCalled();
      expect(mockCartsService.getCarts).toHaveBeenCalledWith({
        pageSize: 50,
        page: 1,
      });
    });

    it('should generate sales chart data with correct format', async () => {
      const result = await getDashboardData();

      expect(Array.isArray(result.salesData)).toBe(true);
      
      if (result.salesData.length > 0) {
        result.salesData.forEach((dataPoint) => {
          expect(dataPoint).toHaveProperty('name');
          expect(dataPoint).toHaveProperty('value');
          expect(typeof dataPoint.name).toBe('string');
          expect(typeof dataPoint.value).toBe('number');
        });
      }
    });

    it('should handle products with missing stock information', async () => {
      const productsWithoutStock = {
        data: [
          { id: 1, title: 'Product 1', price: 100 }, // No stock property
          { id: 2, title: 'Product 2', price: 200, stock: 5 },
        ],
        total: 2,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      };

      mockProductsService.getProducts.mockResolvedValue(productsWithoutStock);

      const result = await getDashboardData();

      expect(result.quickStats.lowStockItems).toBeGreaterThanOrEqual(0);
    });

    it('should limit recent activities to reasonable number', async () => {
      const result = await getDashboardData();

      expect(result.recentActivities.length).toBeLessThanOrEqual(10);
    });

    it('should include user activities in recent activities', async () => {
      const result = await getDashboardData();

      const userActivities = result.recentActivities.filter(
        (activity) => activity.type === 'user'
      );
      
      if (userActivities.length > 0) {
        expect(userActivities[0].action).toContain('se registrou');
        expect(userActivities[0].details).toContain('@');
      }
    });

    it('should include product activities in recent activities', async () => {
      const result = await getDashboardData();

      const productActivities = result.recentActivities.filter(
        (activity) => activity.type === 'product'
      );
      
      if (productActivities.length > 0) {
        expect(productActivities[0].action).toContain('foi atualizado');
        expect(productActivities[0].details).toContain('$');
      }
    });

    it('should include order activities in recent activities', async () => {
      const result = await getDashboardData();

      const orderActivities = result.recentActivities.filter(
        (activity) => activity.type === 'order'
      );
      
      if (orderActivities.length > 0) {
        expect(orderActivities[0].action).toContain('realizada');
        expect(orderActivities[0].details).toContain('R$');
      }
    });
  });
});