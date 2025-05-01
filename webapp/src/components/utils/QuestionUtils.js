import { useState, useEffect } from 'react';

const apiEndpoint = process.env.REACT_APP_USER_SERVICE_ENDPOINT || 'http://localhost:8001';

const useStats = (maxRounds = 10) => {
    const [score, setScore] = useState({ correct: 0, incorrect: 0, rounds: 0 });
    const [feedback, setFeedback] = useState(null);
    const [buttonsDisabled, setButtonsDisabled] = useState(false);


    useEffect(() => {
        const saveStats = async () => {
            try {
                const response = await fetch(`${apiEndpoint}/api/stats`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: localStorage.getItem('username'),
                        score: score.correct,
                        correctAnswers: score.correct,
                        incorrectAnswers: score.incorrect,
                        totalRounds: maxRounds
                    })
                });

                if (!response.ok) throw new Error('Error al guardar estadísticas');
            } catch (error) {
                console.error('Error:', error);
            }
        };

        if (score.rounds >= maxRounds) saveStats();
    }, [score, maxRounds]);

    return {
        score,
        setScore,
        feedback,
        setFeedback,
        buttonsDisabled,
        setButtonsDisabled
    };
};

export default useStats;