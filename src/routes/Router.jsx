import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Chat from '../sections/Chat';
import AdminPanel from '../pages/AdminPanel';
import AdminGuard from '../guards/AdminGuard';
import UserGuard from '../guards/UserGuard';
import AppointmentBooking from '../pages/AppointmentBooking';
import TextToVoice from '../pages/TextToVoice';
import { LinearProgress, Snackbar } from '@mui/material';

const Router = () => {
  const { token, loading } = useAuth();
  const [openSnackbar, setOpenSnackbar] = React.useState(false);

  React.useEffect(() => {
    setOpenSnackbar(loading);
  }, [loading]);

  if (loading) {
    return (
      <>
        <LinearProgress color="primary" />
        <Snackbar
          open={openSnackbar}
          message="🔌 Connecting…"
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        />
      </>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={!token ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/signup"
          element={!token ? <Signup /> : <Navigate to="/" replace />}
        />

        {/* Protected routes */}
        <Route element={<MainLayout />}>  
          {/* Admin routes */}
          <Route element={<AdminGuard />}>  
            <Route path="/" element={<AdminPanel />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Route>

          {/* User routes */}
          <Route element={<UserGuard />}>  
            <Route path="/chat" element={<Chat />} />
            <Route path="/appointments" element={<AppointmentBooking />} />
            <Route path="/text-to-voice" element={<TextToVoice />} />
          </Route>
        </Route>

        {/* Redirect all other routes */}
        <Route
          path="*"
          element={
            token ?
              (localStorage.getItem('role') === 'admin' ?
                <Navigate to="/admin" replace /> :
                <Navigate to="/chat" replace />
              ) :
              <Navigate to="/login" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
