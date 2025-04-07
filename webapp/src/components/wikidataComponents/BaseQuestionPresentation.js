import React from "react";
import { Button } from '@mui/material';
import "../style/estilo.css";
import PropTypes from 'prop-types';

const BaseQuestionPresentation = ({ 
    score, 
    maxRounds, 
    question, 
    feedback, 
    buttonsDisabled, 
    navigate, 
    onAnswerClick, 
    getButtonClassName,
    chatComponent
}) => {
    if (score.rounds >= maxRounds) {
        const total = score.correct + score.incorrect;
        const ratio = total > 0 ? Math.round((score.correct / total) * 100) : 0;

        return (
            <div>
                <h1>Final results</h1>
                <p>Correct answers: {score.correct}</p>
                <p>Incorrect answers: {score.incorrect}</p>
                <p>Ratio: {ratio}%</p>
                <Button variant="contained" color="primary" onClick={() => navigate("/menu")}>
                    Back to menu
                </Button>
            </div>
        );
    }

    return (
        <div>
            <h1>Guess the City 🌍</h1>
            {question ? (
                <>
                    <div className="image-container">
                        <img
                            className="city-image"
                            src={question.answers[question.correct]}
                            alt="Ciudad"
                            onError={(e) => {
                                e.target.src = 'fallback-image-url';
                                e.target.alt = 'Imagen no disponible';
                            }}
                        />
                    </div>
                    <div className="button-grid">
                        {Object.keys(question.answers).map((city) => (
                            <button
                                key={city}
                                onClick={() => onAnswerClick(city)}
                                disabled={buttonsDisabled}
                                className={getButtonClassName(city)}
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                    {feedback && <p>{feedback}</p>}
                    {chatComponent}
                </>
            ) : (
                <p className="loading-question">Loading Question...</p>
            )}
        </div>
    );
};

BaseQuestionPresentation.propTypes = {
    score: PropTypes.shape({
        correct: PropTypes.number.isRequired,
        incorrect: PropTypes.number.isRequired,
        rounds: PropTypes.number.isRequired
    }).isRequired,
    maxRounds: PropTypes.number.isRequired,
    question: PropTypes.shape({
        answers: PropTypes.objectOf(PropTypes.string),
        correct: PropTypes.string
    }),
    feedback: PropTypes.string,
    buttonsDisabled: PropTypes.bool.isRequired,
    navigate: PropTypes.func.isRequired,
    onAnswerClick: PropTypes.func.isRequired,
    getButtonClassName: PropTypes.func.isRequired
};

export default BaseQuestionPresentation;