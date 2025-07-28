import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { appointmentService } from '../services/appointmentService';

const AppointmentBooking = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [form, setForm] = useState({ doctor: '', datetime: '' });
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch doctors
  useEffect(() => {
    appointmentService.getAvailableDoctors()
      .then(res => setDoctors(res.data.map(d => d.doctor_name)))
      .catch(err => setError(err.message || 'Failed to load doctors'))
      .finally(() => setLoadingDoctors(false));
  }, []);

  // Fetch user appointments
  useEffect(() => {
    console.log('user id', user)
    if (!user?.id) return;
    setLoadingAppointments(true);
    appointmentService.getUserAppointments(user.id)
      .then(res => setAppointments(res.data))
      .catch(err => setError(err.message || 'Failed to load appointments'))
      .finally(() => setLoadingAppointments(false));
  }, [user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const isoString = new Date(form.datetime).toISOString();
      const res = await appointmentService.scheduleAppointment({
        doctor_name: form.doctor,
        appointment_datetime: isoString
      });
      
      // Ensure appointments is always an array before updating
      setAppointments(prevAppointments => [
        res.data, 
        ...(Array.isArray(prevAppointments) ? prevAppointments : [])
      ]);
      
      setSuccess('Appointment scheduled!');
      
      // Reset form
      setForm({ doctor: '', datetime: '' });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to schedule');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDisplay = iso => new Date(iso).toLocaleString();

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper sx={{ p: 4 }} elevation={3}>
        <Typography variant="h4" gutterBottom display="flex" alignItems="center">
          <CalendarTodayIcon sx={{ mr: 1 }} /> Book Appointment
        </Typography>

        {(error || success) && (
          <Alert severity={error ? 'error' : 'success'} sx={{ mb: 3 }} onClose={() => { setError(''); setSuccess(''); }}>
            {error || success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <TextField
                  select
                  name="doctor"
                  label="Select Doctor"
                  value={form.doctor}
                  onChange={handleChange}
                  disabled={loadingDoctors}
                  sx={{ '& .MuiInputBase-root': { minWidth: 200 } }}
                >
                  {doctors.map((d, i) => <MenuItem key={i} value={d}>{d}</MenuItem>)}
                </TextField>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="datetime"
                label="Date & Time"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={form.datetime}
                onChange={handleChange}
                fullWidth
                required
                disabled={!form.doctor}
                inputProps={{
                  min: new Date().toISOString().slice(0, 16), // Current date and time in YYYY-MM-DDTHH:MM format
                  step: 900 // 15 minute intervals
                }}
                InputProps={{ startAdornment: <EventNoteIcon sx={{ mr: 1 }} /> }}
              />
            </Grid>

<Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={!form.doctor || !form.datetime || submitting}
                startIcon={submitting ? <CircularProgress size={20} /> : null}
              >
                {submitting ? 'Booking...' : 'Book'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Box mt={4}>
          <Typography variant="h6" gutterBottom>Your Appointments</Typography>
          {loadingAppointments ? (
            <CircularProgress />
          ) : (
            appointments && appointments.length ? (
              <List>
                {appointments.filter(a => a).map(a => (
                  <React.Fragment key={a.id}> 
                    <ListItem>
                      <ListItemText
                        primary={`Dr. ${a.doctor_name}`}
                        secondary={formatDisplay(a.appointment_datetime)}
                      />
                      <Chip
                        label={a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                        variant="outlined"
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography>No upcoming appointments.</Typography>
            )
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default AppointmentBooking;
