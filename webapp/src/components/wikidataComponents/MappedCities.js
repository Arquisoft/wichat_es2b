import axios from "axios";

let cityCache = []; // Lista de ciudades cargadas desde Wikidata
let isCachePopulated = false;

const WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql";
const CACHE_SIZE = 1000;

async function populateCityCache() {
  if (isCachePopulated) {
    return;
  }

  // Consulta inicial a Wikidata
  const query = `
    SELECT ?city ?cityLabel ?lat ?lon WHERE {
      ?city wdt:P31/wdt:P279* wd:Q515.
      ?city p:P625 ?coordinate.
      ?coordinate psv:P625 ?value.
      ?value wikibase:geoLatitude ?lat.
      ?value wikibase:geoLongitude ?lon.
      SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". }
    }
    LIMIT ${CACHE_SIZE}
  `;

  const url = `${WIKIDATA_ENDPOINT}?query=${encodeURIComponent(query)}`;
  const headers = { Accept: "application/sparql-results+json" };

  try {
    const res = await axios.get(url, { headers });
    const results = res.data.results.bindings;

    // Filtrar y transformar resultados válidos
    const fetchedCities = results
      .filter((r) => {
        const label = r.cityLabel?.value || "";
        return label && !/^Q\d+$/.test(label); // Descarta códigos como "Q1234"
      })
      .map((r) => ({
        name: r.cityLabel.value,
        lat: parseFloat(r.lat.value),
        lng: parseFloat(r.lon.value),
      }));

    cityCache = fetchedCities;
    isCachePopulated = true;

    if (fetchedCities.length === 0) {
      // Handle case where no valid cities are found if needed
    }

  } catch (error) {
    isCachePopulated = false;
    throw error;
  }
}

export async function fetchRandomCity() {
  if (!isCachePopulated) {
    try {
      await populateCityCache();
    } catch (error) {
      throw new Error(`Could not populate city cache: ${error.message}`);
    }
  }

  if (cityCache.length === 0) {
      throw new Error("City cache is empty after population attempt.");
  }

  // Elegir ciudad aleatoria de la caché
  const randomIndex = Math.floor(Math.random() * cityCache.length);
  return cityCache[randomIndex];
}

// Solo para testing
export function __setCityCacheForTest(mockedCities) {
  cityCache = mockedCities;
  isCachePopulated = cityCache.length > 0;
}

export function clearCityCache() {
    cityCache = [];
    isCachePopulated = false;
}