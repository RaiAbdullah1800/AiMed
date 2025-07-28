import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  FormHelperText,
  useTheme,
  useMediaQuery,
  Link as MuiLink,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      navigate("/");
      // Redirect or do something after login
    } catch (err) {
      let msg = "Failed to login";
      if (err.response && err.response.data) {
        if (err.response.data.detail) {
          msg = err.response.data.detail;
        } else if (err.response.data.message) {
          msg = err.response.data.message;
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 5 },
          width: "100%",
          maxWidth: 400,
          borderRadius: 3,
          boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          fontWeight={700}
          mb={2}
          color="primary.main"
        >
          Login
        </Typography>
        <Typography
          variant="body2"
          align="center"
          mb={3}
          color="text.secondary"
        >
          Welcome back! Please login to your account
        </Typography>
        <form onSubmit={handleSubmit} noValidate>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoComplete="email"
          />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((show) => !show)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {error && (
            <FormHelperText error sx={{ mb: 1 }}>
              {error}
            </FormHelperText>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 2, borderRadius: 2, fontWeight: 600, boxShadow: "none" }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <Typography variant="body2" align="center" mt={3}>
          Don't have an account?{" "}
          <MuiLink
            component={Link}
            to="/signup"
            color="primary.main"
            fontWeight={600}
            underline="hover"
          >
            Sign Up
          </MuiLink>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
