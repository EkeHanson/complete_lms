import React, { useState, useEffect, useRef } from 'react';
import {
  Paper, Typography, Accordion, AccordionSummary, AccordionDetails,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, Box, TextField, IconButton
} from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import HelpIcon from '@mui/icons-material/Help';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import './StudentSupport.css';
import { API_BASE_URL } from '../../../config'; // Make sure this import exists

const StudentSupport = () => {
  const [openChat, setOpenChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [wsError, setWsError] = useState(null);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  const faqs = [
    {
      question: 'How do I enroll in a course?',
      answer: 'Go to the Search Courses section, find a course, and click Enroll Now.',
    },
    {
      question: 'How can I reset my password?',
      answer: 'Click Forgot Password on the login page and follow the instructions.',
    },
  ];

  const tenantId = localStorage.getItem('tenant_id');
  const tenantSchema = localStorage.getItem('tenant_schema');
  const accessToken = localStorage.getItem('access_token');

  useEffect(() => {
    if (openChat) {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const backendUrl = new URL(API_BASE_URL);
      const wsHost = backendUrl.host; // Includes port if specified

      // console.log("wsHost")
      // console.log(wsHost)
      // console.log("wsHost")
      
      const wsUrl = `${wsProtocol}//${wsHost}/ws/ai-chat/?tenant_id=${encodeURIComponent(tenantId)}&token=${encodeURIComponent(accessToken)}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setWsError(null);
        // No need to send auth message, as it's now in the URL
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'auth_required') {
          return;
        }

        if (data.error) {
          setMessages((prev) => [
            ...prev,
            { text: `Error: ${data.error}`, sender: 'system' },
          ]);
        } else {
          setMessages((prev) => [...prev, { text: data.message, sender: 'ai' }]);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setWsError('WebSocket disconnected. Retrying...');
        setTimeout(() => {
          if (openChat) {
            wsRef.current = new WebSocket(wsUrl);
          }
        }, 5000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsError('Connection error. Please try again.');
      };

      return () => {
        wsRef.current.close();
      };
    }
  }, [openChat, tenantId, tenantSchema, accessToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (input.trim() && wsRef.current?.readyState === WebSocket.OPEN) {
      setMessages((prev) => [...prev, { text: input, sender: 'user' }]);
      wsRef.current.send(JSON.stringify({ message: input }));
      setInput('');
    } else {
      setMessages((prev) => [
        ...prev,
        { text: 'Cannot send message: WebSocket not connected.', sender: 'system' },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="support-container">
      <Paper elevation={3} className="support-paper">
        <Typography variant="h5" gutterBottom>
          Support
        </Typography>
        <Box mb={3}>
          <Typography variant="h6">FAQs</Typography>
          {faqs.map((faq, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
        <Button
          variant="contained"
          startIcon={<HelpIcon />}
          onClick={() => setOpenChat(true)}
          disabled={!tenantId || !tenantSchema}
          sx={{ mt: 2 }}
        >
          Open Live Chat
        </Button>
        {wsError && (
          <Typography color="error" sx={{ mt: 2 }}>
            {wsError}
          </Typography>
        )}

        <Dialog
          open={openChat}
          onClose={() => setOpenChat(false)}
          fullWidth
          maxWidth="sm"
          scroll="body"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          PaperProps={{
            className: 'support-dialog-paper'
          }}
        >
          <DialogTitle className="support-dialog-title">
            AI Support Chat
            <IconButton
              aria-label="close"
              onClick={() => setOpenChat(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: '#fff',
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent
            dividers
            className="support-dialog-content"
          >
            <List>
              {messages.map((msg, index) => (
                <ListItem
                  key={index}
                  className={
                    msg.sender === 'user'
                      ? 'support-list-item-user'
                      : msg.sender === 'system'
                      ? 'support-list-item-system'
                      : 'support-list-item-ai'
                  }
                  sx={{ mb: 1 }}
                >
                  <Box
                    className={
                      'support-message-box' +
                      (msg.sender === 'user'
                        ? ' support-message-box-user'
                        : msg.sender === 'system'
                        ? ' support-message-box-system'
                        : '')
                    }
                  >
                    <Typography variant="body2">{msg.text}</Typography>
                  </Box>
                </ListItem>
              ))}
              <div ref={messagesEndRef} />
            </List>
          </DialogContent>
          <DialogActions className="support-dialog-actions">
            <Box className="support-input-box">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="support-textfield"
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={handleSendMessage}
                      disabled={!input.trim()}
                      sx={{ color: '#007bff' }}
                    >
                      <SendIcon />
                    </IconButton>
                  ),
                }}
              />
            </Box>
          </DialogActions>
        </Dialog>
      </Paper>
    </div>
  );
};

export default StudentSupport;