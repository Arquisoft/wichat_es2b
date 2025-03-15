const express = require("express")
const mongoose = require("mongoose")
const axios = require("axios")

const Question = require("./models/question-model.js")
const Template = require("./models/template-model.js")

const data = require("./data/questions-templates.json")

const app = express()
const port = 8010

const NUMBER_OF_WRONG_ANSWERS = 3

app.use(express.json())

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/questionsDb';
const endpoint = 'https://query.wikidata.org/sparql';

mongoose.connect(mongoUri)
    .then(() => {return Template.deleteMany({})})
    .then(() => {return Template.insertMany(data)});

async function getTemplate(){
    const template = await Template.aggregate([{ $sample: { size: 1 } }]);
    return template[0];
}

async function sendQuery(template) {
    try {
        const settings = {
            headers: { Accept: 'application/sparql-results+json' },
            params: { query: template.query }
        }
        const data = await axios.get(endpoint, settings)
        return data
    } catch (error) {
        console.error("Error al enviar la query", error);
    return null;
    }
}

/**
 * Aux. function to generate random IDs.
 * @param {int} length Length of the original array 
 * @param {int} count Number of random IDs to generate
 * @returns {Array} Array containing the random IDs
 */
function genRandomIDs(length, count)
{
    let arr = Array.from({length: length}, (v, k) => k);

    for ( let i = arr.length - 1; i > 0; i-- )
    {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr.slice(0,count);
}

/**
 * Aux. function to shuffle an array.
 * @param {Array} array Array to shuffle 
 * @returns {Array} Shuffled array
 */
function shuffleArray(array)
{
    for ( let i = array.length - 1; i > 0; i-- )
    {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Given a full array of results and a question template, generates a question.
 * 
 * The returned question contains a title with the flag of the correct country
 * and a list of 4 shuffled answers - 1 correct and 3 incorrect.
 * @param {Array} results Array of Wikidata query results
 * @param {JSON} template Question template
 * @returns {JSON} Question data object
 */
async function generateQuestion(results, template)
{
    // Get 4 random answers - 1 correct and 3 incorrect
    const randomIDs = genRandomIDs(results.length, NUMBER_OF_WRONG_ANSWERS + 1);
        const correctID = randomIDs[0];           // Correct answer ID
        const incorrectIDs = randomIDs.slice(1);  // Incorrect answers IDs

    // Answers
    const correctAnswer = results[correctID];
    const incorrectAnswers = incorrectIDs.map(id => results[id]);

    // Shuffle answers
    const answers = shuffleArray([correctAnswer, ...incorrectAnswers]);

    // Compound returned JSON object
    const title = template.question.replace('*', correctAnswer.flag);
    const newQuestion = Question(
    {
        title: title,
        correctAnswer: correctAnswer.country,
        allAnswers: answers.map(ans => ans.country).join(',')
    });

    await newQuestion.save();
    return newQuestion;
}

// Test if service is active
app.get('/test', (req, res) => {
    res.json({ status: 'OK' });
})


app.get('/add-test', async (req, res) =>{
    const template = await getTemplate();
    const data = await sendQuery(template)
    const results = data.data.results.bindings.map(binding => {
        return {
            country: binding.countryLabel.value,
            flag: binding.flag_img.value
        }
    })
    const newQuestion = await generateQuestion(results, template)
    res.json(newQuestion)
});

const server = app.listen(port, () => {
    console.log(`Question Service listening at http://localhost:${port}`);
})

server.on('close', () => {
    // Close the Mongoose connection
    mongoose.connection.close();
});

module.exports = server