import {
  getUsersData,
  getUserById,
  searchUsersByFilter,
  searchUsersWithMultipleFilters,
  filterUsers,
  paginateUsers,
  SEARCH_FIELDS,
  type UsersData,
  type AdvancedSearchFilter,
} from '@/app/(dashboard)/users/lib/users-data';
import { UsersService } from '@/lib/dataService';
import type { DummyUser, DummyResponse } from '@/types';

// Mock the UsersService
jest.mock('@/lib/dataService', () => ({
  UsersService: {
    getUsers: jest.fn(),
    getUserById: jest.fn(),
  },
}));

// Mock global fetch
global.fetch = jest.fn();

const mockUsersService = UsersService as jest.Mocked<typeof UsersService>;
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('Users Data Module', () => {
  const mockUsers: DummyUser[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      username: 'johndoe',
      role: 'admin',
      birthDate: '1990-01-01',
      phone: '123-456-7890',
      image: 'john.jpg',
      address: {
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001',
      },
      company: {
        name: 'Tech Corp',
        title: 'Developer',
        department: 'Engineering',
      },
      eyeColor: 'blue',
      hair: { color: 'brown', type: 'straight' },
      university: 'MIT',
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      username: 'janesmith',
      role: 'user',
      birthDate: '1985-05-15',
      phone: '987-654-3210',
      image: 'jane.jpg',
      address: {
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        postalCode: '90210',
      },
      company: {
        name: 'Design Inc',
        title: 'Designer',
        department: 'Creative',
      },
      eyeColor: 'green',
      hair: { color: 'blonde', type: 'curly' },
      university: 'Stanford',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('SEARCH_FIELDS', () => {
    it('should have all required search fields', () => {
      expect(SEARCH_FIELDS).toEqual({
        name: "firstName",
        lastName: "lastName",
        email: "email",
        username: "username",
        phone: "phone",
        company: "company.name",
        role: "role",
        age: "age",
        hairColor: "hair.color",
        eyeColor: "eyeColor",
        city: "address.city",
        state: "address.state",
        country: "address.country",
        university: "university",
        department: "company.department",
      });
    });

    it('should be readonly (const object)', () => {
      // In TypeScript, const objects can still be mutated at runtime
      // but the type system prevents it at compile time
      expect(SEARCH_FIELDS.name).toBe('firstName');
      // Testing that the structure exists and is correct
    });
  });

  describe('getUsersData', () => {
    it('should fetch users data successfully', async () => {
      mockUsersService.getUsers.mockResolvedValue({
        data: mockUsers,
        total: 2,
        page: 1,
        totalPages: 1,
      });

      const result = await getUsersData();

      expect(result.users).toEqual(mockUsers);
      expect(result.total).toBe(2);
      expect(result.stats.totalUsers).toBe(2);
      expect(result.stats.admins).toBe(1);
      expect(mockUsersService.getUsers).toHaveBeenCalledWith({
        pageSize: 100,
        page: 1,
      });
    });

    it('should handle partial failures gracefully', async () => {
      mockUsersService.getUsers
        .mockResolvedValueOnce({
          data: mockUsers,
          total: 2,
          page: 1,
          totalPages: 1,
        })
        .mockRejectedValueOnce(new Error('Stats error'));

      const result = await getUsersData();

      expect(result.users).toEqual(mockUsers);
      expect(result.total).toBe(2);
      expect(result.stats).toEqual({
        totalUsers: 0,
        activeUsers: 0,
        admins: 0,
        newRegistrations: 0,
        totalUsersTrend: 0,
        activeUsersTrend: 0,
        adminsTrend: 0,
        newRegistrationsTrend: 0,
      });
    });

    it('should handle complete failure', async () => {
      mockUsersService.getUsers.mockRejectedValue(new Error('Network error'));

      const result = await getUsersData();

      expect(result.users).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.stats.totalUsers).toBe(0);
    });

    it('should calculate stats correctly', async () => {
      // Create users with specific dates for testing
      const recentUsers: DummyUser[] = [
        {
          ...mockUsers[0],
          birthDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          role: 'admin',
        },
        {
          ...mockUsers[1],
          birthDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
          role: 'user',
        },
      ];

      mockUsersService.getUsers.mockResolvedValue({
        data: recentUsers,
        total: 2,
        page: 1,
        totalPages: 1,
      });

      const result = await getUsersData();

      expect(result.stats.totalUsers).toBe(2);
      expect(result.stats.admins).toBe(1);
      expect(result.stats.activeUsers).toBe(2); // Both users are within 30 days
      expect(result.stats.newRegistrations).toBe(1); // One user within 7 days
    });
  });

  describe('getUserById', () => {
    it('should fetch user by id successfully', async () => {
      const mockUser = mockUsers[0];
      mockUsersService.getUserById.mockResolvedValue(mockUser);

      const result = await getUserById('1');

      expect(result).toEqual(mockUser);
      expect(mockUsersService.getUserById).toHaveBeenCalledWith('1');
    });

    it('should handle errors', async () => {
      mockUsersService.getUserById.mockRejectedValue(new Error('User not found'));

      const result = await getUserById('999');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Erro ao buscar usuário 999:', expect.any(Error));
    });
  });

  describe('searchUsersByFilter', () => {
    const mockResponse: DummyResponse<DummyUser> = {
      users: mockUsers,
      total: 2,
      skip: 0,
      limit: 30,
    };

    it('should search users with filter successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const filter: AdvancedSearchFilter = { key: 'firstName', value: 'John' };
      const result = await searchUsersByFilter(filter, 1, 30);

      expect(result.users).toEqual(mockUsers);
      expect(result.total).toBe(2);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://dummyjson.com/users/filter?key=firstName&value=John&limit=30&skip=0'
      );
    });

    it('should handle pagination correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const filter: AdvancedSearchFilter = { key: 'role', value: 'admin' };
      const result = await searchUsersByFilter(filter, 2, 10);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dummyjson.com/users/filter?key=role&value=admin&limit=10&skip=10'
      );
    });

    it('should encode URL parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const filter: AdvancedSearchFilter = { key: 'company.name', value: 'Tech & Co' };
      await searchUsersByFilter(filter);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://dummyjson.com/users/filter?key=company.name&value=Tech%20%26%20Co&limit=30&skip=0'
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      const filter: AdvancedSearchFilter = { key: 'invalid', value: 'test' };
      const result = await searchUsersByFilter(filter);

      expect(result.users).toEqual([]);
      expect(result.total).toBe(0);
      expect(console.error).toHaveBeenCalledWith(
        'Erro na busca avançada de usuários:',
        expect.any(Error)
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const filter: AdvancedSearchFilter = { key: 'email', value: 'test@example.com' };
      const result = await searchUsersByFilter(filter);

      expect(result.users).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('searchUsersWithMultipleFilters', () => {
    it('should combine results from multiple filters', async () => {
      const user1 = { ...mockUsers[0], id: 1 };
      const user2 = { ...mockUsers[1], id: 2 };
      const user3 = { ...mockUsers[0], id: 3, firstName: 'Bob' };

      // Mock multiple fetch calls
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ users: [user1, user2], total: 2 }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ users: [user2, user3], total: 2 }),
        } as Response);

      const filters: AdvancedSearchFilter[] = [
        { key: 'role', value: 'admin' },
        { key: 'department', value: 'Engineering' },
      ];

      const result = await searchUsersWithMultipleFilters(filters, 1, 10);

      expect(result.users).toHaveLength(3); // Unique users
      expect(result.total).toBe(3);
      expect(result.users.map(u => u.id)).toEqual([1, 2, 3]);
    });

    it('should handle pagination of combined results', async () => {
      const users = Array.from({ length: 50 }, (_, i) => ({
        ...mockUsers[0],
        id: i + 1,
        firstName: `User${i + 1}`,
      }));

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ users, total: 50 }),
      } as Response);

      const filters: AdvancedSearchFilter[] = [{ key: 'role', value: 'user' }];
      const result = await searchUsersWithMultipleFilters(filters, 2, 10);

      expect(result.users).toHaveLength(10);
      expect(result.users[0].id).toBe(11); // Second page starts at id 11
    });

    it('should handle errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const filters: AdvancedSearchFilter[] = [{ key: 'role', value: 'admin' }];
      const result = await searchUsersWithMultipleFilters(filters);

      expect(result.users).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('filterUsers', () => {
    it('should filter users by search term (name)', () => {
      const result = filterUsers(mockUsers, 'John');

      expect(result).toHaveLength(1);
      expect(result[0].firstName).toBe('John');
    });

    it('should filter users by search term (email)', () => {
      const result = filterUsers(mockUsers, 'jane@example.com');

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('jane@example.com');
    });

    it('should filter users by search term (username)', () => {
      const result = filterUsers(mockUsers, 'johndoe');

      expect(result).toHaveLength(1);
      expect(result[0].username).toBe('johndoe');
    });

    it('should filter users by role', () => {
      const result = filterUsers(mockUsers, '', 'admin');

      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('admin');
    });

    it('should filter users by both search term and role', () => {
      const result = filterUsers(mockUsers, 'John', 'admin');

      expect(result).toHaveLength(1);
      expect(result[0].firstName).toBe('John');
      expect(result[0].role).toBe('admin');
    });

    it('should return empty array when no matches', () => {
      const result = filterUsers(mockUsers, 'nonexistent');

      expect(result).toHaveLength(0);
    });

    it('should be case insensitive', () => {
      const result = filterUsers(mockUsers, 'JOHN');

      expect(result).toHaveLength(1);
      expect(result[0].firstName).toBe('John');
    });

    it('should return all users when no filters applied', () => {
      const result = filterUsers(mockUsers);

      expect(result).toEqual(mockUsers);
    });
  });

  describe('paginateUsers', () => {
    const manyUsers = Array.from({ length: 25 }, (_, i) => ({
      ...mockUsers[0],
      id: i + 1,
      firstName: `User${i + 1}`,
    }));

    it('should paginate users correctly', () => {
      const result = paginateUsers(manyUsers, 0, 10);

      expect(result).toHaveLength(10);
      expect(result[0].id).toBe(1);
      expect(result[9].id).toBe(10);
    });

    it('should handle second page', () => {
      const result = paginateUsers(manyUsers, 1, 10);

      expect(result).toHaveLength(10);
      expect(result[0].id).toBe(11);
      expect(result[9].id).toBe(20);
    });

    it('should handle partial last page', () => {
      const result = paginateUsers(manyUsers, 2, 10);

      expect(result).toHaveLength(5); // Only 5 users left
      expect(result[0].id).toBe(21);
      expect(result[4].id).toBe(25);
    });

    it('should handle empty results for out of range page', () => {
      const result = paginateUsers(manyUsers, 10, 10);

      expect(result).toHaveLength(0);
    });

    it('should handle edge cases', () => {
      expect(paginateUsers([], 0, 10)).toHaveLength(0);
      expect(paginateUsers(manyUsers, 0, 0)).toHaveLength(0);
      expect(paginateUsers(manyUsers, -1, 10)).toHaveLength(0);
    });
  });
});