import React from 'react';
import { Container } from '@mui/material';

import LocationGuesser from './wikidataComponents/LocationGuesser.jsx';


const LocationGame = () => {
  return (
    <Container component="main" maxWidth="md" sx={{ marginTop: 4 }}>
      <LocationGuesser/>
    </Container>
  );
};

export default LocationGame;
