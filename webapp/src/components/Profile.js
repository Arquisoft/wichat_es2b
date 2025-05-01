import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, Card, CardMedia, Button, IconButton, TextField, CircularProgress, Alert, Checkbox, FormControlLabel, Tooltip } from '@mui/material';
import { ArrowBackIosNew, ArrowForwardIos } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useHandNavigation } from './HandNavigationContext';

const apiEndpoint = process.env.REACT_APP_USER_SERVICE_ENDPOINT || 'http://localhost:8001';
const TOTAL_IMAGES = 8;

const Profile = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { isHandNavigationEnabled, toggleHandNavigation } = useHandNavigation();

  const profileImageFiles = Array.from({ length: TOTAL_IMAGES }, (_, i) => `profile_${i + 1}.gif`);

  const fetchUserData = useCallback(async () => {
    const user = localStorage.getItem('username');
    if (!user) {
      setError('No user logged in.');
      setIsLoading(false);
      navigate('/login');
      return;
    }
    setUsername(user);
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiEndpoint}/user/${user}`);
      const userData = response.data;
      setCurrentImage(userData.profileImage);
      const initialIndex = profileImageFiles.indexOf(userData.profileImage);
      setSelectedIndex(initialIndex >= 0 ? initialIndex : 0);
      setError('');
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError('Failed to fetch user data. ' + (err.response?.data?.error || err.message));
      setCurrentImage('profile_1.gif');
      setSelectedIndex(0);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handlePrevImage = () => {
    setSelectedIndex((prevIndex) => (prevIndex - 1 + TOTAL_IMAGES) % TOTAL_IMAGES);
    setSuccess('');
  };

  const handleNextImage = () => {
    setSelectedIndex((prevIndex) => (prevIndex + 1) % TOTAL_IMAGES);
    setSuccess('');
  };

  const handleUpdateProfileImage = async () => {
    const selectedImageFile = profileImageFiles[selectedIndex];
    setIsUpdating(true);
    setError('');
    setSuccess('');
    try {
      await axios.put(`${apiEndpoint}/user/${username}/profile`, {
        profileImage: selectedImageFile,
      });
      setCurrentImage(selectedImageFile);
      setSuccess('Profile image updated successfully!');
    } catch (err) {
      console.error("Error updating profile image:", err);
      setError('Failed to update profile image. ' + (err.response?.data?.error || err.message));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleHandNavigationChange = (event) => {
    toggleHandNavigation(event.target.checked);
    // Opcional: Añadir feedback visual
    if (event.target.checked) {
      // Mostrar mensaje de que necesita permitir acceso a la cámara
      console.log('Camera access required for hand navigation');
    }
  };

  const displayedImageSrc = `/profile/${profileImageFiles[selectedIndex]}`;

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography component="h1" variant="h4" gutterBottom>
        Profile
      </Typography>

      {isLoading ? (
        <CircularProgress sx={{ mt: 4 }}/>
      ) : (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>

          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{success}</Alert>}

          <TextField
            label="Username"
            value={username}
            InputProps={{
              readOnly: true,
            }}
            fullWidth
            variant="outlined"
            sx={{ maxWidth: 400 }}
          />

          <TextField
              label="Password"
              type="password"
              value="********"
              InputProps={{
                  readOnly: true,
              }}
              helperText="Password cannot be displayed for security."
              fullWidth
              variant="outlined"
              sx={{ maxWidth: 400 }}
              disabled
          />

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Select Profile Picture</Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handlePrevImage} aria-label="previous image" disabled={isLoading || isUpdating}>
              <ArrowBackIosNew />
            </IconButton>

            <Card sx={{ width: 150, height: 150, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
              <CardMedia
                component="img"
                image={displayedImageSrc}
                alt={`Profile image ${selectedIndex + 1}`}
                sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                onError={(e) => { e.target.onerror = null; e.target.src="/profile/profile_1.gif" }}
              />
            </Card>

            <IconButton onClick={handleNextImage} aria-label="next image" disabled={isLoading || isUpdating}>
              <ArrowForwardIos />
            </IconButton>
          </Box>

          <Typography variant="caption" sx={{ mt: 1 }}>
            Image {selectedIndex + 1} of {TOTAL_IMAGES}
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateProfileImage}
            disabled={isLoading || isUpdating || profileImageFiles[selectedIndex] === currentImage}
            sx={{ mt: 3, minWidth: 200 }}
          >
            {isUpdating ? <CircularProgress size={24} color="inherit" /> : 'Save Profile Picture'}
          </Button>

          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isHandNavigationEnabled}
                  onChange={handleHandNavigationChange}
                  inputProps={{ 'aria-label': 'hand-navigation-toggle' }}
                />
              }
              label="Enable hand navigation"
            />
            <Tooltip 
              title="Use hand gestures to navigate through the application. Hold your hand in front of the camera and move it to control the interface."
              arrow
              placement="bottom"
            >
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mt: 1,
                  cursor: 'help',
                  textAlign: 'center',
                  maxWidth: 400 
                }}
              >
                ℹ️ Hover for information about hand navigation
              </Typography>
            </Tooltip>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default Profile;