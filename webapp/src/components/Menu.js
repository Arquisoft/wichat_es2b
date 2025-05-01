import React from 'react';
import { Container, Box, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';

import '../components/style/Home.css';

const ImageButton = styled('img')({
    width: "100%",
    maxWidth: "100%",
    height: "auto",
    cursor: "pointer",
    display: "block",
});

const Menu = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    const isMobile = useMediaQuery(theme.breakpoints.down('md')); // md == medium == 900px
    const widthResponsive=isMobile ? '50vh' : '100%';
    const heightResponsive=isMobile ? 'auto' : '100%';

    const handlePageChange = (page) => () => {
        navigate(`/${page}`);
    };

    return (
        <Container 

            /*component="main"*/ 
            /*maxWidth="md"*/ 

            sx={{
                /*textAlign: 'center', */
                display: 'flex', 
                flexDirection: 'column', 
                /*alignItems: 'center', 
                justifyContent: 'center',*/
                width: widthResponsive,
                height: heightResponsive
            }}
        >
            {/* Imagen principal */}
            <img 
                src="/MenuUI.png" 
                alt="Hey!! Are you ready? 🌊" 
                style={{ width: "100%", maxWidth: "80%" }} 
                className="logo" 
            />

            {/* Contenedor de botones en dos columnas */}
            <Box 
                display="flex"
                flexDirection={ isMobile ? 'column' : 'row' }
                justifyContent="space-between"
                alignItems="center"
                width="100%" 
                maxWidth="100%"
                marginTop={3}
                gap={{ xs: 2 /* Espacio entre filas */, md: 4 /* Espacio entre columnas */ }}
            >
                {/* Columna izquierda */}
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <ImageButton src="/Button_NonTimedGame.png" alt="Non Timed Game" onClick={handlePageChange("game")} />
                    <ImageButton src="/Button_TimedGame.png" alt="Timed Game" onClick={handlePageChange("timedGame")} />
                    <ImageButton src="/Button_Map.png" alt="Location Game" onClick={handlePageChange("locationGame")} />
                </Box>

                {/* Columna derecha */}
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <ImageButton src="/Button_Stadistics.png" alt="Statistics" onClick={handlePageChange("stadistics")} />
                    <ImageButton src="/Button_Ranking.png" alt="Ranking" onClick={handlePageChange("ranking")} />
                </Box>
            </Box>


            {/* Sonido de fondo */}
            <audio id="wave-sound" src="/olas-del-mar.mp3" autoPlay loop></audio>

            {/* Olas decorativas */}
            <div className="wave-container">
                <svg className="wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                    <path fill="#0099ff" fillOpacity="1" d="M0,96L40,101.3C80,107,160,117,240,101.3C320,85,400,43,480,32C560,21,640,43,720,58.7C800,75,880,85,960,80C1040,75,1120,53,1200,53.3C1280,53,1360,75,1400,85.3L1440,96L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"></path>
                </svg>
            </div>
        </Container>
    );
};

export default Menu;
