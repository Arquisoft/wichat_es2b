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
import HandTracker from './components/HandTracker';
import { HandNavigationProvider } from './components/HandNavigationContext';
import { useHandNavigation } from './components/HandNavigationContext';

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

const AppContent = () => {
  const [theme, setTheme] = useState(lightTheme);
  const { isHandNavigationEnabled } = useHandNavigation();

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
      <HandTracker enabled={isHandNavigationEnabled} />
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

// Componente principal que provee el contexto
const App = () => {
  return (
    <HandNavigationProvider>
      <AppContent />
    </HandNavigationProvider>
  );
};

export default App;