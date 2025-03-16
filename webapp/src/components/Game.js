import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import QuestionPresentation from './wikidataComponents/QuestionPresentation.jsx';
import QuestionGeneration from "./wikidataComponents/QuestionGeneration.js";
import axios from 'axios';

const Game = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionGenerator] = useState(() => new QuestionGeneration(setCurrentQuestion));

  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    questionGenerator.fetchQuestions();
  }, [questionGenerator]);

  // Función para enviar pregunta al LLM
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = { role: 'user', content: userInput };

    // Agregar el mensaje del usuario al historial
    setChatHistory((prev) => [...prev, userMessage]);

    try {
      // Enviar solo la pregunta y el modelo al backend
      const response = await axios.post('http://localhost:8000/askllm', {
        question: userInput,
        model: 'gemini' // Cambia esto si usas otro modelo
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
    <Container component="main" maxWidth="md" sx={{ marginTop: 4 }}>
      <Typography component="h1" variant="h4">
        Welcome to the Game Page
      </Typography>
      <QuestionPresentation 
        game={questionGenerator}
        navigate={navigate}
        question={currentQuestion}
      />

      {/* Chat de preguntas al LLM */}
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
    </Container>
  );
};

export default Game;
