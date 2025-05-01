// src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, TextField, Button, Snackbar, Link } from '@mui/material';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const navigate = useNavigate();

  const addUser = async () => {
    try {
      if (username.trim().length < 3 ) {
        setError('Username must have at least 3 characters');
        return;
      }
      if (password.trim().length < 3) {
        setError('Password must have at least 3 characters');
        return;
      }

      await axios.post(`${apiEndpoint}/adduser`, { username, password });
      setOpenSnackbar(true);
      navigate('/login');
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
        Add User
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

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} message="User added successfully" />
      {error && (
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} message={`Error: ${error}`} />
      )}

      <Button variant="contained" color="primary" onClick={addUser}>
        Add User
      </Button>

      <Typography component="div" align="center" sx={{ marginTop: 2 }}>
        <Link component="button" variant="body2" onClick={() => navigate('/login')}>
          Already have an account? Login here.
        </Link>
      </Typography>

      <div className="wave-container">
        <svg className="wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#0099ff" fillOpacity="1" d="M0,160L34.3,160C68.6,160,137,160,206,181.3C274.3,203,343,245,411,234.7C480,224,549,160,617,165.3C685.7,171,754,245,823,245.3C891.4,245,960,171,1029,133.3C1097.1,96,1166,96,1234,90.7C1302.9,85,1371,75,1406,69.3L1440,64L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"></path>
        </svg>
      </div>

    </Container>
  );
};

export default Register;
