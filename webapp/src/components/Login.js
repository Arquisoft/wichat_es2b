// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, Snackbar } from '@mui/material';
import { Typewriter } from "react-simple-typewriter";
import { useNavigate } from 'react-router-dom';
import UserService from '../database/DAO';

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
      } else if (!password) {
        setError({ field: "password", message: "Password is required" });
      }

      try {
        const existingUser = await checkIfUserExists(username); // revisar
        if (!existingUser) {
          const newUser = await createNewUser(username, password);
          setCreatedAt(newUser.createdAt);
        } else {
          setCreatedAt(existingUser.createdAt);
        }
      } catch (error) {
        setError({ field: 'error', message: "Error checking or creating user" });
        return;
      }

      const response = await axios.post(`${apiEndpoint}/login`, { username, password });

      const question = "Please, generate a greeting message for a student called " + username + " that is a student of the Software Architecture course in the University of Oviedo. Be nice and polite. Two to three sentences max.";
      const model = "empathy";

      if (apiKey === 'None') {
        setMessage("LLM API key is not set. Cannot contact the LLM.");
      } else {
        const messageResponse = await axios.post(`${apiEndpoint}/askllm`, { question, model, apiKey });
        setMessage(messageResponse.data.answer);
      }

      // Extract data from the response
      const { createdAt: userCreatedAt } = response.data;

      setCreatedAt(userCreatedAt);
      setLoginSuccess(true);
      setOpenSnackbar(true);

      navigate("/menu"); // tras un login correcto, redirigimos al menú (donde está el juego, ver estadísticas, etc.)
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          setError({ field: 'error', message: error.response.data.error});
        } else if (error.response.status === 400) {
          setError({ field: 'error', message: "Username or password are incorrect" });
        }
      } else {
        setError({ field: 'error', message: "An error occurred" });
      }
    }
  };

  // DataBase - Check id user exists
  const checkIfUserExists = async (username) => {
    try {
      const user = await UserService.getUserById(username);
      return user;
    } catch (error) {
      throw error;
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
            <Typewriter
              words={[message]} // Pass your message as an array of strings
              cursor
              cursorStyle="|"
              typeSpeed={50} // Typing speed in ms
            />
            <Typography component="p" variant="body1" sx={{ textAlign: 'center', marginTop: 2 }}>
              Your account was created on {displayCreationDate(createdAt)}.
            </Typography>
          </div>
        ) : (
          <div>
            <Typography component="h1" variant="h5">
              Login
            </Typography>

            {error && error.field === 'error' && ( // Show error message
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
              <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} message={`Error: ${error}`} />
            )}
          </div>
        )}
      </Container>
    );
};

export default Login;
