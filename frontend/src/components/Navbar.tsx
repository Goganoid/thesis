import {
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  EventNote as TimeoffIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUserData } from "../hooks/queries/useUserData";
import { UserRole } from '../types/auth';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { data: userData } = useUserData();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  const menuItems = [
    {
      text: "Invoices",
      icon: <ReceiptIcon />,
      path: "/dashboard",
      disabled: false,
    },
    {
      text: "Timeoffs",
      icon: <TimeoffIcon />,
      path: "/timeoffs",
      disabled: false,
    },
    {
      text: "Users",
      icon: <PeopleIcon />,
      path: "/users",
      disabled: userData?.role !== UserRole.Admin,
    },
    {
      text: "Settings",
      icon: <SettingsIcon />,
      path: "/settings",
      disabled: userData?.role !== UserRole.Admin && userData?.role !== UserRole.Bookkeeper,
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        width: 240,
        height: "100vh",
        borderRadius: 0,
        borderRight: "1px solid",
        borderColor: "divider",
        position: "fixed",
        left: 0,
        top: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Expense Manager
        </Typography>
        <IconButton
          onClick={handleMenu}
          size="small"
          sx={{ ml: 2 }}
          aria-controls={anchorEl ? "user-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={!!anchorEl}
        >
          <AccountCircleIcon />
        </IconButton>
        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          onClick={handleClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => !item.disabled && navigate(item.path)}
              disabled={item.disabled}
              selected={location.pathname === item.path}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "primary.light",
                  color: "primary.contrastText",
                  "&:hover": {
                    backgroundColor: "primary.light",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "primary.contrastText",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: item.disabled ? "text.disabled" : "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  color: item.disabled ? "text.disabled" : "inherit",
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
