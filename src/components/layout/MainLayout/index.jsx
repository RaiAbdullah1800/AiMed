import React, { useState } from "react";
import PropTypes from "prop-types";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  useTheme,
  useMediaQuery,
  IconButton,
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MicIcon from "@mui/icons-material/Mic";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../../../context/AuthContext";

const MainLayout = ({ children }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const userName = user?.name || localStorage.getItem("name") || "";
  const userEmail = user?.email || localStorage.getItem("email") || "";
  const firstLetter = userName ? userName[0].toUpperCase() : "?";
  const isAdmin = user?.role === "admin" || localStorage.getItem("role") === "admin";

  const isChatActive = location.pathname === "/chat";
  const isTextToVoiceActive = location.pathname === "/text-to-voice";
  const isAppointmentsActive = location.pathname === "/appointments";
  const isAdminActive = location.pathname === "/admin";

  const handleNewChat = () => {
    if (isAdmin) {
      navigate("/admin");
    } else {
      navigate("/chat");
      window.dispatchEvent(new CustomEvent("newChat"));
    }
  };

  const handleTextToVoice = () => {
    if (!isAdmin) navigate("/text-to-voice");
  };

  const handleAppointments = () => {
    if (!isAdmin) navigate("/appointments");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", position: "relative" }}>
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          zIndex: theme.zIndex.drawer - 1,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            minHeight: 64,
            px: 3,
            zIndex: theme.zIndex.drawer + 1,
            position: "relative",
          }}
        >
          {isSmallScreen ? (
            <>
              <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setMobileMenuOpen(true)}>
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="left"
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                PaperProps={{ sx: { width: 250 } }}
              >
                <List>
                  {!isAdmin && (
                    <>
                      <ListItem button onClick={() => { handleTextToVoice(); setMobileMenuOpen(false); }}>
                        <MicIcon sx={{ mr: 1 }} />
                        <Typography>Text to Voice</Typography>
                      </ListItem>
                      <ListItem button onClick={() => { handleAppointments(); setMobileMenuOpen(false); }}>
                        <CalendarMonthIcon sx={{ mr: 1 }} />
                        <Typography>Appointments</Typography>
                      </ListItem>
                    </>
                  )}
                  <ListItem button onClick={() => { handleNewChat(); setMobileMenuOpen(false); }}>
                    <ChatBubbleOutlineIcon sx={{ mr: 1 }} />
                    <Typography>{isAdmin ? "Admin Panel" : "New Chat"}</Typography>
                  </ListItem>
                </List>
              </Drawer>
            </>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              {!isAdmin && (
                <Button
                  variant={isTextToVoiceActive ? "contained" : "outlined"}
                  startIcon={<MicIcon />}
                  onClick={handleTextToVoice}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: isTextToVoiceActive ? 400 : 300,
                    boxShadow: "none",
                    borderColor: isTextToVoiceActive ? "primary.main" : "action.disabled",
                    color: isTextToVoiceActive ? "primary.contrastText" : "text.primary",
                    "&:hover": {
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      borderColor: "primary.main",
                      backgroundColor: isTextToVoiceActive ? "primary.main" : "transparent",
                    },
                  }}
                >
                  Text to Voice
                </Button>
              )}
              {!isAdmin && (
                <Button
                  variant={isAppointmentsActive ? "contained" : "outlined"}
                  startIcon={<CalendarMonthIcon />}
                  onClick={handleAppointments}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: isAppointmentsActive ? 400 : 300,
                    boxShadow: "none",
                    borderColor: isAppointmentsActive ? "primary.main" : "action.disabled",
                    color: isAppointmentsActive ? "primary.contrastText" : "text.primary",
                    "&:hover": {
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      borderColor: "primary.main",
                      backgroundColor: isAppointmentsActive ? "primary.main" : "transparent",
                    },
                  }}
                >
                  Appointments
                </Button>
              )}
              <Button
                variant={(isAdmin && isAdminActive) || (!isAdmin && isChatActive) ? "contained" : "outlined"}
                startIcon={<ChatBubbleOutlineIcon />}
                onClick={handleNewChat}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: (isAdmin && isAdminActive) || (!isAdmin && isChatActive) ? 400 : 300,
                  boxShadow: "none",
                  borderColor: (isAdmin && isAdminActive) || (!isAdmin && isChatActive)
                    ? "primary.main"
                    : "action.disabled",
                  color: (isAdmin && isAdminActive) || (!isAdmin && isChatActive)
                    ? "primary.contrastText"
                    : "text.primary",
                  "&:hover": {
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    borderColor: "primary.main",
                    backgroundColor:
                      (isAdmin && isAdminActive) || (!isAdmin && isChatActive)
                        ? "primary.main"
                        : "transparent",
                  },
                }}
              >
                {isAdmin ? "Admin Panel" : "New Chat"}
              </Button>
            </Box>
          )}

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={handleAvatarClick}
              sx={{
                p: 0,
                ml: 2,
                "&:hover": {
                  transform: "scale(1.05)",
                  transition: "transform 0.2s",
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: "#fff",
                  width: 40,
                  height: 40,
                  fontWeight: 700,
                  border: `2px solid ${theme.palette.background.paper}`,
                }}
              >
                {firstLetter}
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
              sx: {
                minWidth: 220,
                borderRadius: 3,
                mt: 1,
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={700} noWrap>
                {userName}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {userEmail}
              </Typography>
            </Box>
            <MenuItem divider sx={{ my: 1, pointerEvents: "none" }} />
            <Box sx={{ px: 2, pb: 1 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  borderColor: "primary.main",
                  "&:hover": {
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    borderColor: "primary.main",
                    transition: "all 0.2s",
                  },
                  color: "primary.main",
                }}
              >
                Logout
              </Button>
            </Box>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          pt: 8,
          height: "100vh",
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          scrollbarWidth: "none",
          "-ms-overflow-style": "none",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node,
};

export default MainLayout;
