import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Container } from '@mui/material';
import UserService from '../database/DAO';

const Stadistics = () => {
  const [userStats, setUserStats] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId'); 

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = await UserService.getUserById(userId);
        if (user) {
          const stats = user.games.reduce(
            (acc, game) => {
              acc.gamesPlayed++;
              acc.correctAnswers += game.correctAnswers;
              acc.wrongAnswers += game.incorrectAnswers;
              acc.times.push(...game.responseTimes);
              return acc;
            },
            { gamesPlayed: 0, correctAnswers: 0, wrongAnswers: 0, times: [] }
          );
          setUserStats(stats);
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };
    fetchStats();
  }, [userId]);

  const handleBackClick = () => {
    navigate('/menu');
  };

  const handleRegisterStats = async () => {
    try {
      const newStats = {
        correctAnswers: 5,
        incorrectAnswers: 3,
        responseTimes: [100, 150, 200]
      };
      await UserService.registerGame(userId, newStats.correctAnswers, newStats.incorrectAnswers, newStats.responseTimes);
      alert("Estadísticas registradas correctamente.");
    } catch (error) {
      console.error('Error registering stats:', error);
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ marginTop: 4 }}>
      <Typography variant="h5" align="center">Estadísticas</Typography>
      {userStats ? (
        <div>
          <Typography variant="body1">Partidas jugadas: {userStats.gamesPlayed}</Typography>
          <Typography variant="body1">Preguntas acertadas: {userStats.correctAnswers}</Typography>
          <Typography variant="body1">Preguntas falladas: {userStats.wrongAnswers}</Typography>
          <Typography variant="h6">Tiempos por partida:</Typography>
          <ul>
            {userStats.times.map((time, index) => (
              <li key={index}>Partida {index + 1}: {time} segundos</li>
            ))}
          </ul>
        </div>
      ) : (
        <Typography variant="body1">Cargando estadísticas...</Typography>
      )}
      <Button variant="contained" color="primary" onClick={handleRegisterStats} sx={{ marginTop: 2 }}>
        Registrar Estadísticas
      </Button>
      <Button variant="contained" color="secondary" onClick={handleBackClick} sx={{ marginTop: 2 }}>
        Volver
      </Button>
    </Container>
  );
};

export default Stadistics;
