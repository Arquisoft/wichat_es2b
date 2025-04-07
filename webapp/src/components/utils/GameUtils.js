import { useState, useEffect, useRef } from 'react';
import QuestionGeneration from "../wikidataComponents/QuestionGeneration";
import ChatLLM from '../ChatLLM'; // Importar ChatLLM

const useGameLogic = () => {
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [currentCity, setCurrentCity] = useState(null);
    const chatRef = useRef(); // Crear una referencia para ChatLLM

    // Crear el generador de preguntas y pasar showChat
    const [questionGenerator] = useState(() => 
        new QuestionGeneration(setCurrentQuestion, () => {
            chatRef.current?.showChat(); // Llamar a showChat del ChatLLM
        })
    );

    useEffect(() => {
        questionGenerator.fetchQuestions();
    }, [questionGenerator]);

    useEffect(() => {
        if (currentQuestion) {
            setCurrentCity(currentQuestion.correct);
        }
    }, [currentQuestion]);

    // Crear el componente ChatLLM
    const chatComponent = (
        <ChatLLM 
            ref={chatRef} 
            currentCity={currentCity} 
            data-testid="chat-llm"
        />
    );

    return {
        currentQuestion,
        questionGenerator,
        currentCity,
        chatComponent
    };
};

export default useGameLogic;