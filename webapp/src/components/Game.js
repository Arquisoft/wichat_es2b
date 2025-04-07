import React from 'react';
import { Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import QuestionPresentation from './wikidataComponents/QuestionPresentation.jsx';
import useGameLogic from './utils/GameUtils';

const Game = () => {
  const navigate = useNavigate();

  const { currentQuestion, questionGenerator, currentCity, chatComponent } = useGameLogic();

  return (
    <Container component="main" maxWidth="md" sx={{ marginTop: 4 }}>
      <QuestionPresentation 
        game={questionGenerator}
        navigate={navigate}
        question={currentQuestion}
        chatComponent={chatComponent}
        data-testid="question-presentation"
      />
    </Container>
  );
};

export default Game;
