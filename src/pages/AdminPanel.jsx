import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { patientsService } from '../services/patientsService';
import { chatService } from '../services/chatService';

const AdminPanel = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [chats, setChats] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all patients on mount
  useEffect(() => {
    const fetchPatients = async () => {
      setLoadingPatients(true);
      try {
        const data = await patientsService.getAll();
        setPatients(data);
      } catch (err) {
        setError('Failed to load patients');
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchPatients();
  }, []);

  // Fetch chats when selectedPatient changes
  useEffect(() => {
    if (!selectedPatient) {
      setChats([]);
      return;
    }

    const fetchChats = async () => {
      setLoadingChats(true);
      try {
        const data = await chatService.getChatsByPatient(selectedPatient);
        setChats(data);
      } catch (err) {
        setError('Failed to load chat histories');
      } finally {
        setLoadingChats(false);
      }
    };

    fetchChats();
  }, [selectedPatient]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Chat Histories
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel id="patient-select-label">Select Patient</InputLabel>
            <Select
              labelId="patient-select-label"
              value={selectedPatient}
              label="Select Patient"
              onChange={(e) => {
                setError(null);
                setSelectedPatient(e.target.value);
              }}
            >
              {loadingPatients ? (
                <MenuItem disabled>Loading...</MenuItem>
              ) : (
                patients.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name} ({p.email})
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {loadingChats ? (
            <Box textAlign="center">
              <CircularProgress />
            </Box>
          ) : chats.length > 0 ? (
            chats.map((chat) => (
              <Accordion key={chat.chat_id} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 'bold' }}>
                    {`Chat ID: ${chat.chat_id}`} • {new Date(chat.created_at).toLocaleString()}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {chat.messages.map((msg) => (
                      <ListItem key={msg.message_id} alignItems="flex-start">
                        <ListItemText
                          primary={`${msg.role.toUpperCase()} @ ${new Date(msg.timestamp).toLocaleTimeString()}`}
                          secondary={msg.content}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))
          ) : selectedPatient ? (
            <Typography>No chat histories found for this patient.</Typography>
          ) : (
            <Typography>Select a patient to view chat histories.</Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminPanel;
