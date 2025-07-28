import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  useTheme,
  useMediaQuery,
  Link as MuiLink,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

// Email regex for advanced validation
const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;
// Password regex: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

function getPasswordStrength(password) {
  const lengthOK = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const types = [hasUpper, hasLower, hasNumber, hasSpecial].filter(
    Boolean
  ).length;
  if (passwordRegex.test(password)) {
    return { label: "Strong", color: "success.main", value: 100 };
  } else if (lengthOK && types >= 3) {
    return { label: "Medium", color: "warning.main", value: 66 };
  } else if (password.length > 0) {
    return { label: "Weak", color: "error.main", value: 33 };
  } else {
    return { label: "", color: "grey.300", value: 0 };
  }
}

const Signup = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const validate = () => {
    if (!name.trim()) {
      return "Name is required.";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }
    if (!passwordRegex.test(password)) {
      return "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const vError = validate();
    if (vError) {
      setValidationError(vError);
      return;
    } else {
      setValidationError("");
    }
    setLoading(true);
    try {
      await register({ name, email, password, role });
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate("/login");
      }, 1800);
      // Redirect or do something after registration
    } catch (err) {
      let msg = "Failed to register";
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

  const passwordStrength = getPasswordStrength(password);

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
          Sign Up
        </Typography>
        <Typography
          variant="body2"
          align="center"
          mb={3}
          color="text.secondary"
        >
          Create your account to get started
        </Typography>
        <form onSubmit={handleSubmit} noValidate>
          <TextField
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoComplete="name"
            error={!!validationError && !name.trim()}
            helperText={
              !!validationError && !name.trim() ? validationError : ""
            }
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoComplete="email"
            error={!!validationError && !emailRegex.test(email)}
            helperText={
              !!validationError && !emailRegex.test(email)
                ? validationError
                : ""
            }
          />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoComplete="new-password"
            error={!!validationError && !passwordRegex.test(password)}
            helperText={
              !!validationError && !passwordRegex.test(password)
                ? validationError
                : ""
            }
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
          {/* Password Strength Bar */}
          {password && (
            <Box sx={{ mt: 1, mb: 2 }}>
              <Box
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "grey.300",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${passwordStrength.value}%`,
                    height: "100%",
                    bgcolor: passwordStrength.color,
                    transition: "width 0.3s",
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                sx={{ color: passwordStrength.color, fontWeight: 600, mt: 0.5 }}
              >
                {passwordStrength.label}
              </Typography>
            </Box>
          )}
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="patient">Patient</MenuItem>
              {/* <MenuItem value="doctor">Doctor</MenuItem> */}
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          {error && !validationError && (
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
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
        <Typography variant="body2" align="center" mt={3}>
          Already have an account?{" "}
          <MuiLink
            component={Link}
            to="/login"
            color="primary.main"
            fontWeight={600}
            underline="hover"
          >
            Login
          </MuiLink>
        </Typography>
      </Paper>
      <Snackbar
        open={openSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setOpenSnackbar(false)}
        autoHideDuration={1600}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: 50,
            px: 4,
            py: 1.5,
            minWidth: 250,
            textAlign: "center",
            fontWeight: 600,
            fontSize: "1.1rem",
          },
        }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity="success"
          sx={{
            borderRadius: 50,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          Successfully signed up! Please login.
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default Signup;
