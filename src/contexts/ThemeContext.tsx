"use client";

import { ThemeConfig } from "@/types";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface ThemeContextType {
  themeConfig: ThemeConfig;
  updateTheme?: (config: Partial<ThemeConfig>) => void;
  toggleMode?: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultThemeConfig: ThemeConfig = {
  mode: "light",
  primaryColor: "#d32f2f", // Red primary color
  secondaryColor: "#f44336", // Lighter red secondary
};

const createCustomTheme = (config: ThemeConfig) => {
  return createTheme({
    palette: {
      mode: config.mode,
      primary: {
        main: config.primaryColor,
        light: config.mode === "light" ? "#e57373" : "#ffcdd2",
        dark: "#b71c1c",
      },
      secondary: {
        main: config.secondaryColor,
        light: config.mode === "light" ? "#ef5350" : "#ffebee",
        dark: "#c62828",
      },
      background: {
        default: config.mode === "light" ? "#fafafa" : "#121212",
        paper: config.mode === "light" ? "#ffffff" : "#1e1e1e",
      },
      text: {
        primary: config.mode === "light" ? "#212121" : "#ffffff",
        secondary: config.mode === "light" ? "#757575" : "#b0b0b0",
      },
    },
    typography: {
      fontFamily:
        'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: {
        fontWeight: 600,
        fontSize: "2.5rem",
      },
      h2: {
        fontWeight: 600,
        fontSize: "2rem",
      },
      h3: {
        fontWeight: 600,
        fontSize: "1.75rem",
      },
      h4: {
        fontWeight: 600,
        fontSize: "1.5rem",
      },
      h5: {
        fontWeight: 600,
        fontSize: "1.25rem",
      },
      h6: {
        fontWeight: 600,
        fontSize: "1rem",
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            "&:hover": {
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
          },
        },
      },
    },
  });
};

export function CustomThemeProvider({ children }: { children: ReactNode }) {
  const [themeConfig, setThemeConfig] =
    useState<ThemeConfig>(defaultThemeConfig);
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem("theme-config");
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setThemeConfig(parsedConfig);
      }
    } catch (error) {
      // Avisa sobre dados inválidos encontrados no localStorage
      console.warn("Dados inválidos encontrados no localStorage para theme-config:", error);
      // Remove dados inválidos do localStorage para evitar problemas futuros
      localStorage.removeItem("theme-config");
    }
  }, []);

  const updateTheme = (config: Partial<ThemeConfig>) => {
    const newConfig = { ...themeConfig, ...config };
    setThemeConfig(newConfig);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme-config", JSON.stringify(newConfig));
    }
  };

  const toggleMode = () => {
    updateTheme({ mode: themeConfig.mode === "light" ? "dark" : "light" });
  };

  // Always use the current themeConfig, but prevent flash during hydration
  const theme = createCustomTheme(themeConfig);

  return (
    <ThemeContext.Provider value={{ themeConfig, updateTheme, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a CustomThemeProvider");
  }
  return context;
}
