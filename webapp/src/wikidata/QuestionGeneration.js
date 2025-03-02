export default class QuestionGeneration {

    constructor(ui) {
        this.ui = ui;
        this.questionsCache = []; // Cache para almacenar preguntas
        this.currentIndex = 0;
    }

    //Inicializa la generacion (si no hay mas lugares en cache hace otra consulta, si hay la saca de ahi)
    async fetchQuestions() {
        if (this.questionsCache.length === 0) {
            this.questionsCache = await this.generateQuestions();
            this.currentIndex = 0;
        }

        const { answers, correct } = this.getNextQuestion();
        this.ui.renderQuestion(answers, correct);
    }

    //Consulta a wikidata para sacar imagenes y lugares
    async generateQuestions() {
        const WikidataUrl = "https://query.wikidata.org/sparql";
        const sparqlQuery = `
        SELECT ?city ?cityLabel ?image WHERE {
            ?city wdt:P31 wd:Q515.
            ?city wdt:P18 ?image.
            SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
        }
        ORDER BY RAND()
        LIMIT 41`; 

        try {
            const response = await fetch(WikidataUrl + "?query=" + encodeURIComponent(sparqlQuery) + "&format=json", {
                headers: { 'Accept': 'application/sparql-results+json' }
            });
            const data = await response.json();

            return data.results.bindings.map(item => ({
                city: item.cityLabel.value,
                image: item.image.value
            }));
        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }
    }

    //Saca datos de la cache siempre que haya aun imagenes en esta.
    getNextQuestion() {
        // Si quedan menos de 4 preguntas, recargamos antes de que se agoten
        if (this.currentIndex + 4 > this.questionsCache.length) {
            console.warn("Recargando preguntas...");
            this.questionsCache = [];
            this.fetchQuestions();
            return { answers: {}, correct: null };
        }
    
        let options = this.questionsCache.slice(this.currentIndex, this.currentIndex + 4);
        this.currentIndex += 4;
    
        // Aseguramos que haya exactamente 4 opciones
        while (options.length < 4 && this.currentIndex < this.questionsCache.length) {
            options.push(this.questionsCache[this.currentIndex]);
            this.currentIndex++;
        }
    
        let correctCity = options[Math.floor(Math.random() * options.length)];
    
        let answers = options.reduce((acc, item) => {
            acc[item.city] = item.image;
            return acc;
        }, {});
    
        return { answers, correct: correctCity.city };
    }
    
    //Comprueba resultados
    checkAnswer(selected, correct) {
        this.ui.showResult(selected === correct);
    }
}

