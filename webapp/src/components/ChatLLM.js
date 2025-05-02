import React, { useState, useEffect } from 'react'; // Added useEffect
import { Box, Typography, TextField, Button } from '@mui/material';
import axios from 'axios';

// These should read from the .env file AFTER moving it and restarting the server.
// The default 'http://localhost:8000' will be used IF the .env variable is not found.
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
const apiKey = process.env.REACT_APP_LLM_API_KEY;

// --- LOGGING TO VERIFY ---
// This log runs when the component code is first loaded.
console.log('[ChatLLM Module Load] REACT_APP_API_ENDPOINT:', process.env.REACT_APP_API_ENDPOINT);
console.log('[ChatLLM Module Load] Using apiEndpoint:', apiEndpoint);
console.log('[ChatLLM Module Load] REACT_APP_LLM_API_KEY provided?:', !!process.env.REACT_APP_LLM_API_KEY);
console.log('[ChatLLM Module Load] Using apiKey provided?:', !!apiKey);
// --- END LOGGING ---

const ChatLLM = ({ currentCity }) => {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  // Log when the component mounts or currentCity changes
  useEffect(() => {
    console.log('[ChatLLM Effect] Component mounted/updated. Current City:', currentCity);
    // Log environment variables again inside the component instance if needed
    // console.log('[ChatLLM Effect] apiEndpoint:', apiEndpoint);
    // console.log('[ChatLLM Effect] apiKey provided?:', !!apiKey);
  }, [currentCity]);


  const handleSendMessage = async () => {
    console.log('[handleSendMessage] Attempting to send message...'); // Log start

    // --- Check if API Key is present ---
    if (!apiKey) {
      console.error('[handleSendMessage] Error: LLM API Key is missing. Check .env file and restart server.');
      setChatHistory((prev) => [...prev, { role: 'bot', content: 'Error de configuración: Falta la clave API.' }]);
      return; // Stop execution if key is missing
    }
    // --- End Check ---

    if (!userInput.trim()) {
      console.log('[handleSendMessage] User input is empty, skipping.');
      return;
    }

    const cityForRequest = currentCity || "ciudad desconocida"; // Use placeholder if city is not ready
    const userMessage = { role: 'user', content: userInput };

    setChatHistory((prev) => [...prev, userMessage]);

    const requestUrl = `${apiEndpoint}/hint`;
    const requestPayload = {
      question: `${cityForRequest}:${userInput}`,
      model: 'gemini', // Make sure this model is configured on your backend
      apiKey: apiKey
    };

    console.log(`[handleSendMessage] Sending POST request to: ${requestUrl}`);
    console.log('[handleSendMessage] Payload:', { ...requestPayload, apiKey: '***apiKey provided***' }); // Don't log the actual key here

    try {
      const response = await axios.post(requestUrl, requestPayload);

      console.log('[handleSendMessage] Received response:', response); // Log the full response object
      console.log('[handleSendMessage] Response data:', response.data); // Log the data part

      // Basic check if answer exists in the response
      const answer = response.data?.answer;
      if (typeof answer !== 'string') {
           console.warn('[handleSendMessage] Response received, but answer format is unexpected:', response.data);
      }

      const botMessage = { role: 'bot', content: answer || 'Respuesta inesperada del servidor.' }; // Handle missing/bad answer

      setChatHistory((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error('[handleSendMessage] Error during Axios POST request:', error); // Log the full error

      // Detailed Axios error logging
      if (error.response) {
        // Server responded with a status code outside the 2xx range
        console.error('[handleSendMessage] Axios Error Data:', error.response.data);
        console.error('[handleSendMessage] Axios Error Status:', error.response.status);
        console.error('[handleSendMessage] Axios Error Headers:', error.response.headers);
        let errorMessage = `Error del servidor (${error.response.status}).`;
         if (error.response.data?.error) {
             errorMessage += ` Detalles: ${error.response.data.error}`;
         }
         setChatHistory((prev) => [...prev, { role: 'bot', content: errorMessage }]);

      } else if (error.request) {
        // Request was made but no response received (Network Error, CORS, Server down, Incorrect Endpoint)
        console.error('[handleSendMessage] Axios Error Request:', error.request);
         console.error(`[handleSendMessage] No response received. Is the backend running at ${apiEndpoint}? Check CORS.`);
        setChatHistory((prev) => [...prev, { role: 'bot', content: 'Error de red o servidor no responde. Verifica la URL y que el servidor esté activo.' }]);
      } else {
        // Something happened setting up the request
        console.error('[handleSendMessage] Axios Setup Error Message:', error.message);
        setChatHistory((prev) => [...prev, { role: 'bot', content: `Error al preparar la solicitud: ${error.message}` }]);
      }
      // Fallback generic error message if specific ones weren't set
      // setChatHistory((prev) => [...prev, { role: 'bot', content: 'Error al obtener respuesta.' }]);
    }

    setUserInput(''); // Clear input field
  };

  return (
    // --- MUI Box structure remains the same ---
    <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: 2, backgroundColor: '#fff' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Chat de Pistas</Typography>
      <Box sx={{ height: 250, overflowY: 'auto', p: 1, backgroundColor: '#f9f9f9', borderRadius: 1, mb: 2, border: '1px solid #e0e0e0' }}>
         {/* Clear float for message list */}
         <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {chatHistory.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                }}
              >
                <Typography
                  sx={{
                    textAlign: 'left', // Text inside bubble always left-aligned
                    color: msg.role === 'user' ? '#fff' : '#000', // Contrast colors
                    backgroundColor: msg.role === 'user' ? 'primary.main' : '#e0e0e0', // Different backgrounds
                    p: 1,
                    borderRadius: msg.role === 'user' ? '10px 10px 0 10px' : '10px 10px 10px 0', // Bubble shape
                    wordBreak: 'break-word',
                 }}
                >
                  {/* Optional: Don't show the Tú/LLM prefix inside bubble */}
                  {/* <strong>{msg.role === 'user' ? 'Tú' : 'LLM'}:</strong> */}
                   {msg.content}
                </Typography>
              </Box>
            ))}
         </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          label="Pregunta al LLM..."
          variant="outlined"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(ev) => {
            if (ev.key === 'Enter' && !ev.shiftKey) { // Send on Enter, allow Shift+Enter for newline
              handleSendMessage();
              ev.preventDefault();
            }
          }}
        />
        <Button variant="contained" color="primary" onClick={handleSendMessage} disabled={!userInput.trim()}> {/* Disable button if input empty */}
          Enviar
        </Button>
      </Box>
    </Box>
  );
};

export default ChatLLM;