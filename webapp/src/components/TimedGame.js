import React, { useState, useEffect } from 'react';
import { Container, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TimedQuestionPresentation from './wikidataComponents/TimedQuestionPresentation.jsx';
import useGameLogic from './utils/GameUtils';
import ChatLLM from './ChatLLM';

const TimedProgress = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((oldProgress) => {
                const newProgress = oldProgress + 1;
                return newProgress >= 100 ? 100 : newProgress;
            });
        }, 100);

        return () => clearInterval(interval);
    }, []);

    return <CircularProgress data-testid="progress-circle" variant="determinate" value={progress} />;
};

const TimedGame = () => {
    const navigate = useNavigate();
    const { currentQuestion, questionGenerator, currentCity } = useGameLogic();

    return (
        <Container component="main" maxWidth="md" sx={{ marginTop: 4 }}>
            <TimedQuestionPresentation 
                game={questionGenerator}
                navigate={navigate}
                question={currentQuestion}
                data-testid="timed-question-presentation"
            />
            <ChatLLM currentCity={currentCity} data-testid="chat-llm" />
        </Container>
    );
};

export default TimedGame;