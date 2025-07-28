import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, TextField, Button, CircularProgress, IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useSnackbar } from 'notistack';
import { textToSpeechService } from '../services/textToSpeech';
import { speechToTextService } from '../services/speechToTextService';

// NEW: Import v4 from uuid to generate UUIDs
import { v4 as uuidv4 } from 'uuid';

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

// NEW: Define WS_BASE_URL from environment variables
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;

// Define the constant path part of the WebSocket URL
// This should match your backend's expected WebSocket route.
const VOICE_TO_VOICE_PATH = "/voice_to_voice/ws/";
  const [v2vSocket, setV2vSocket] = useState(null);
  const [v2vRecorder, setV2vRecorder] = useState(null);
  // NEW: State to hold the MediaStream object for V2V
  const [v2vStream, setV2vStream] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) socket.close();
      if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
      if (v2vSocket) v2vSocket.close();
      if (v2vRecorder && v2vRecorder.state !== 'inactive') v2vRecorder.stop();
      // NEW: Ensure media streams are also stopped to release mic on unmount
      if (v2vStream) {
        v2vStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [socket, mediaRecorder, v2vSocket, v2vRecorder, v2vStream]); // NEW: Added v2vStream to dependency array

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
        // NEW: Stop the stream tracks for STT on close
        stream.getTracks().forEach(track => track.stop());
      };
      ws.onerror = () => {
        enqueueSnackbar('STT error', { variant: 'error' });
        stopSttRecording();
        // NEW: Stop the stream tracks for STT on error
        stream.getTracks().forEach(track => track.stop());
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
    // NEW: Stop the actual microphone tracks for STT
    if (mediaRecorder && mediaRecorder.stream) {
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    setIsSttRecording(false);
    enqueueSnackbar('STT recording stopped', { variant: 'info' });
  };

  // --- Voice-to-Voice Handlers ---
  const startVoiceToVoice = async () => {
    try {
      // NEW: Get user_id from localStorage
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        enqueueSnackbar('User ID not found in local storage. Cannot start V2V.', { variant: 'error' });
        console.error('User ID not found in local storage.');
        return; // Exit if no user ID
      }

      // NEW: Generate a new chat_id (UUID format)
      const chatId = uuidv4();

      // MODIFIED: Construct the WebSocket URL using environment variable and constant path
      // We want "ws://host:port/path/to/ws/{user_id}/{chat_id}"
      const fullWsUrl = `${WS_BASE_URL}${VOICE_TO_VOICE_PATH}${userId}/${chatId}`;

      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setV2vStream(stream); // NEW: Store the stream object
      console.log('Microphone access granted, creating MediaRecorder...');
      const recorder = new MediaRecorder(stream);
      setV2vRecorder(recorder);

      console.log('Connecting to WebSocket at:', fullWsUrl); // NEW: Log the full URL
      const ws = new WebSocket(fullWsUrl); // NEW: Use the constructed URL

      ws.onopen = () => {
        console.log('WebSocket connection established');
        enqueueSnackbar('V2V connected', { variant: 'success' });
        console.log('Starting MediaRecorder with 1000ms timeslice');
        recorder.start(1000);
        setIsV2vRecording(true);
      };

      // MODIFIED: ws.onmessage to handle base64 audio and autoplay
      ws.onmessage = async event => { // Make onmessage async to use await
        console.group('WebSocket Message Received');
        console.log('Message type:', event.data instanceof Blob ? 'Blob' : typeof event.data);
        console.log('Message size (bytes):', event.data.size || 'N/A');
        console.log('Message data:', event.data);

        // Check if the message is a Blob (for direct audio data) or a string (for JSON)
        if (event.data instanceof Blob) {
          console.log('Blob type:', event.data.type);
          const url = URL.createObjectURL(event.data);
          console.log('Created object URL:', url);
          const audio = new Audio(url);
          console.log('Playing audio...');
          audio.autoplay = true; // NEW: Ensure autoplay is set
          audio.play().catch(e => console.error('Error playing audio:', e));
        } else if (typeof event.data === 'string') {
            try {
                const message = JSON.parse(event.data);
                if (message.event === "media" && message.media && message.media.payload) {
                    console.log('Decoding base64 audio payload...');
                    // Deepgram typically sends base64 audio in `payload` with MIME type in `media.contentType`
                    // However, your console log shows 'audio/mpeg' (ID3), so let's assume it's mp3 or similar
                    // The base64 string usually doesn't include "data:audio/mpeg;base64," prefix.
                    // If it did, you'd remove it first.
                    // Here, we directly decode it assuming raw base64 data.

                    const base64Audio = message.media.payload;

                    // Convert base64 string to a binary string
                    const binaryString = atob(base64Audio);
                    // Convert binary string to an ArrayBuffer
                    const len = binaryString.length;
                    const bytes = new Uint8Array(len);
                    for (let i = 0; i < len; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    // Create a Blob from the ArrayBuffer.
                    // IMPORTANT: You need to specify the correct MIME type.
                    // Based on your console log, "audio/mpeg" seems likely.
                    const audioBlob = new Blob([bytes.buffer], { type: 'audio/mpeg' });

                    const url = URL.createObjectURL(audioBlob);
                    console.log('Created object URL from base64:', url);
                    const audio = new Audio(url);
                    console.log('Playing audio from base64...');
                    audio.autoplay = true; // NEW: Ensure autoplay
                    // NEW: Use await with .play() to handle the promise and potential errors
                    await audio.play().catch(e => console.error('Error playing base64 audio:', e));
                }
            } catch (jsonError) {
                console.warn('Received non-JSON string or malformed JSON:', event.data, jsonError);
            }
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
        stopVoiceToVoice(); // NEW: Call stopVoiceToVoice on error
      };

      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        enqueueSnackbar('V2V disconnected', { variant: 'info' });
        stopVoiceToVoice(); // NEW: Call stopVoiceToVoice on close
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
      // NEW: Stop stream if starting fails
      if (v2vStream) { // Check if stream was set before error
          v2vStream.getTracks().forEach(track => track.stop());
          setV2vStream(null); // Clear the stream state
      }
      setIsV2vRecording(false); // NEW: Ensure state is false if starting fails
    }
  };

  const stopVoiceToVoice = () => {
    // NEW: Log actions for clarity
    console.log('Attempting to stop Voice-to-Voice recording...');

    // Stop the MediaRecorder
    if (v2vRecorder && v2vRecorder.state !== 'inactive') {
      v2vRecorder.stop();
      console.log('MediaRecorder stopped.');
    }

    // Close the WebSocket connection gracefully
    if (v2vSocket && v2vSocket.readyState === WebSocket.OPEN) {
      v2vSocket.send(new ArrayBuffer(0)); // Optional: Send empty buffer to signal end
      setTimeout(() => {
        v2vSocket.close();
        console.log('WebSocket connection explicitly closed.');
      }, 100); // Give a small delay for the last message
    } else if (v2vSocket && v2vSocket.readyState !== WebSocket.CLOSED) {
        // If it's not open but not yet closed (e.g., CLOSING), just ensure it's closed
        v2vSocket.close();
        console.log('WebSocket was not OPEN, forced close.');
    }

    // NEW: Stop the actual microphone tracks from the stream
    if (v2vStream) {
      v2vStream.getTracks().forEach(track => {
        track.stop(); // This is the key to turning off the mic
        console.log('Microphone track stopped.');
      });
      setV2vStream(null); // Clear the stream state
    }

    // Update UI state
    setIsV2vRecording(false);
    enqueueSnackbar('V2V recording stopped', { variant: 'info' });

    // NEW: Clear state variables to allow new connection
    setV2vRecorder(null);
    setV2vSocket(null);
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

      {/* <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mt: 4, minHeight: '30vh' }}>
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
      </Paper> */}

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