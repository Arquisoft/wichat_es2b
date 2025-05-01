import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import { getDistance } from 'geolib';
import { fetchRandomCity } from './MappedCities';
import'../style/estilo.css';

function CityGuessMap({ onGuess, disabled }) {
  useMapEvents({
    click(e) {
      if (!disabled) {
        onGuess(e.latlng);
      }
    }
  });
  return null;
}

export default function CityGuessGame() {
  const [city, setCity] = useState(null);
  const [guess, setGuess] = useState(null);
  const [distance, setDistance] = useState(null);

  const loadNewCity = async () => {
    const newCity = await fetchRandomCity();
    setCity(newCity);
    setGuess(null);
    setDistance(null);
  };

  useEffect(() => {
    loadNewCity();
  }, []);

  const handleGuess = (latlng) => {
    if (!city) return; // 🔐 Evita error si city aún no se ha cargado

    setGuess(latlng);

    const dist = getDistance(
        { latitude: city.lat, longitude: city.lng },
        { latitude: latlng.lat, longitude: latlng.lng }
    );
    setDistance(Math.round(dist / 1000));
  };

  return (
      <div style={{ padding: '1rem', position: 'relative' }}>
        <h1>Encuentra la ciudad</h1>
        {city && <h2>¿Dónde está {city.name}?</h2>}

        <div style={{ position: 'relative' }}>
          <MapContainer
              center={[20, 0]}
              zoom={2}
              minZoom={2}
              maxZoom={10}
              maxBounds={[[-90, -180], [90, 180]]}
              style={{ height: "600px", zIndex: 0 }}
          >
            {/* Cambiar la capa del mapa por una sin etiquetas */}
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap"
            />



            <CityGuessMap onGuess={handleGuess} disabled={guess !== null} />
            {guess && <Marker position={guess} />}
            {distance != null && (
                <>
                  <Marker position={[city.lat, city.lng]} />
                  <Polyline positions={[[guess.lat, guess.lng], [city.lat, city.lng]]} color="red" />
                </>
            )}
          </MapContainer>

          {distance != null && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                padding: '1rem 2rem',
                fontSize: '2rem',
                fontWeight: 'bold',
                borderRadius: '1rem',
                zIndex: 1000
              }}>
                Fin del juego
              </div>
          )}
        </div>

        {distance != null && (
            <div style={{ marginTop: '1rem' }}>
              <h3>¡Estás a {distance} km de {city.name}!</h3>
              <button onClick={loadNewCity}>Nueva partida</button>
            </div>
        )}
      </div>
  );
}





