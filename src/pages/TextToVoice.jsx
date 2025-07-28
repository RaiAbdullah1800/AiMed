import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, TextField, Button, CircularProgress, IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useSnackbar } from 'notistack';
import { textToSpeechService } from '../services/textToSpeech';
import { speechToTextService } from '../services/speechToTextService';

const TextToVoice = () => {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Separate recording states
  const [isSttRecording, setIsSttRecording] = useState(false);
  const [isV2vRecording, setIsV2vRecording] = useState(false);

  const [transcript, setTranscript] = useState('');
  const [socket, setSocket] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const VOICE_TO_VOICE_WS_URL = "ws://192.168.100.25:8000/voice_to_voice/ws/3640315d-fd43-4f00-885c-f50a067674ec";
  const [v2vSocket, setV2vSocket] = useState(null);
  const [v2vRecorder, setV2vRecorder] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) socket.close();
      if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
      if (v2vSocket) v2vSocket.close();
      if (v2vRecorder && v2vRecorder.state !== 'inactive') v2vRecorder.stop();
    };
  }, [socket, mediaRecorder, v2vSocket, v2vRecorder]);

  const handleConvert = async () => {
    if (!text.trim()) {
      enqueueSnackbar('Please enter some text', { variant: 'warning' });
      return;
    }
    setIsLoading(true);
    try {
      const audioBlob = await textToSpeechService.convertText(text);
      const blob = new Blob([audioBlob], { type: 'audio/mpeg' });
      setAudioUrl(URL.createObjectURL(blob));
    } catch (error) {
      enqueueSnackbar('Failed to convert text to speech', { variant: 'error' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Speech-to-Text Handlers ---
  const handleWebSocketMessage = (data) => {
    setTranscript(prev => {
      if (data.is_final) {
        const parts = prev.split(' ').slice(0, -1);
        return [...parts, data.text].join(' ').trim();
      }
      const parts = prev ? prev.split(' ') : [];
      parts[parts.length - 1] = data.text;
      return parts.join(' ').trim();
    });
  };

  const startSttRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      const ws = speechToTextService.createWebSocket(handleWebSocketMessage);
      ws.onopen = () => enqueueSnackbar('STT connected', { variant: 'success' });
      ws.onclose = () => {
        enqueueSnackbar('STT disconnected', { variant: 'info' });
        setIsSttRecording(false);
      };
      ws.onerror = () => {
        enqueueSnackbar('STT error', { variant: 'error' });
        stopSttRecording();
      };
      recorder.ondataavailable = e => {
        if (ws.readyState === WebSocket.OPEN && e.data.size > 0) ws.send(e.data);
      };
      recorder.start(1000);
      setSocket(ws);
      setIsSttRecording(true);
      enqueueSnackbar('STT recording started', { variant: 'info' });
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to start STT', { variant: 'error' });
    }
  };

  const stopSttRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    if (socket && socket.readyState === WebSocket.OPEN) socket.close();
    setIsSttRecording(false);
    enqueueSnackbar('STT recording stopped', { variant: 'info' });
  };

  // --- Voice-to-Voice Handlers ---
  const startVoiceToVoice = async () => {
    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted, creating MediaRecorder...');
      const recorder = new MediaRecorder(stream);
      setV2vRecorder(recorder);
      
      console.log('Connecting to WebSocket at:', VOICE_TO_VOICE_WS_URL);
      const ws = new WebSocket(VOICE_TO_VOICE_WS_URL);
      
      ws.onopen = () => {
        console.log('WebSocket connection established');
        enqueueSnackbar('V2V connected', { variant: 'success' });
        console.log('Starting MediaRecorder with 1000ms timeslice');
        recorder.start(1000);
        setIsV2vRecording(true);
      };
      
      ws.onmessage = event => {
        console.group('WebSocket Message Received');
        console.log('Message type:', event.data instanceof Blob ? 'Blob' : typeof event.data);
        console.log('Message size (bytes):', event.data.size || 'N/A');
        console.log('Message data:', event.data);
        
        if (event.data instanceof Blob) {
          console.log('Blob type:', event.data.type);
          const url = URL.createObjectURL(event.data);
          console.log('Created object URL:', url);
          const audio = new Audio(url);
          console.log('Playing audio...');
          audio.play().catch(e => console.error('Error playing audio:', e));
        }
        console.groupEnd();
      };
      
      ws.onerror = error => {
        console.error('WebSocket Error:', error);
        enqueueSnackbar('V2V error', { variant: 'error' });
        console.error('WebSocket error details:', {
          readyState: ws.readyState,
          url: ws.url,
          bufferedAmount: ws.bufferedAmount,
          extensions: ws.extensions,
          protocol: ws.protocol,
          binaryType: ws.binaryType
        });
        stopVoiceToVoice();
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        enqueueSnackbar('V2V disconnected', { variant: 'info' });
        setIsV2vRecording(false);
      };
      
      recorder.ondataavailable = e => {
        console.group('MediaRecorder Data Available');
        console.log('Data size (bytes):', e.data.size);
        console.log('Data type:', e.data.type);
        console.log('Timestamp:', e.timeStamp);
        
        if (ws.readyState === WebSocket.OPEN) {
          if (e.data.size > 0) {
            console.log('Sending audio data to WebSocket...');
            ws.send(e.data);
            console.log('Audio data sent successfully');
          } else {
            console.warn('No data to send, empty chunk received');
          }
        } else {
          console.warn('WebSocket is not open. ReadyState:', ws.readyState);
        }
        console.groupEnd();
      };
      
      setV2vSocket(ws);
      console.log('WebSocket and MediaRecorder initialized successfully');
    } catch (err) {
      console.error('Error in startVoiceToVoice:', {
        error: err,
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      enqueueSnackbar('Failed to start V2V', { variant: 'error' });
    }
  };

  const stopVoiceToVoice = () => {
    if (v2vRecorder && v2vRecorder.state !== 'inactive') v2vRecorder.stop();
    if (v2vSocket && v2vSocket.readyState === WebSocket.OPEN) {
      v2vSocket.send(new ArrayBuffer(0));
      setTimeout(() => v2vSocket.close(), 300);
    }
    setIsV2vRecording(false);
    enqueueSnackbar('V2V recording stopped', { variant: 'info' });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 12, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, minHeight: '70vh' }}>
        <Typography variant="h4" gutterBottom>Text to Voice</Typography>
        <TextField
          label="Enter text to convert"
          multiline
          rows={4}
          fullWidth
          value={text}
          onChange={e => setText(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleConvert}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={24} /> : null}
        >
          {isLoading ? 'Converting...' : 'Convert to Speech'}
        </Button>
        {audioUrl && (
          <div style={{ marginTop: 20 }}>
            <Typography variant="h6" gutterBottom>Audio Output:</Typography>
            <audio controls src={audioUrl} style={{ width: '100%' }} />
            <IconButton href={audioUrl} download="tts.mp3">
              <DownloadIcon />
              <Typography component="span" sx={{ ml: 1 }}>Download</Typography>
            </IconButton>
          </div>
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mt: 4, minHeight: '30vh' }}>
        <Typography variant="h4" gutterBottom>Speech to Text</Typography>
        <Button
          variant="contained"
          color={isSttRecording ? 'error' : 'primary'}
          onClick={isSttRecording ? stopSttRecording : startSttRecording}
          sx={{ mt: 2 }}
        >
          {isSttRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>
        {transcript && (
          <TextField
            multiline
            rows={4}
            fullWidth
            value={transcript}
            InputProps={{ readOnly: true }}
            sx={{ mt: 2 }}
          />
        )}
      </Paper>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mt: 4, minHeight: '30vh' }}>
        <Typography variant="h4" gutterBottom>Voice to Voice</Typography>
        <Button
          variant="contained"
          color={isV2vRecording ? 'error' : 'primary'}
          onClick={isV2vRecording ? stopVoiceToVoice : startVoiceToVoice}
          sx={{ mt: 2 }}
        >
          {isV2vRecording ? 'Stop V2V' : 'Start V2V'}
        </Button>
      </Paper>
    </Container>
  );
};

export default TextToVoice;
