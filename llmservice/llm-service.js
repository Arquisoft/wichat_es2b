const axios = require('axios');
const express = require('express');

const app = express();
const port = 8003;

// Middleware to parse JSON in request body
app.use(express.json());

const gameSystemInstruction = "Actuarás como un juego de adivinanzas de ciudades. Recibirás mensajes con el siguiente formato: '<Ciudad>:<Mensaje del usuario>'. Tu objetivo es ayudar al usuario a adivinar la ciudad oculta, proporcionando pistas útiles y relevantes basadas en sus preguntas. Bajo ninguna circunstancia debes revelar el nombre de la ciudad, tampoco digas el nombre de ninguna ciudad en tus respuestas como al decir \"No no es <Nombre de ciudad>, puesto este mensaje será borrado por el filtro y el jugador descubrira que te pregunto sobre la ciudad correcta. Mantén las respuestas concisas y enfocadas en proporcionar pistas que ayuden al usuario a deducir la ciudad. Si el usuario hace una pregunta que no está relacionada con la adivinanza, responde de forma educada y vuelve a enfocar la conversación en el juego.";

// Define configurations for different LLM APIs
const llmConfigs = {
  gemini: {
    url: (apiKey) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    transformRequest: (systemInstruction,question) => ({
      contents: [
        {
          parts: [
            {
              text: systemInstruction
            },
            {
              text: question
            }
          ]
        }
      ]
    }),
    transformResponse: (response) => response.data.candidates[0]?.content?.parts[0]?.text
  },
  empathy: {
    //url: () => 'https://empathyai.staging.empathy.co/v1/chat/completions',
    url: () => 'https://empathyai.prod.empathy.co/v1/chat/completions',
    transformRequest: (question) => ({
      //model: "qwen/Qwen2.5-Coder-7B-Instruct",
      model: "mistralai/Mistral-7B-Instruct-v0.3",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: question }
      ]
    }),
    transformResponse: (response) => response.data.choices[0]?.message?.content,
    headers: (apiKey) => ({
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    })
  }
};

// Function to validate required fields in the request body
function validateRequiredFields(req, requiredFields) {
  for (const field of requiredFields) {
    if (!(field in req.body)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

// Generic function to send questions to LLM
async function sendQuestionToLLM(question, apiKey, model = 'gemini',systemInstruction = '') {
  try {
    const config = llmConfigs[model];
    if (!config) {
      throw new Error(`Model "${model}" is not supported.`);
    }

    const url = config.url(apiKey);
    const requestData = config.transformRequest(systemInstruction,question);

    const headers = {
      'Content-Type': 'application/json',
      ...(config.headers ? config.headers(apiKey) : {})
    };

    const response = await axios.post(url, requestData, { headers });

    return config.transformResponse(response);

  } catch (error) {
    console.error(`Error sending question to ${model}:`, error.message || error);
    return null;
  }
}

// Function to check if the response contains the city name
function validateResponseDoesNotContainCity(response, cityName) {
  if (response.toLowerCase().includes(cityName.toLowerCase())) {
    return "Lo siento, tu pregunta ha revelado accidentalmente el nombre de la ciudad, por lo que he tenido que filtrarlo. ¿Tienes otra pregunta?";
  }
  return response
}

app.post('/hint', async (req, res) => {
  try {
    //console.log('Received request:', req.body);

    // Check if required fields are present in the request body
    //console.log('Validating required fields...');
    validateRequiredFields(req, ['question', 'model', 'apiKey']);
    //console.log('Validation passed.');

    const { question, model, apiKey } = req.body;
    const cityName = question.split(':')[0]; // Extract the city name from the question
    //console.log(`Question: ${question}`);
    //console.log(`Model: ${model}`);
    //console.log(`API Key: ${apiKey}`);
    //console.log(`City Name: ${cityName}`);

    //console.log('Sending question to LLM...');
    let answer = await sendQuestionToLLM(question, apiKey, model, gameSystemInstruction);
    //console.log('Received answer from LLM:', answer);

    // Validate that the response does not contain the city name
    answer = validateResponseDoesNotContainCity(answer, cityName);

    res.json({ answer });
    //console.log('Response sent.');

  } catch (error) {
    console.log('Error occurred:', error.message);
    res.status(400).json({ error: 'An error occurred while processing your request.' });
  }
});


const server = app.listen(port, () => {
  console.log(`LLM Service listening at http://localhost:${port}`);
});

module.exports = server


