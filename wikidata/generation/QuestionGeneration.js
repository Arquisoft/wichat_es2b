class QuestionGeneration{


    generateQuestions() {
        const possibleCities = [];

        const WikidataUrl = "https://query.wikidata.org/sparql";

        //Query that extracts the name and image of 10 cities at random
        const sparqlQuery = `
        SELECT ?city ?cityLabel ?image WHERE {
            ?city wdt:P31 wd:Q515.  # Instancia de ciudad
            ?city wdt:P18 ?image.   # Imagen asociada a la ciudad
            SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
        }
        ORDER BY RAND()  # Orden aleatorio
        LIMIT 10  # Número de resultados`;

        const url = WikidataUrl + "?query=" + encodeURIComponent(sparqlQuery) + "&format=json";

        try {
            const response = fetch(url, {headers: {'Accept': 'application/sparql-results+json'}});
            const data = response.json();

            const results = {};
            data.results.bindings.forEach(item => {
                results[item.cityLabel.value] = item.image.value;
            });

            console.log(results);



            console.log(results);
            //En esta lista estan los nombres e imagenes
            return results;
        } catch (error) {
            console.error("Error fetching data:", error);
        }


    }

    shuffleAnswers() {
        let options = this.generateQuestions();

        let correct = Math.floor(Math.random() * 11);

    }
}

