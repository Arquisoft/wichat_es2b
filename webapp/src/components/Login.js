// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, Snackbar, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
  const navigate = useNavigate();

  const loginUser = async () => {
    try {
      if (username.trim().length < 3 ) {
        setError('Username must have at least 3 characters');
        return;
      }
      if (password.trim().length < 3) {
        setError('Password must have at least 3 characters');
        return;
      }

      const response = await axios.post(`${apiEndpoint}/login`, { username, password });

      console.log(response.data);

      const { token } = response.data;

      if (token) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('username', username);
      }

      navigate('/menu');

      setOpenSnackbar(true);
    } catch (error) {
      setError(error.response.data.error);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container component="main" maxWidth="xs" sx={{minHeight: "100vh", width: "100%", padding: 0 }}>
      <img src="/Logotipo_Wechat_mini_bg.png" alt="Logo" className="logo" />
            
      <Typography component="h1" variant="h5">
        Login
      </Typography>

      <TextField
        margin="normal"
        fullWidth
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
          
      <TextField
        margin="normal"
        fullWidth
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button variant="contained" color="primary" onClick={loginUser}>
        Login
      </Button>
      
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} message="Login successful" />
      {error && (
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} message={`Error: ${error}`} />
      )}
    
      <Typography component="div" align="center" sx={{ marginTop: 2 }}>
        <Link component="button" variant="body2" onClick={() => navigate('/register')}>
          Don't have an account? Register here.
        </Link>
      </Typography>

      <audio id="wave-sound" src="/olas-del-mar.mp3" autoPlay loop></audio>
      <div className="wave-container">
          <svg className="wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
              <path fill="#0099ff" fillOpacity="1" d="M0,96L40,101.3C80,107,160,117,240,101.3C320,85,400,43,480,32C560,21,640,43,720,58.7C800,75,880,85,960,80C1040,75,1120,53,1200,53.3C1280,53,1360,75,1400,85.3L1440,96L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"></path>
          </svg>
      </div>

    </Container>
  );
};

export default Login;