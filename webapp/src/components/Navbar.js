import React from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { Home, SportsEsports, BarChart, Leaderboard, ExitToApp, AccountCircle } from '@mui/icons-material';

const Navbar = ({ toggleDarkTheme, toggleLightTheme }) => {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#009efc', boxShadow: 'none' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" component={Link} to="/menu" startIcon={<Home />}>
            Menu
          </Button>
          <Button color="inherit" component={Link} to="/game" startIcon={<SportsEsports />}>
            Game
          </Button>
          <Button color="inherit" component={Link} to="/stadistics" startIcon={<BarChart />}>
            Statistics
          </Button>
          <Button color="inherit" component={Link} to="/ranking" startIcon={<Leaderboard />}>
            Ranking
          </Button>
          <Button color="inherit" component={Link} to="/profile" startIcon={<AccountCircle />}>
            Profile
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button onClick={toggleLightTheme} color="inherit" sx={{ fontSize: '1.5rem' }}>☀️</Button>
          <Button onClick={toggleDarkTheme} color="inherit" sx={{ fontSize: '1.5rem' }}>🌙</Button>
          <Button color="inherit" component={Link} to="/login" startIcon={<ExitToApp />}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;