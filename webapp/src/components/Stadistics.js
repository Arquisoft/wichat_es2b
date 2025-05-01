import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableContainer, Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, Button } from '@mui/material';
import axios from 'axios';
import { PieChart, Pie, Cell } from 'recharts';

const apiEndpoint = process.env.REACT_APP_USER_SERVICE_ENDPOINT || 'http://localhost:8001';

const Stadistics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [error, setError] = useState('');
  const username = localStorage.getItem('username');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${apiEndpoint}/api/stats`, {
          params: { username }
        });
        if (response.data && Array.isArray(response.data)) {
          setStats(response.data);
        } else {
          setError('Invalid data format');
        }
      } catch (error) {
        setError('Failed to fetch statistics');
      }
    };

    fetchStats();
  }, [username]);

  const handleBackClick = () => {
    navigate('/menu');
  };

  return (
    <Container component="main" width="80vw" sx={{ marginTop: 4 }}>
      <Button 
        variant="contained" 
        onClick={handleBackClick}
        sx={{ marginBottom: 2 }}
      >
        Back to Menu
      </Button>
      <Typography component="h1" variant="h5" sx={{ marginBottom: 2 }}>
        Statistics
      </Typography>
      {error && (
        <Typography component="p" variant="body1" sx={{ color: 'red', marginBottom: 2 }}>
          {error}
        </Typography>
      )}
      <TableContainer component={Paper} sx={{ display: "flex", width: "100%" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Correct Answers</TableCell>
              <TableCell>Incorrect Answers</TableCell>
              <TableCell>Total Rounds</TableCell>
              <TableCell>Accuracy</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.map((stat) => (
              <TableRow key={stat._id}>
                <TableCell>{stat.username}</TableCell>
                <TableCell>{stat.score}</TableCell>
                <TableCell>{stat.correctAnswers}</TableCell>
                <TableCell>{stat.incorrectAnswers}</TableCell>
                <TableCell>{stat.totalRounds}</TableCell>
                <TableCell>
                  <PieChart width={50} height={50}>
                    <Pie 
                      data={[
                        { name: 'Correct', value: stat.accuracy },
                        { name: 'Incorrect', value: 100 - stat.accuracy }
                      ]}
                      cx={25} 
                      cy={25} 
                      innerRadius={10} 
                      outerRadius={20} 
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#0088FE" />
                      <Cell fill="#FF0000" />
                    </Pie>
                  </PieChart>
                </TableCell>
                <TableCell>{stat.accuracy}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Stadistics;
