const axios = require('axios');
const express = require('express');
const cors = require('cors');

const app = express();
const port = 8003;

app.use(cors());
app.use(express.json());

const gameSystemInstruction = "Actuarás como un juego de adivinanzas de ciudades. Recibirás mensajes con el siguiente formato: '<Ciudad>:<Mensaje del usuario>'. Tu objetivo es ayudar al usuario a adivinar la ciudad oculta, proporcionando pistas útiles y relevantes basadas en sus preguntas. Bajo ninguna circunstancia debes revelar el nombre de la ciudad, tampoco digas el nombre de ninguna ciudad en tus respuestas como al decir \"No no es <Nombre de ciudad>, puesto este mensaje será borrado por el filtro y el jugador descubrira que te pregunto sobre la ciudad correcta. Mantén las respuestas concisas y enfocadas en proporcionar pistas que ayuden al usuario a deducir la ciudad. Si el usuario hace una pregunta que no está relacionada con la adivinanza, responde de forma educada y vuelve a enfocar la conversación en el juego.";

const llmConfigs = {
  gemini: {
    url: (apiKey) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    transformRequest: (systemInstruction,question) => ({
      contents: [
        {
          parts: [
            { text: systemInstruction },
            { text: question }
          ]
        }
      ]
    }),
    transformResponse: (response) => response.data.candidates[0]?.content?.parts[0]?.text
  },
  empathy: {
    url: () => 'https://empathyai.prod.empathy.co/v1/chat/completions',
    transformRequest: (systemInstruction, question) => ({ // Added systemInstruction param for consistency, though not used by this model config
      model: "mistralai/Mistral-7B-Instruct-v0.3",
      messages: [
        // Note: The original empathy config didn't use the gameSystemInstruction.
        // If you want it to follow the game rules, you should inject it here.
        // Option 1: Keep it simple (original)
        // { role: "system", content: "You are a helpful assistant." },
        // Option 2: Inject game rules (Recommended for the game)
        { role: "system", content: gameSystemInstruction },
        { role: "user", content: question } // Send the full <City>:<Message> string
      ]
    }),
    transformResponse: (response) => response.data.choices[0]?.message?.content,
    headers: (apiKey) => ({
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    })
  }
};


function validateRequiredFields(req, requiredFields) {
    for (const field of requiredFields) {
        if (!(field in req.body)) {
            const error = new Error(`Missing required field: ${field}`);
            error.statusCode = 400;
            throw error;
        }
    }
}

async function sendQuestionToLLM(question, apiKey, model = 'gemini', systemInstruction = '') {
    try {
        const config = llmConfigs[model];
        if (!config) {
            throw new Error(`Model "${model}" is not supported.`);
        }

        const url = config.url(apiKey);
        // Pass the system instruction to transformRequest for all models
        const requestData = config.transformRequest(systemInstruction, question);

        const headers = {
            'Content-Type': 'application/json',
            ...(config.headers ? config.headers(apiKey) : {}),
        };

        console.log(`Sending request to ${model} at ${url}`);
        const response = await axios.post(url, requestData, { headers });

        console.log(`Raw response from ${model}:`, JSON.stringify(response.data, null, 2));

        const transformedResponse = config.transformResponse(response);

        if (transformedResponse === undefined || transformedResponse === null) {
             console.warn(`Transformed response from ${model} was null or undefined.`);
             return null;
        }

        return transformedResponse;

    } catch (error) {
        console.error(`Error sending question to ${model}:`, error);
        if (error.response) {
            console.error('LLM API Error Response Status:', error.response.status);
            console.error('LLM API Error Response Data:', error.response.data);
        } else if (error.request) {
            console.error('LLM API No Response Received:', error.request);
        } else {
            console.error('LLM API Request Setup Error:', error.message);
        }
        return null;
    }
}

function validateResponseDoesNotContainCity(response, cityName) {
    if (!response) {
        return 'Lo siento, no pude obtener una respuesta del asistente. Inténtalo de nuevo.';
    }
    const lowerCityName = String(cityName || '').toLowerCase();
    // Ensure lowerCityName is not empty before checking includes
    if (lowerCityName && response.toLowerCase().includes(lowerCityName)) {
        return 'Lo siento, tu pregunta ha revelado accidentalmente el nombre de la ciudad, por lo que he tenido que filtrarlo. ¿Tienes otra pregunta?';
    }
    return response;
}


app.post('/hint', async (req, res) => {
    try {
        console.log('Received /hint request:', req.body);

        console.log('Validating required fields...');
        validateRequiredFields(req, ['question', 'model', 'apiKey']);
        console.log('Validation passed.');

        const { question, model, apiKey } = req.body;

        if (!question || typeof question !== 'string' || !question.includes(':')) {
            return res.status(400).json({ error: 'Invalid question format. Expected "<CityName>:<UserQuery>".' });
        }
        const cityName = question.split(':')[0];
        console.log(`Question: ${question}`);
        console.log(`Model: ${model}`);
        console.log(`API Key: ${apiKey ? 'Provided' : 'Missing'}`);
        console.log(`City Name: ${cityName}`);

        console.log('Sending question to LLM...');
        // Pass the gameSystemInstruction explicitly
        let answer = await sendQuestionToLLM(question, apiKey, model, gameSystemInstruction);
        console.log('Received answer from LLM:', answer);

        const finalAnswer = validateResponseDoesNotContainCity(answer, cityName);
        console.log('Final answer after validation:', finalAnswer);

        res.json({ answer: finalAnswer });
        console.log('Response sent successfully.');

    } catch (error) {
        console.error('Error occurred in /hint route:', error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
             error: statusCode === 400 ? error.message : 'An internal server error occurred while processing your request.'
        });
    }
});

const server = app.listen(port, () => {
    console.log(`LLM Service listening at http://localhost:${port}`);
});

module.exports = server;