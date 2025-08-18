import {
  AUTH_COOKIE_NAMES,
  DEFAULT_COOKIE_CONFIG,
  type AuthCookieData,
  type CookieData,
  type CookieOptions,
} from "@/lib/cookie-types";

/**
 * Função auxiliar para mockar NODE_ENV de forma configurável
 * @param env - Ambiente a ser mockado
 */
function mockNodeEnv(env: string) {
  Object.defineProperty(process.env, "NODE_ENV", {
    value: env,
    writable: true,
    configurable: true,
  });
}

describe("cookie-types", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterAll(() => {
    // Restaurar NODE_ENV original
    Object.defineProperty(process.env, "NODE_ENV", {
      value: originalNodeEnv,
      writable: true,
      configurable: true,
    });
  });

  describe("DEFAULT_COOKIE_CONFIG", () => {
    it("deve ter as configurações corretas para desenvolvimento", () => {
      mockNodeEnv("development");

      // Reimportar para pegar o novo valor
      jest.resetModules();
      const {
        DEFAULT_COOKIE_CONFIG: devConfig,
      } = require("@/lib/cookie-types");

      expect(devConfig).toEqual({
        httpOnly: true,
        secure: false, // false em desenvolvimento
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 60, // 30 minutos
      });
    });

    it("deve ter as configurações corretas para produção", () => {
      mockNodeEnv("production");

      // Reimportar para pegar o novo valor
      jest.resetModules();
      const {
        DEFAULT_COOKIE_CONFIG: prodConfig,
      } = require("@/lib/cookie-types");

      expect(prodConfig).toEqual({
        httpOnly: true,
        secure: true, // true em produção
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 60, // 30 minutos
      });
    });

    it("deve ter maxAge de 30 minutos (1800 segundos)", () => {
      expect(DEFAULT_COOKIE_CONFIG.maxAge).toBe(1800);
      expect(DEFAULT_COOKIE_CONFIG.maxAge).toBe(30 * 60);
    });

    it("deve ter httpOnly como true por segurança", () => {
      expect(DEFAULT_COOKIE_CONFIG.httpOnly).toBe(true);
    });

    it('deve ter sameSite como "lax"', () => {
      expect(DEFAULT_COOKIE_CONFIG.sameSite).toBe("lax");
    });

    it('deve ter path como "/"', () => {
      expect(DEFAULT_COOKIE_CONFIG.path).toBe("/");
    });
  });

  describe("AUTH_COOKIE_NAMES", () => {
    it("deve ter os nomes corretos dos cookies de autenticação", () => {
      expect(AUTH_COOKIE_NAMES).toEqual({
        AUTH_TOKEN: "auth-token",
        REFRESH_TOKEN: "refresh-token",
        USER_DATA: "user-data",
      });
    });

    it("deve ter AUTH_TOKEN como string", () => {
      expect(typeof AUTH_COOKIE_NAMES.AUTH_TOKEN).toBe("string");
      expect(AUTH_COOKIE_NAMES.AUTH_TOKEN).toBe("auth-token");
    });

    it("deve ter REFRESH_TOKEN como string", () => {
      expect(typeof AUTH_COOKIE_NAMES.REFRESH_TOKEN).toBe("string");
      expect(AUTH_COOKIE_NAMES.REFRESH_TOKEN).toBe("refresh-token");
    });

    it("deve ter USER_DATA como string", () => {
      expect(typeof AUTH_COOKIE_NAMES.USER_DATA).toBe("string");
      expect(AUTH_COOKIE_NAMES.USER_DATA).toBe("user-data");
    });

    it("deve ter nomes únicos para cada cookie", () => {
      const values = Object.values(AUTH_COOKIE_NAMES);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });

    it("deve ser um objeto com propriedades acessíveis", () => {
      // Verificar que as propriedades podem ser acessadas
      expect(AUTH_COOKIE_NAMES.AUTH_TOKEN).toBe("auth-token");
      expect(AUTH_COOKIE_NAMES.REFRESH_TOKEN).toBe("refresh-token");
      expect(AUTH_COOKIE_NAMES.USER_DATA).toBe("user-data");
    });
  });

  describe("Interfaces TypeScript", () => {
    describe("CookieOptions", () => {
      it("deve aceitar todas as propriedades opcionais", () => {
        const validOptions: CookieOptions = {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          path: "/admin",
          maxAge: 3600,
          expires: new Date("2024-12-31"),
        };

        expect(validOptions.httpOnly).toBe(true);
        expect(validOptions.secure).toBe(true);
        expect(validOptions.sameSite).toBe("strict");
        expect(validOptions.path).toBe("/admin");
        expect(validOptions.maxAge).toBe(3600);
        expect(validOptions.expires).toBeInstanceOf(Date);
      });

      it("deve aceitar objeto vazio", () => {
        const emptyOptions: CookieOptions = {};
        expect(emptyOptions).toEqual({});
      });

      it("deve aceitar apenas algumas propriedades", () => {
        const partialOptions: CookieOptions = {
          httpOnly: false,
          maxAge: 7200,
        };

        expect(partialOptions.httpOnly).toBe(false);
        expect(partialOptions.maxAge).toBe(7200);
        expect(partialOptions.secure).toBeUndefined();
      });

      it("deve aceitar valores válidos para sameSite", () => {
        const strictOption: CookieOptions = { sameSite: "strict" };
        const laxOption: CookieOptions = { sameSite: "lax" };
        const noneOption: CookieOptions = { sameSite: "none" };

        expect(strictOption.sameSite).toBe("strict");
        expect(laxOption.sameSite).toBe("lax");
        expect(noneOption.sameSite).toBe("none");
      });
    });

    describe("CookieData", () => {
      it("deve aceitar objeto com pares chave-valor string", () => {
        const cookieData: CookieData = {
          "session-id": "abc123",
          "user-preference": "dark-mode",
          language: "pt-BR",
        };

        expect(cookieData["session-id"]).toBe("abc123");
        expect(cookieData["user-preference"]).toBe("dark-mode");
        expect(cookieData["language"]).toBe("pt-BR");
      });

      it("deve aceitar objeto vazio", () => {
        const emptyCookieData: CookieData = {};
        expect(emptyCookieData).toEqual({});
      });

      it("deve aceitar chaves dinâmicas", () => {
        const dynamicData: CookieData = {};
        dynamicData["dynamic-key"] = "dynamic-value";

        expect(dynamicData["dynamic-key"]).toBe("dynamic-value");
      });
    });

    describe("AuthCookieData", () => {
      it("deve aceitar dados completos de autenticação", () => {
        const authData: AuthCookieData = {
          token: "jwt-token-123",
          refreshToken: "refresh-token-456",
          userData: JSON.stringify({ id: 1, name: "João" }),
          expiresInMins: 60,
        };

        expect(authData.token).toBe("jwt-token-123");
        expect(authData.refreshToken).toBe("refresh-token-456");
        expect(authData.userData).toBe(JSON.stringify({ id: 1, name: "João" }));
        expect(authData.expiresInMins).toBe(60);
      });

      it("deve aceitar apenas token obrigatório", () => {
        const minimalAuthData: AuthCookieData = {
          token: "jwt-token-only",
        };

        expect(minimalAuthData.token).toBe("jwt-token-only");
        expect(minimalAuthData.refreshToken).toBeUndefined();
        expect(minimalAuthData.userData).toBeUndefined();
        expect(minimalAuthData.expiresInMins).toBeUndefined();
      });

      it("deve aceitar token com refreshToken", () => {
        const authWithRefresh: AuthCookieData = {
          token: "jwt-token",
          refreshToken: "refresh-token",
        };

        expect(authWithRefresh.token).toBe("jwt-token");
        expect(authWithRefresh.refreshToken).toBe("refresh-token");
      });

      it("deve aceitar userData como string JSON", () => {
        const userDataString = JSON.stringify({
          id: 123,
          email: "user@example.com",
          role: "admin",
        });

        const authWithUserData: AuthCookieData = {
          token: "jwt-token",
          userData: userDataString,
        };

        expect(authWithUserData.userData).toBe(userDataString);

        // Verificar se pode ser parseado de volta
        const parsedUserData = JSON.parse(authWithUserData.userData!);
        expect(parsedUserData.id).toBe(123);
        expect(parsedUserData.email).toBe("user@example.com");
        expect(parsedUserData.role).toBe("admin");
      });

      it("deve aceitar expiresInMins como número", () => {
        const authWithExpiry: AuthCookieData = {
          token: "jwt-token",
          expiresInMins: 120,
        };

        expect(authWithExpiry.expiresInMins).toBe(120);
        expect(typeof authWithExpiry.expiresInMins).toBe("number");
      });
    });
  });

  describe("Validação de tipos em tempo de compilação", () => {
    it("deve garantir que DEFAULT_COOKIE_CONFIG seja do tipo CookieOptions", () => {
      // Este teste garante compatibilidade de tipos
      const config: CookieOptions = DEFAULT_COOKIE_CONFIG;
      expect(config).toBeDefined();
    });

    it("deve garantir que AUTH_COOKIE_NAMES tenha propriedades string", () => {
      // Verificar que todas as propriedades são strings
      Object.values(AUTH_COOKIE_NAMES).forEach((value) => {
        expect(typeof value).toBe("string");
      });
    });
  });

  describe("Constantes de configuração", () => {
    it("deve ter configurações seguras por padrão", () => {
      expect(DEFAULT_COOKIE_CONFIG.httpOnly).toBe(true);
      expect(DEFAULT_COOKIE_CONFIG.sameSite).toBe("lax");
      expect(DEFAULT_COOKIE_CONFIG.path).toBe("/");
    });

    it("deve ter nomes de cookies padronizados", () => {
      expect(AUTH_COOKIE_NAMES.AUTH_TOKEN).toMatch(/^[a-z-]+$/);
      expect(AUTH_COOKIE_NAMES.REFRESH_TOKEN).toMatch(/^[a-z-]+$/);
      expect(AUTH_COOKIE_NAMES.USER_DATA).toMatch(/^[a-z-]+$/);
    });

    it("deve ter maxAge configurado em segundos", () => {
      // 30 minutos = 1800 segundos
      expect(DEFAULT_COOKIE_CONFIG.maxAge).toBe(1800);
    });
  });
});
