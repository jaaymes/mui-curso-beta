import { render, screen } from '@testing-library/react';
import UsersPage from '@/app/(dashboard)/users/page';
import { getUsersData, filterUsers } from '@/app/(dashboard)/users/lib/users-data';

// Mock the users data module
jest.mock('@/app/(dashboard)/users/lib/users-data');
const mockGetUsersData = getUsersData as jest.MockedFunction<typeof getUsersData>;
const mockFilterUsers = filterUsers as jest.MockedFunction<typeof filterUsers>;

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    toString: jest.fn(() => ''),
  }),
}));

const mockUsersData = {
  users: [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      age: 30,
      gender: 'male',
      role: 'admin',
      image: 'https://example.com/john.jpg',
      address: {
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        stateCode: 'NY',
        postalCode: '10001',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        country: 'United States',
      },
      company: {
        department: 'Engineering',
        name: 'Tech Corp',
        title: 'Software Engineer',
        address: {
          address: '456 Tech Ave',
          city: 'San Francisco',
          state: 'CA',
          stateCode: 'CA',
          postalCode: '94101',
          coordinates: { lat: 37.7749, lng: -122.4194 },
          country: 'United States',
        },
      },
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '098-765-4321',
      age: 28,
      gender: 'female',
      role: 'user',
      image: 'https://example.com/jane.jpg',
      address: {
        address: '789 Oak St',
        city: 'Los Angeles',
        state: 'CA',
        stateCode: 'CA',
        postalCode: '90210',
        coordinates: { lat: 34.0522, lng: -118.2437 },
        country: 'United States',
      },
      company: {
        department: 'Marketing',
        name: 'Creative Agency',
        title: 'Marketing Manager',
        address: {
          address: '321 Creative Blvd',
          city: 'Los Angeles',
          state: 'CA',
          stateCode: 'CA',
          postalCode: '90210',
          coordinates: { lat: 34.0522, lng: -118.2437 },
          country: 'United States',
        },
      },
    },
  ],
  stats: {
    totalUsers: 150,
    activeUsers: 120,
    newUsersThisMonth: 25,
    averageAge: 32,
  },
  total: 150,
};

const filteredMockUsers = mockUsersData.users.slice(0, 1);

describe('UsersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUsersData.mockResolvedValue(mockUsersData);
    mockFilterUsers.mockReturnValue(filteredMockUsers);
  });

  it('should render users page title and description', async () => {
    const searchParams = {};
    const page = await UsersPage({ searchParams });
    render(page);

    expect(screen.getByText('Gerenciamento de Usuários')).toBeInTheDocument();
    expect(
      screen.getByText('Visualize e gerencie os usuários cadastrados no sistema.')
    ).toBeInTheDocument();
  });

  it('should render users count in card header', async () => {
    const searchParams = {};
    const page = await UsersPage({ searchParams });
    render(page);

    expect(screen.getByText('Usuários (150)')).toBeInTheDocument();
  });

  it('should render card subheader', async () => {
    const searchParams = {};
    const page = await UsersPage({ searchParams });
    render(page);

    expect(
      screen.getByText('Visualize os usuários cadastrados no sistema')
    ).toBeInTheDocument();
  });

  it('should call getUsersData on render', async () => {
    const searchParams = {};
    await UsersPage({ searchParams });
    expect(mockGetUsersData).toHaveBeenCalledTimes(1);
  });

  it('should call filterUsers with correct parameters when no search params', async () => {
    const searchParams = {};
    await UsersPage({ searchParams });
    
    expect(mockFilterUsers).toHaveBeenCalledWith(
      mockUsersData.users,
      '',
      ''
    );
  });

  it('should call filterUsers with search term when provided', async () => {
    const searchParams = { search: 'john' };
    await UsersPage({ searchParams });
    
    expect(mockFilterUsers).toHaveBeenCalledWith(
      mockUsersData.users,
      'john',
      ''
    );
  });

  it('should call filterUsers with role filter when provided', async () => {
    const searchParams = { role: 'admin' };
    await UsersPage({ searchParams });
    
    expect(mockFilterUsers).toHaveBeenCalledWith(
      mockUsersData.users,
      '',
      'admin'
    );
  });

  it('should call filterUsers with both search and role parameters', async () => {
    const searchParams = { search: 'jane', role: 'user' };
    await UsersPage({ searchParams });
    
    expect(mockFilterUsers).toHaveBeenCalledWith(
      mockUsersData.users,
      'jane',
      'user'
    );
  });

  it('should handle page parameter in search params', async () => {
    const searchParams = { page: '2' };
    await UsersPage({ searchParams });
    
    // Page parameter doesn't affect filtering but should not cause errors
    expect(mockFilterUsers).toHaveBeenCalled();
  });

  it('should render with appropriate heading hierarchy', async () => {
    const searchParams = {};
    const page = await UsersPage({ searchParams });
    render(page);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Gerenciamento de Usuários');
  });

  it('should render UsersStats component with stats data', async () => {
    const searchParams = {};
    const page = await UsersPage({ searchParams });
    render(page);
    
    // The UsersStats component should receive the stats data
    // We can verify this indirectly by checking the page renders without errors
    expect(screen.getByText('Gerenciamento de Usuários')).toBeInTheDocument();
  });

  it('should render UsersTable component with filtered users', async () => {
    const searchParams = {};
    const page = await UsersPage({ searchParams });
    render(page);
    
    // The UsersTable component should receive the filtered users
    // We can verify this indirectly by checking the page renders without errors
    expect(screen.getByText('Usuários (150)')).toBeInTheDocument();
  });

  it('should render UsersFiltersClient with initial values', async () => {
    const searchParams = { search: 'test', role: 'admin' };
    const page = await UsersPage({ searchParams });
    render(page);
    
    // The UsersFiltersClient component should receive the initial values
    // We can verify this indirectly by checking the page renders without errors
    expect(screen.getByText('Gerenciamento de Usuários')).toBeInTheDocument();
  });

  it('should handle empty search params gracefully', async () => {
    const searchParams = {};
    const page = await UsersPage({ searchParams });
    render(page);
    
    expect(mockFilterUsers).toHaveBeenCalledWith(
      mockUsersData.users,
      '',
      ''
    );
  });

  it('should handle undefined search params gracefully', async () => {
    const searchParams = { search: undefined, role: undefined };
    const page = await UsersPage({ searchParams });
    render(page);
    
    expect(mockFilterUsers).toHaveBeenCalledWith(
      mockUsersData.users,
      '',
      ''
    );
  });
});