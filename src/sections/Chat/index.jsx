import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { chatbotService } from "../../services/chatbot";

const Chat = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [isNewChat, setIsNewChat] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleNewChat = () => {
      setMessages([]);
      setChatId(null);
      setIsNewChat(true);
      setInputValue("");
    };

    window.addEventListener("newChat", handleNewChat);
    return () => window.removeEventListener("newChat", handleNewChat);
  }, []);

  const formatTime = (timestamp) => {
    // Convert UTC timestamp to local timezone
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const userMessage = {
        id: Date.now(),
        text: inputValue,
        sender: "user",
        timestamp: new Date().toISOString(),
        role: "user",
        content: inputValue,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsTyping(true);

      try {
        const apiResponse = await chatbotService.sendMessage(
          inputValue,
          chatId
        );

        const botMessage = {
          id: Date.now() + 1,
          text: apiResponse.response,
          sender: "bot",
          timestamp: apiResponse.timestamp,
          role: "assistant",
          content: apiResponse.response,
        };

        setMessages((prev) => [...prev, botMessage]);
        setChatId(apiResponse.chat_id);
        setIsNewChat(false);
      } catch (error) {
        // Handle error - show error message
        const errorMessage = {
          id: Date.now() + 1,
          text: "Sorry, I encountered an error. Please try again.",
          sender: "bot",
          timestamp: new Date().toISOString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "83vh",
        mt: 7,
        maxWidth: "100%",
        bgcolor: "background.default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Messages Container */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          p: { xs: 1, sm: 2 },
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0,0,0,0.2)",
            borderRadius: "3px",
          },
        }}
      >
        {messages.length === 0 ? (
          // Empty state for new chat
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              textAlign: "center",
              gap: 2,
            }}
          >
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 80,
                height: 80,
                mb: 2,
              }}
            >
              <SmartToyIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h5" fontWeight={600} color="text.primary">
              Welcome to AI Assistant
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 400 }}
            >
              I'm here to help you with any questions or tasks. Start by typing
              a message below.
            </Typography>
          </Box>
        ) : (
          // Messages
          messages.map((message, index) => (
            <Slide direction="up" in={true} timeout={300} key={message.id}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent:
                    message.sender === "user" ? "flex-end" : "flex-start",
                  mb: 2,
                  mt: 5,
                  px: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection:
                      message.sender === "user" ? "row-reverse" : "row",
                    alignItems: "flex-end",
                    gap: 1,
                    maxWidth: "80%",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor:
                        message.sender === "user"
                          ? theme.palette.primary.main
                          : theme.palette.secondary.main,
                    }}
                  >
                    {message.sender === "user" ? (
                      <PersonIcon />
                    ) : (
                      <SmartToyIcon />
                    )}
                  </Avatar>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems:
                        message.sender === "user" ? "flex-end" : "flex-start",
                      maxWidth: "100%",
                    }}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor:
                          message.sender === "user"
                            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                            : "background.paper",
                        color:
                          message.sender === "user" ? "white" : "text.primary",
                        borderRadius:
                          message.sender === "user"
                            ? "18px 18px 4px 18px"
                            : "18px 18px 18px 4px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        maxWidth: "100%",
                        wordBreak: "break-word",
                      }}
                    >
                      <Typography variant="body1" sx={{ lineHeight: 1.5 }}>
                        {message.text}
                      </Typography>
                    </Paper>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mt: 0.5,
                        px: 1,
                      }}
                    >
                      <AccessTimeIcon
                        sx={{ fontSize: 12, color: "text.secondary" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(message.timestamp)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Slide>
          ))
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <Fade in={isTyping}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                mb: 2,
                px: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 1,
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: theme.palette.secondary.main,
                  }}
                >
                  <SmartToyIcon />
                </Avatar>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: "background.paper",
                    borderRadius: "18px 18px 18px 4px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "text.secondary",
                        animation: "typing 1.4s infinite ease-in-out",
                      }}
                    />
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "text.secondary",
                        animation: "typing 1.4s infinite ease-in-out 0.2s",
                      }}
                    />
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "text.secondary",
                        animation: "typing 1.4s infinite ease-in-out 0.4s",
                      }}
                    />
                  </Box>
                </Paper>
              </Box>
            </Box>
          </Fade>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input Section */}
      <Box
        sx={{
          p: { xs: 1, sm: 2 },
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
          boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            gap: 1,
            bgcolor: "background.default",
            borderRadius: 3,
            p: 1,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <TextField
            multiline
            maxRows={4}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            variant="standard"
            fullWidth
            sx={{
              "& .MuiInputBase-root": {
                fontSize: "1rem",
                "&:before": { borderBottom: "none" },
                "&:after": { borderBottom: "none" },
                "&:hover:not(.Mui-disabled):before": { borderBottom: "none" },
              },
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            sx={{
              bgcolor:
                inputValue.trim() && !isTyping
                  ? theme.palette.primary.main
                  : "grey.300",
              color: "white",
              "&:hover": {
                bgcolor:
                  inputValue.trim() && !isTyping
                    ? theme.palette.primary.dark
                    : "grey.400",
              },
              width: 40,
              height: 40,
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>

      <style>
        {`
          @keyframes typing {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-10px); }
          }
        `}
      </style>
    </Box>
  );
};

export default Chat;
