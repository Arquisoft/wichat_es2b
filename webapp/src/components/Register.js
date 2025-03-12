import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, TextField, Button, Snackbar } from '@mui/material';
import bcrypt from 'bcryptjs';
import UserService from '../database/DAO';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const navigate = useNavigate();

  const addUser = async () => {
    try {
      if (!username || !password) {
        setError("Username and password are required");
        return;
      }

      const existingUser = await UserService.findByUsername(username);
      if (existingUser) {
        setError("Username is already taken");
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const response = await axios.post(`${apiEndpoint}/adduser`, { username, password: hashedPassword });

      setOpenSnackbar(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      console.error("Error registering user:", error);
      setError(error.response?.data?.error || "An error occurred. Please try again.");
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ marginTop: 4 }}>
      <Typography component="h1" variant="h5">
        Register
      </Typography>
      <TextField
        name="username"
        margin="normal"
        fullWidth
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        name="password"
        margin="normal"
        fullWidth
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={addUser}>
        Register
      </Button>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} message="User registered successfully" />
      {error && (
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} message={`Error: ${error}`} />
      )}
    </Container>
  );
};

export default Register;