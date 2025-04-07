import React from "react";
import PropTypes from 'prop-types';
import useStats from '../utils/QuestionUtils';
import BaseQuestionPresentation from './BaseQuestionPresentation';

const QuestionPresentation = ({ game, navigate, question, chatComponent}) => {
    const { score, setScore, feedback, setFeedback, buttonsDisabled, setButtonsDisabled } = useStats(10);
    const maxRounds = 10;

    const checkAnswer = (selected) => {
        if (!question || buttonsDisabled) return;

        const isCorrect = selected === question.correct;
        setFeedback(isCorrect ? "✅ Correct answer" : "❌ Wrong answer");
        setButtonsDisabled(true);

        setScore(prev => ({
            correct: isCorrect ? prev.correct + 1 : prev.correct,
            incorrect: !isCorrect ? prev.incorrect + 1 : prev.incorrect,
            rounds: prev.rounds + 1
        }));

        setTimeout(() => {
            if (score.rounds + 1 < maxRounds) {
                game.fetchQuestions();
                setFeedback(null);
                setButtonsDisabled(false);
            }
        }, 1500);
    };

    const getButtonClassName = (city) => {
        if (!buttonsDisabled) return 'answer-button';
        return `answer-button ${city === question.correct ? "correct" : "incorrect"}`;
    };

    return (
        <BaseQuestionPresentation
            score={score}
            maxRounds={maxRounds}
            question={question}
            feedback={feedback}
            buttonsDisabled={buttonsDisabled}
            navigate={navigate}
            onAnswerClick={checkAnswer}
            getButtonClassName={getButtonClassName}
            chatComponent={chatComponent}
        />
    );
};

QuestionPresentation.propTypes = {
    game: PropTypes.shape({
        fetchQuestions: PropTypes.func.isRequired
    }).isRequired,
    navigate: PropTypes.func.isRequired,
    question: PropTypes.shape({
        answers: PropTypes.objectOf(PropTypes.string),
        correct: PropTypes.string
    })
};

export default QuestionPresentation;