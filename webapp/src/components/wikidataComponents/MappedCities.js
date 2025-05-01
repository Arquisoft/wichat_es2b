import axios from "axios";


let cityCache = []; // Lista de ciudades cargadas desde Wikidata

function getRandom(max) {
  let num = (Date.now() +'');
  num = parseInt(num.at(num.length-1));

  while(num > max){
    num -= max
  }

  return num/10;
}


export async function fetchRandomCity() {
  // Si ya hay ciudades en caché, elige una al azar
  if (cityCache.length > 0) {
    const randomIndex = Math.floor(getRandom(10) * cityCache.length);
    return cityCache[randomIndex];
  }

  // Consulta inicial a Wikidata
  const endpoint = "https://query.wikidata.org/sparql";
  const query = `
    SELECT ?city ?cityLabel ?lat ?lon WHERE {
      ?city wdt:P31/wdt:P279* wd:Q515.
      ?city p:P625 ?coordinate.
      ?coordinate psv:P625 ?value.
      ?value wikibase:geoLatitude ?lat.
      ?value wikibase:geoLongitude ?lon.
      SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". }
    }
    ORDER BY RAND()
    LIMIT 100
  `;

  const url = `${endpoint}?query=${encodeURIComponent(query)}`;
  const headers = { Accept: "application/sparql-results+json" };

  try {
    const res = await axios.get(url, { headers });
    const results = res.data.results.bindings;

    // Filtrar y transformar resultados válidos
    cityCache = results
        .filter((r) => {
          const label = r.cityLabel?.value || "";
          return label && !/^Q\d+$/.test(label); // Descarta códigos como "Q1234"
        })
        .map((r) => ({
          name: r.cityLabel.value,
          lat: parseFloat(r.lat.value),
          lng: parseFloat(r.lon.value),
        }));

    if (cityCache.length === 0) {
      throw new Error("No se encontraron nombres válidos.");
    }

    // Elegir ciudad aleatoria de la caché
    const randomIndex = Math.floor(getRandom(10) * cityCache.length);
    return cityCache[randomIndex];
  } catch (error) {
    console.error("Error al consultar Wikidata:", error);
    throw error;
  }
}

// Solo para testing
export function __setCityCacheForTest(mockedCities) {
  cityCache = mockedCities;
}




