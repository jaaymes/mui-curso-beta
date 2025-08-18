"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/store/use-auth";
import {
  AccountCircle,
  Brightness4,
  Brightness7,
  Logout,
  Notifications,
} from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  FormControlLabel,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Switch,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";

export function Header() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const { themeConfig, toggleMode } = useTheme();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <AppBar
      position="static"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          Painel
        </Typography>

        <Box display="flex" alignItems="center" gap={1}>
          <IconButton color="inherit" data-testid="notifications-button">
            <Notifications />
          </IconButton>

          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
            sx={{ ml: 1 }}
            data-testid="user-menu"
          >
            <Avatar
              src={user?.avatar}
              sx={{
                width: 32,
                height: 32,
                bgcolor: "primary.main",
              }}
            >
              {user?.name.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 250,
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>

            <Divider />

            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              Perfil
            </MenuItem>

            <Divider />

            <Box sx={{ px: 2, py: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={themeConfig.mode === "dark"}
                    onChange={toggleMode}
                    size="small"
                    data-testid="theme-toggle"
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    {themeConfig.mode === "dark" ? (
                      <Brightness4 fontSize="small" />
                    ) : (
                      <Brightness7 fontSize="small" />
                    )}
                    Modo Escuro
                  </Box>
                }
                sx={{ m: 0 }}
              />
            </Box>

            <Divider />

            <MenuItem onClick={handleLogout} data-testid="logout-button">
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Sair
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
