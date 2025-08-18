import {
  LoginFormData,
  loginSchema,
  ProductFormData,
  productSchema,
  UserFormData,
  userSchema,
} from "@/lib/validations";

describe("Validation Schemas", () => {
  describe("loginSchema", () => {
    it("validates correct login data", () => {
      const validData: LoginFormData = {
        username: "testuser",
        password: "password123",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects short username", () => {
      const invalidData = {
        username: "ab",
        password: "password123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "pelo menos 3 caracteres"
        );
      }
    });

    it("rejects short password", () => {
      const invalidData = {
        username: "testuser",
        password: "123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "pelo menos 6 caracteres"
        );
      }
    });
  });

  describe("userSchema", () => {
    it("validates correct user data", () => {
      const validData: UserFormData = {
        name: "John Doe",
        email: "john@example.com",
        role: "user",
      };

      const result = userSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects short name", () => {
      const invalidData = {
        name: "J",
        email: "john@example.com",
        role: "user",
      };

      const result = userSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "pelo menos 2 caracteres"
        );
      }
    });

    it("rejects invalid role", () => {
      const invalidData = {
        name: "John Doe",
        email: "john@example.com",
        role: "invalid",
      };

      const result = userSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("productSchema", () => {
    it("validates correct product data", () => {
      const validData: ProductFormData = {
        name: "Test Product",
        description: "This is a test product description",
        price: 29.99,
        category: "Electronics",
        stock: 100,
      };

      const result = productSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects negative price", () => {
      const invalidData = {
        name: "Test Product",
        description: "This is a test product description",
        price: -10,
        category: "Electronics",
        stock: 100,
      };

      const result = productSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("maior que 0");
      }
    });

    it("rejects negative stock", () => {
      const invalidData = {
        name: "Test Product",
        description: "This is a test product description",
        price: 29.99,
        category: "Electronics",
        stock: -5,
      };

      const result = productSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "não pode ser negativo"
        );
      }
    });
  });
});
