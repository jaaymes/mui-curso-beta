"use client";

import { LoginFormData, loginSchema } from "@/lib/validations";
import { useAuth } from "@/store/use-auth";
import { DummyLoginResponse } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Login as LoginIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

/**
 * Componente de formulário de login que usa Server Actions
 * Mantém a interatividade client-side para UX, mas submete via Server Action
 */
interface LoginFormProps {
  loginAction: (
    formData: FormData
  ) => Promise<{ error?: string; user?: DummyLoginResponse } | void>;
}

export function LoginForm({ loginAction }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const { setUser, setLoading } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "emilys",
      password: "emilyspass",
    },
  });

  /**
   * Handler para submissão do formulário
   * Converte os dados do react-hook-form para FormData para o Server Action
   */
  const onSubmit = async (data: LoginFormData) => {
    setError(undefined);
    setLoading(true);

    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);

    try {
      const result = await loginAction(formData);

      if (result && result.error) {
        setError(result.error);
        setLoading(false);
      } else if (result && result.user) {
        // Set user data in Zustand store
        setUser(result.user);

        // Redirect to dashboard after successful login
        router.push("/dashboard");
      }
    } catch (error) {
      setError("Erro interno do servidor");
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <Paper
          sx={{
            mb: 3,
            p: 2,
            backgroundColor: "#ffebee",
            border: "1px solid #f44336",
            borderRadius: 1,
          }}
        >
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        </Paper>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          {...register("username")}
          fullWidth
          label="Nome de usuário"
          type="text"
          error={!!errors.username}
          helperText={errors.username?.message}
          sx={{ mt: 2, mb: 1 }}
          autoComplete="username"
          autoFocus
          data-testid="username-input"
        />

        <TextField
          {...register("password")}
          fullWidth
          label="Senha"
          type={showPassword ? "text" : "password"}
          error={!!errors.password}
          helperText={errors.password?.message}
          sx={{ mt: 2, mb: 1 }}
          autoComplete="current-password"
          data-testid="password-input"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    data-testid="password-visibility-toggle"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isSubmitting}
          startIcon={<LoginIcon />}
          sx={{
            mt: 3,
            mb: 2,
            py: 1.5,
            textTransform: "none",
            fontSize: "1.1rem",
          }}
          data-testid="login-button"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </Box>
    </>
  );
}
