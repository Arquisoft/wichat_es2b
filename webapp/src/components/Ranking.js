import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, Button, Avatar } from '@mui/material';
import axios from 'axios';

const apiEndpoint = process.env.REACT_APP_USER_SERVICE_ENDPOINT || 'http://localhost:8001';

const Ranking = () => {
  const navigate = useNavigate();
  const [ranking, setRanking] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await axios.get(`${apiEndpoint}/ranking`);

        if (response.data && Array.isArray(response.data)) {
          setRanking(response.data);
        } else {
          console.error('Invalid data format received:', response.data);
          setError('Invalid data format received from server.');
        }
      } catch (error) {
        console.error('Failed to fetch ranking data:', error);
        setError('Failed to fetch ranking data. ' + (error.response?.data?.message || error.message));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRanking();
  }, []);

  const handleBackClick = () => {
    navigate('/menu');
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/profile/profile_1.gif'; // Fallback to default or first image
  };

  return (
    <Container component="main" maxWidth="md" sx={{ marginTop: 4 }}>
      <Button
        variant="contained"
        onClick={handleBackClick}
        sx={{ marginBottom: 2 }}
      >
        Back to Menu
      </Button>
      <Typography component="h1" variant="h5" sx={{ marginBottom: 2 }}>
        Ranking
      </Typography>

      {isLoading && <Typography>Loading ranking...</Typography>}

      {error && (
        <Typography component="p" variant="body1" sx={{ color: 'red', marginBottom: 2 }}>
          {error}
        </Typography>
      )}

      {!isLoading && !error && (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '10%' }}>Position</TableCell>
                <TableCell sx={{ width: '10%' }}>Avatar</TableCell>
                <TableCell>Username</TableCell>
                <TableCell align="right">Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ranking.map((user, index) => (
                <TableRow key={user._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Avatar
                      src={`/profile/${user.profileImage || 'profile_1.gif'}`}
                      alt={user._id}
                      onError={handleImageError}
                      sx={{ width: 40, height: 40 }}
                    />
                  </TableCell>
                  <TableCell>{user._id}</TableCell>
                  <TableCell align="right">{user.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  );
};

export default Ranking;