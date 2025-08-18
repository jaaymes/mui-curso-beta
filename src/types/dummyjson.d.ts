// DummyJSON API Type Definitions

export interface DummyUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  image: string;
  address: {
    address: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    postalCode: string;
    state: string;
  };
  phone: string;
  birthDate: string;
  age: number;
}

export interface DummyProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

export interface DummyCategory {
  slug: string;
  name: string;
  url: string;
}

export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token: string;
  refreshToken: string;
}

export interface ApiErrorResponse {
  message: string;
  status: number;
}

export interface PaginatedResponse<T> {
  total: number;
  skip: number;
  limit: number;
  data: T[];
}

export interface LoginCredentials {
  username: string;
  password: string;
  expiresInMins?: number;
}

export interface TokenRefreshRequest {
  refreshToken: string;
  expiresInMins?: number;
}

// Cart Types
export interface DummyCartProduct {
  id: number;
  title: string;
  price: number;
  quantity: number;
  total: number;
  discountPercentage: number;
  discountedPrice: number;
  thumbnail: string;
}

export interface DummyCart {
  id: number;
  products: DummyCartProduct[];
  total: number;
  discountedTotal: number;
  userId: number;
  totalProducts: number;
  totalQuantity: number;
}

export interface DummyCartsResponse {
  carts: DummyCart[];
  total: number;
  skip: number;
  limit: number;
}

// Example Usage Patterns
export class DummyJsonClient {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch('https://dummyjson.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return response.json();
  }

  static async getUsers(
    limit = 10, 
    skip = 0, 
    select?: string[]
  ): Promise<PaginatedResponse<DummyUser>> {
    const url = new URL('https://dummyjson.com/users');
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('skip', skip.toString());
    if (select) {
      url.searchParams.set('select', select.join(','));
    }

    const response = await fetch(url.toString());
    return response.json();
  }
}