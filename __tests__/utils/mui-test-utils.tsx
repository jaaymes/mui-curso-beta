import { render, RenderOptions } from "@testing-library/react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React from "react";

// Simple MUI theme for testing
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

const MuiProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

export const renderWithMui = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: MuiProviders, ...options });

export { theme };
export * from "@testing-library/react";