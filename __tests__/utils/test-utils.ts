import { render, RenderOptions } from "@testing-library/react";
import React from "react";

// Simple wrapper for basic component testing
const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(React.Fragment, null, children);
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };

// Mock data factories for User interface (app format)
export const createMockUser = (overrides: Partial<any> = {}) => ({
  id: "1",
  email: "john@example.com",
  name: "John Doe",
  avatar: "https://example.com/avatar.jpg",
  role: "user" as const,
  createdAt: "2024-01-01T10:00:00.000Z",
  updatedAt: "2024-01-15T15:30:00.000Z",
  firstName: "John",
  lastName: "Doe",
  username: "johndoe",
  phone: "123-456-7890",
  age: 30,
  company: "Test Company",
  ...overrides,
});

// Mock data factory for Product interface (app format)
export const createMockProduct = (overrides: Partial<any> = {}) => ({
  id: "1",
  name: "Test Product",
  description: "This is a test product description",
  price: 29.99,
  category: "Electronics",
  stock: 100,
  imageUrl: "https://example.com/image1.jpg",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  brand: "Test Brand",
  rating: 4.5,
  discountPercentage: 10,
  thumbnail: "https://example.com/thumb.jpg",
  images: ["https://example.com/image1.jpg"],
  ...overrides,
});

export const createMockStats = (overrides: Partial<any> = {}) => ({
  totalUsers: 1000,
  totalProducts: 500,
  totalOrders: 250,
  revenue: 50000,
  ...overrides,
});

// Common test patterns
export const waitForLoadingToFinish = async () => {
  const { waitFor, screen } = await import("@testing-library/react");
  return waitFor(() => {
    const loading = screen.queryByText(/loading/i);
    if (loading) throw new Error("Still loading");
  });
};

export const expectErrorMessage = async (message: string) => {
  const { screen, waitFor } = await import("@testing-library/react");
  return waitFor(() => {
    const errorElement = screen.getByText(message);
    if (!errorElement) throw new Error("Error message not found");
  });
};
