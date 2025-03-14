import React, { useState, useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './wikidataComponents/estilo.css';
import QuestionPresentation from './wikidataComponents/QuestionPresentation.jsx';
import QuestionGeneration from './wikidataComponents/QuestionGeneration.js';

const Game = () => {
  const [question, setQuestion] = useState({ answers: {}, correct: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const gen = new QuestionGeneration(setQuestion);
    gen.fetchQuestions();
  }, []);

  return (
    <Container component="main" maxWidth="md" sx={{ marginTop: 4 }}>
      <Typography component="h1" variant="h4">
        Welcome to the Game Page
      </Typography>
      <QuestionPresentation game={{ setQuestion }} navigate={navigate} />
    </Container>
  );
};

export default Game;