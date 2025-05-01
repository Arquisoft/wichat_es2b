import { error } from "jquery";

class QuestionGeneration {
    constructor(setQuestion) {
        this.setQuestion = setQuestion;
        this.questionsCache = [];
        this.currentIndex = 0;
        this.isFetching = false;
        this.currentCity = null;
    }

    async fetchQuestions() {
        if (this.isFetching) return;
        this.isFetching = true;

        try {
            if (this.questionsCache.length === 0) {
                this.questionsCache = await this.generateQuestions();
                this.currentIndex = 0;
            }

            if (this.questionsCache.length > 0) {
                const question = this.getNextQuestion();
                if (question) {
                    this.setQuestion(question);
                } else {
                     await this.fetchQuestions();
                }
            }
        } catch (error) {
            console.error("Error fetching questions:", error);
             this.setQuestion(null);
        } finally {
            this.isFetching = false;
        }
    }

    async generateQuestions() {
        const WikidataUrl = "https://query.wikidata.org/sparql";
        const sparqlQuery = `
        SELECT DISTINCT ?city ?cityLabel ?image WHERE {
            ?city wdt:P31 wd:Q515.
            ?city wdt:P18 ?image.
            SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
            FILTER(STRSTARTS(STR(?image), "http"))
        }
        ORDER BY RAND()
        LIMIT 40`;

        try {
            const response = await fetch(`${WikidataUrl}?query=${encodeURIComponent(sparqlQuery)}`, {
                headers: { 'Accept': 'application/sparql-results+json' }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            return data.results.bindings
                .filter(item => item.cityLabel?.value && item.image?.value)
                .map(item => ({
                    city: item.cityLabel.value,
                    image: item.image.value
                }));
        } catch (error) {
            console.error("Wikidata API Error:", error);
            return [];
        }
    }

    getSecureRandom(max) {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] % max;
    }


    getNextQuestion() {
        if (this.currentIndex + 4 > this.questionsCache.length) {
             this.questionsCache = [];
             this.currentIndex = 0;
             return null;
        }

        const options = this.questionsCache.slice(this.currentIndex, this.currentIndex + 4);
        this.currentIndex += 4;

        const randomIndex = this.getSecureRandom(options.length);
        const correctCityData = options[randomIndex];
        this.currentCity = correctCityData.city;

        return {
            answers: Object.fromEntries(options.map(item => [item.city, item.image])),
            correct: correctCityData.city
        };
    }


    getCurrentCity() {
        return this.currentCity;
    }
}

export default QuestionGeneration;