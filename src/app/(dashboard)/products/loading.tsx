import { Box, CircularProgress, Typography } from "@mui/material";

/**
 * Componente de carregamento nativo do Next.js para o dashboard
 * Este arquivo é automaticamente usado pelo Next.js durante navegação e carregamento de páginas
 */
export default function DashboardLoading() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        gap: 2,
        bgcolor: "background.default",
      }}
    >
      <CircularProgress
        size={60}
        thickness={4}
        sx={{
          color: "primary.main",
        }}
      />
      <Typography
        variant="h6"
        color="text.secondary"
        sx={{
          fontWeight: 500,
          letterSpacing: 0.5,
        }}
      >
        Carregando produtos...
      </Typography>
      <Typography
        variant="body2"
        color="text.disabled"
        sx={{
          textAlign: "center",
          maxWidth: 300,
        }}
      >
        Aguarde enquanto preparamos sua experiência
      </Typography>
    </Box>
  );
}
