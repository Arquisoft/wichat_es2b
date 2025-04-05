import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Menu from './components/Menu';
import Game from './components/Game';
import TimedGame from './components/TimedGame';
import Stadistics from './components/Stadistics';
import ProtectedRoute from './auth/ProtectedRoute';
import Ranking from './components/Ranking';
import Navbar from './components/Navbar';
import Profile from './components/Profile';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

const App = () => {
  const [theme, setTheme] = useState(lightTheme);

  const toggleDarkTheme = () => {
    setTheme(darkTheme);
  };

  const toggleLightTheme = () => {
    setTheme(lightTheme);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar toggleDarkTheme={toggleDarkTheme} toggleLightTheme={toggleLightTheme} />
      <main>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/menu" element={
            <ProtectedRoute element={<Menu />} />
          } />
          <Route path="/game" element={
            <ProtectedRoute element={<Game />} />
          } />
          <Route path="/timedGame" element={
            <ProtectedRoute element={<TimedGame />} />
          } />
          <Route path="/stadistics" element={
            <ProtectedRoute element={<Stadistics />} />
          } />
          <Route path="/ranking" element={
            <ProtectedRoute element={<Ranking />} />
          } />
          <Route path="/profile" element={
            <ProtectedRoute element={<Profile />} />
          } />
        </Routes>
      </main>
    </ThemeProvider>
  );
};

export default App;