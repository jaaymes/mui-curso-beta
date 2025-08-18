"use client";

import { DummyUser } from "@/types";
import {
  Business,
  CalendarToday,
  Close,
  Email,
  Person,
  Phone,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";

interface UserDetailDialogProps {
  open: boolean;
  onClose: () => void;
  user: DummyUser | null;
}

/**
 * Componente de diálogo para visualização detalhada dos dados do usuário
 * Substitui a funcionalidade de edição por uma visualização completa
 */
export function UserDetailDialog({
  open,
  onClose,
  user,
}: UserDetailDialogProps) {
  if (!user) return null;

  const getRoleColor = (role: string) => {
    return role === "admin" ? "primary" : "default";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      data-testid="user-detail-dialog"
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box fontWeight="bold">Detalhes do Usuário</Box>
        <IconButton
          onClick={onClose}
          size="small"
          data-testid="close-dialog-button"
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Header com Avatar e Informações Básicas */}
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar
              src={user.image}
              sx={{
                width: 80,
                height: 80,
                bgcolor: "primary.main",
                fontSize: "2rem",
              }}
            >
              {user.firstName.charAt(0).toUpperCase()}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {`${user.firstName} ${user.lastName}`}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Email fontSize="small" color="action" />
                <Typography variant="body1" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Chip
                label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                color={getRoleColor(user.role) as "primary" | "default"}
                size="medium"
                variant="outlined"
              />
            </Box>
          </Box>

          <Divider />

          {/* Informações Detalhadas */}
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Person color="action" />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Nome de Usuário
                </Typography>
                <Typography variant="body1">
                  {user.username || "Não informado"}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Phone color="action" />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Telefone
                </Typography>
                <Typography variant="body1">
                  {user.phone || "Não informado"}
                </Typography>
              </Box>
            </Box>

            {user.company && (
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Business color="action" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Empresa
                  </Typography>
                  <Typography variant="body1">
                    {user.company.name || "Não informado"}
                  </Typography>
                </Box>
              </Box>
            )}

            {user.age && (
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <CalendarToday color="action" />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Idade
                  </Typography>
                  <Typography variant="body1">{user.age} anos</Typography>
                </Box>
              </Box>
            )}

            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <CalendarToday color="action" />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Data de Nascimento
                </Typography>
                <Typography variant="body1">
                  {formatDate(user.birthDate)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={onClose} variant="contained" fullWidth>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
