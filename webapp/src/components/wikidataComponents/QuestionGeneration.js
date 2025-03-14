class QuestionGeneration {
    constructor(setQuestion) {
        this.setQuestion = setQuestion;
        this.questionsCache = [];
        this.currentIndex = 0;
    }

    async fetchQuestions() {
        if (this.questionsCache.length === 0 || this.currentIndex + 4 > this.questionsCache.length) {
            this.questionsCache = await this.generateQuestions();
            this.currentIndex = 0;
        }

        const { answers, correct } = this.getNextQuestion();
        this.setQuestion({ answers, correct });
    }

    async generateQuestions() {
        const WikidataUrl = "https://query.wikidata.org/sparql";
        const sparqlQuery = `
            SELECT ?city ?cityLabel ?image WHERE {
                ?city wdt:P31 wd:Q515.
                ?city wdt:P18 ?image.
                SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
            }
            LIMIT 40`;

        const url = new URL(WikidataUrl);
        url.search = new URLSearchParams({
            query: sparqlQuery,
            format: "json"
        });

        try {
            const response = await fetch(url, {
                headers: { 'Accept': 'application/sparql-results+json' }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            return data.results.bindings
                .map(item => ({
                    city: item.cityLabel.value,
                    image: item.image.value
                }))
                .sort(() => Math.random() - 0.5);

        } catch (error) {
            console.error("Error fetching data:", error);
            return [];
        }
    }

    async getNextQuestion() {
        if (this.currentIndex + 4 > this.questionsCache.length) {
            console.warn("Recargando preguntas...");
            await this.fetchQuestions();
            return { answers: {}, correct: null };
        }

        let options = this.questionsCache.slice(this.currentIndex, this.currentIndex + 4);
        this.currentIndex += 4;

        let correctCity = options[Math.floor(Math.random() * options.length)];

        let answers = options.reduce((acc, item) => {
            acc[item.city] = item.image;
            return acc;
        }, {});

        return { answers, correct: correctCity.city };
    }
}

export default QuestionGeneration;
