// src/components/Navbar.js
import React, { useState } from 'react';
import { AppBar, Toolbar, Button, Box, Menu, MenuItem } from '@mui/material';
import { Link } from 'react-router-dom';
import { Home, SportsEsports, BarChart, Leaderboard, ExitToApp } from '@mui/icons-material';

const Navbar = ({ toggleDarkTheme, toggleLightTheme }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleGameMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleGameMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#009efc', boxShadow: 'none' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" component={Link} to="/menu" startIcon={<Home />}>
            Menu
          </Button>
          <Button
            color="inherit"
            startIcon={<SportsEsports />}
            onClick={handleGameMenuOpen}
          >
            Game
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleGameMenuClose}
          >
            <MenuItem component={Link} to="/game" onClick={handleGameMenuClose}>
              Normal
            </MenuItem>
            <MenuItem component={Link} to="/timedGame" onClick={handleGameMenuClose}>
              Timed Game
            </MenuItem>
          </Menu>
          <Button color="inherit" component={Link} to="/stadistics" startIcon={<BarChart />}>
            Statistics
          </Button>
          <Button color="inherit" component={Link} to="/ranking" startIcon={<Leaderboard />}>
            Ranking
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
