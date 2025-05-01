import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import axios from 'axios';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
const apiKey = process.env.REACT_APP_LLM_API_KEY;

const ChatLLM = ({ currentCity }) => {  // ← Recibe la ciudad actual como prop
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  // Función para enviar la pregunta al LLM
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = { role: 'user', content: userInput };

    // Agregar el mensaje del usuario al historial
    setChatHistory((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post(`${apiEndpoint}/hint`, {
        question: `${currentCity || "ciudad desconocida"}:${userInput}`,
        model: 'gemini',
        apiKey: apiKey
      });

      const botMessage = { role: 'bot', content: response.data.answer };

      // Agregar la respuesta del bot al historial
      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error obteniendo respuesta del LLM:', error);
      setChatHistory((prev) => [...prev, { role: 'bot', content: 'Error al obtener respuesta.' }]);
    }

    // Limpiar input
    setUserInput('');
  };

  return (
    <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
      <Typography variant="h6">Chat de Pistas</Typography>
      <Box sx={{ maxHeight: 200, overflowY: 'auto', p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        {chatHistory.map((msg, index) => (
          <Typography key={index} sx={{ textAlign: msg.role === 'user' ? 'right' : 'left', color: msg.role === 'user' ? 'blue' : 'green' }}>
            <strong>{msg.role === 'user' ? 'Tú' : 'LLM'}:</strong> {msg.content}
          </Typography>
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <TextField 
          fullWidth 
          label="Pregunta al LLM..." 
          variant="outlined" 
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleSendMessage}>
          Enviar
        </Button>
      </Box>
    </Box>
  );
};

export default ChatLLM;
