import React, { useState } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, Snackbar } from '@mui/material';
import { Typewriter } from "react-simple-typewriter";
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [createdAt, setCreatedAt] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
  const apiKey = process.env.REACT_APP_LLM_API_KEY || 'None';

  const navigate = useNavigate();

  const loginUser = async () => {
    try {
      if (!username) {
        setError({ field: "username", message: "Username is required" });
        return;
      } else if (!password) {
        setError({ field: "password", message: "Password is required" });
        return;
      }

      const response = await axios.post(`${apiEndpoint}/check-user`, { username });
      if (!response.data.exists) {
        setError({ field: 'username', message: "User does not exist" });
        return;
      }

      const userResponse = await axios.post(`${apiEndpoint}/login`, { username, password });

      const question = "Please, generate a greeting message for a student called " + username + " that is a student of the Software Architecture course in the University of Oviedo. Be nice and polite. Two to three sentences max.";
      const model = "empathy";

      if (apiKey === 'None') {
        setMessage("LLM API key is not set. Cannot contact the LLM.");
      } else {
        const messageResponse = await axios.post(`${apiEndpoint}/askllm`, { question, model, apiKey });
        setMessage(messageResponse.data.answer);
      }

      const { createdAt: userCreatedAt, userId } = userResponse.data;

      localStorage.setItem("userId", userId);
      setCreatedAt(userCreatedAt);
      setLoginSuccess(true);
      setOpenSnackbar(true);

      navigate("/menu");
    } catch (error) {
      const errorMessage = error.response?.data?.error || "An unexpected error occurred";
      setError({ field: 'error', message: errorMessage });
    }
  };

  const displayCreationDate = (createdAt) => {
    return new Date(createdAt).toLocaleDateString();
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ marginTop: 4 }}>
      {loginSuccess ? (
        <div>
          <Typewriter words={[message]} cursor cursorStyle="|" typeSpeed={50} />
          <Typography component="p" variant="body1" sx={{ textAlign: 'center', marginTop: 2 }}>
            Your account was created on {displayCreationDate(createdAt)}.
          </Typography>
        </div>
      ) : (
        <div>
          <Typography component="h1" variant="h5">
            Login
          </Typography>

          {error && error.field === 'error' && (
            <Typography component="p" variant="body1" sx={{ color: 'red', marginTop: 2 }}>
              {error.message}
            </Typography>
          )}

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
            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} message={`Error: ${error.message}`} />
          )}
        </div>
      )}
    </Container>
  );
};

export default Login;