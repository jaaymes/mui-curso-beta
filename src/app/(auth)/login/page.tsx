import { LoginForm } from "@/components/auth/LoginForm";
import { setCookie } from "@/lib/cookies";
import type { DummyLoginResponse } from "@/types";
import { Dashboard } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Typography,
} from "@mui/material";

/**
 * Server Action para realizar login via SSR
 * Faz a autenticação através da rota /api/me e define o cookie de autenticação
 */
async function loginAction(formData: FormData) {
  "use server";

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  try {
    // Fazer requisição diretamente para DummyJSON API
    const response = await fetch("https://dummyjson.com/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        expiresInMins: 30, // 30 minutes
      }),
    });

    if (response.ok) {
      const userData = (await response.json()) as DummyLoginResponse;
      await setCookie("auth-token", userData.accessToken);
      // Return user data to be set in Zustand store
      return {
        user: {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          gender: userData.gender,
          image: userData.image,
          accessToken: userData.accessToken,
          refreshToken: userData.refreshToken,
        },
      };
    } else {
      // Login falhou, retornar erro
      const errorData = await response.json();
      return { error: errorData.message || "Credenciais inválidas" };
    }
  } catch (error) {
    console.error("Erro no login:", error);
    return { error: "Erro interno do servidor" };
  }
}

export default function LoginPage() {
  return (
    <Card
      elevation={8}
      sx={{
        borderRadius: 2,
        overflow: "visible",
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
          <Dashboard sx={{ fontSize: 40, color: "primary.main", mr: 1 }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Aplicativo Dashboard
          </Typography>
        </Box>

        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          mb={4}
        >
          Faça login para acessar seu painel administrativo
        </Typography>

        <LoginForm loginAction={loginAction} />

        <Divider sx={{ my: 3 }}>
          <Chip label="Credenciais de Demonstração" size="small" />
        </Divider>

        <Box
          sx={{
            bgcolor: "grey.50",
            p: 2,
            borderRadius: 1,
            border: "1px solid",
            borderColor: "grey.200",
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Contas de Demonstração (DummyJSON):</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            emilys / emilyspass
          </Typography>
          <Typography variant="body2" color="text.secondary">
            michaelw / michaelwpass
          </Typography>
          <Typography variant="body2" color="text.secondary">
            sophiab / sophiabpass
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
