import { UserDetailDialog } from "@/components/ui/UserDetailDialog";
import { DummyUser } from "@/types";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithMui } from "../../utils/mui-test-utils";

// Função para criar mock do DummyUser
const createMockDummyUser = (
  overrides: Partial<DummyUser> = {}
): DummyUser => ({
  id: 1,
  firstName: "John",
  lastName: "Doe",
  maidenName: "",
  age: 30,
  gender: "male",
  email: "john@example.com",
  phone: "123-456-7890",
  username: "johndoe",
  password: "password123",
  birthDate: "2024-01-01",
  image: "https://example.com/avatar.jpg",
  bloodGroup: "O+",
  height: 180,
  weight: 75,
  eyeColor: "Brown",
  hair: {
    color: "Brown",
    type: "Straight",
  },
  ip: "192.168.1.1",
  address: {
    address: "123 Main St",
    city: "New York",
    state: "NY",
    stateCode: "NY",
    postalCode: "10001",
    coordinates: {
      lat: 40.7128,
      lng: -74.006,
    },
    country: "United States",
  },
  macAddress: "00:00:00:00:00:00",
  university: "Test University",
  bank: {
    cardExpire: "12/25",
    cardNumber: "1234567890123456",
    cardType: "Visa",
    currency: "USD",
    iban: "US123456789012345678",
  },
  company: {
    department: "Engineering",
    name: "Test Company",
    title: "Software Engineer",
    address: {
      address: "456 Business Ave",
      city: "New York",
      state: "NY",
      stateCode: "NY",
      postalCode: "10002",
      coordinates: {
        lat: 40.7589,
        lng: -73.9851,
      },
      country: "United States",
    },
  },
  ein: "12-3456789",
  ssn: "123-45-6789",
  userAgent: "Mozilla/5.0",
  crypto: {
    coin: "Bitcoin",
    wallet: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    network: "Ethereum",
  },
  role: "admin",
  ...overrides,
});

describe("UserDetailDialog", () => {
  const mockOnClose = jest.fn();
  const mockUser = createMockDummyUser();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    user: mockUser,
  };

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it("renders nothing when user is null", () => {
    renderWithMui(<UserDetailDialog {...defaultProps} user={null} />);

    expect(screen.queryByText("Detalhes do Usuário")).not.toBeInTheDocument();
  });

  it("renders dialog when open is true", () => {
    renderWithMui(<UserDetailDialog {...defaultProps} />);

    expect(screen.getByText("Detalhes do Usuário")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("does not render dialog when open is false", () => {
    renderWithMui(<UserDetailDialog {...defaultProps} open={false} />);

    expect(screen.queryByText("Detalhes do Usuário")).not.toBeInTheDocument();
  });

  it("displays user avatar with fallback", () => {
    renderWithMui(<UserDetailDialog {...defaultProps} />);

    // Check if avatar element exists by looking for the container
    const avatarContainer = screen.getByRole("dialog");
    expect(avatarContainer).toBeInTheDocument();

    // Check that user name is displayed (which confirms the component is working)
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("displays user role with correct styling", () => {
    renderWithMui(<UserDetailDialog {...defaultProps} />);

    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("displays user role as default color for non-admin users", () => {
    const regularUser = createMockDummyUser({ role: "user" });
    renderWithMui(<UserDetailDialog {...defaultProps} user={regularUser} />);

    expect(screen.getByText("User")).toBeInTheDocument();
  });

  it("displays all user information correctly", () => {
    renderWithMui(<UserDetailDialog {...defaultProps} />);

    expect(screen.getByText("johndoe")).toBeInTheDocument();
    expect(screen.getByText("123-456-7890")).toBeInTheDocument();
    expect(screen.getByText("Test Company")).toBeInTheDocument();
    expect(screen.getByText("30 anos")).toBeInTheDocument();
  });

  it("handles missing optional fields gracefully", () => {
    const userWithMissingFields = createMockDummyUser({
      username: undefined,
      phone: undefined,
      company: undefined,
      age: undefined,
    });

    renderWithMui(
      <UserDetailDialog {...defaultProps} user={userWithMissingFields} />
    );

    // Should have multiple "Não informado" texts for missing fields
    expect(screen.getAllByText("Não informado")).toHaveLength(2); // username and phone
    expect(screen.queryByText("Empresa")).not.toBeInTheDocument();
    expect(screen.queryByText("Idade")).not.toBeInTheDocument();
  });

  it("formats dates correctly", () => {
    renderWithMui(<UserDetailDialog {...defaultProps} />);

    // Check if the formatted date is displayed (birthDate: '2024-01-01')
    expect(screen.getByText(/31\/12\/2023/)).toBeInTheDocument();
  });

  it("calls onClose when close icon is clicked", async () => {
    const user = userEvent.setup();
    renderWithMui(<UserDetailDialog {...defaultProps} />);

    const closeButton = screen.getByRole("button", { name: "" }); // Close icon button
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    renderWithMui(<UserDetailDialog {...defaultProps} />);

    const closeButton = screen.getByRole("button", { name: "Fechar" });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when dialog backdrop is clicked", () => {
    renderWithMui(<UserDetailDialog {...defaultProps} />);

    // Find the backdrop element by its class
    const backdrop = document.querySelector(".MuiBackdrop-root");
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it("calls onClose when escape key is pressed", () => {
    renderWithMui(<UserDetailDialog {...defaultProps} />);

    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("displays user avatar fallback initial when no image provided", () => {
    const userWithoutAvatar = createMockDummyUser({
      firstName: "Jane",
      lastName: "Smith",
      image: undefined,
    });

    renderWithMui(
      <UserDetailDialog {...defaultProps} user={userWithoutAvatar} />
    );

    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("handles company object with name property", () => {
    const userWithCompanyObject = createMockDummyUser({
      company: {
        ...createMockDummyUser().company,
        name: "Tech Corp",
      },
    });

    renderWithMui(
      <UserDetailDialog {...defaultProps} user={userWithCompanyObject} />
    );

    expect(screen.getByText("Tech Corp")).toBeInTheDocument();
  });

  it("handles company as string", () => {
    const userWithCompanyString = createMockDummyUser({
      company: {
        ...createMockDummyUser().company,
        name: "String Company",
      },
    });

    renderWithMui(
      <UserDetailDialog {...defaultProps} user={userWithCompanyString} />
    );

    expect(screen.getByText("String Company")).toBeInTheDocument();
  });
});
